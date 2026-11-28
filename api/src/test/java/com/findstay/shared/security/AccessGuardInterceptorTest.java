package com.findstay.shared.security;

import com.findstay.shared.error.AppException;
import com.findstay.shared.error.ErrorCode;
import com.findstay.shared.security.PermissionLookup.AccountAccess;
import com.findstay.testing.Req;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.method.HandlerMethod;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/**
 * S1-06-T2 acceptance: permissions come from the database lookup on every request, suspended
 * accounts are refused immediately, {@code /api/v1/admin/**} is admin-only, and unannotated routes
 * are unaffected. The lookup is mocked, so no database is needed.
 */
@Req("FR-07")
class AccessGuardInterceptorTest {

    private static final UUID USER = UUID.fromString("01a16000-0000-7000-8000-00000000abcd");
    private static final String ADMIN_URI = "/api/v1/admin/users";
    private static final String OPEN_URI = "/api/v1/me";

    private PermissionLookup lookup;
    private AccessGuardInterceptor guard;

    @BeforeEach
    void setUp() {
        lookup = mock(PermissionLookup.class);
        guard = new AccessGuardInterceptor(lookup);
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void unannotatedRouteWithoutTokenPasses() throws Exception {
        assertThat(invoke("open", OPEN_URI, null)).isTrue();
    }

    @Test
    void annotatedRouteWithoutTokenIsUnauthenticated() {
        assertThatThrownBy(() -> invoke("write", OPEN_URI, null))
                .isInstanceOfSatisfying(AppException.class,
                        ex -> assertThat(ex.code()).isEqualTo(ErrorCode.UNAUTHENTICATED));
    }

    @Test
    void adminRouteWithoutTokenIsUnauthenticated() {
        assertThatThrownBy(() -> invoke("open", ADMIN_URI, null))
                .isInstanceOfSatisfying(AppException.class,
                        ex -> assertThat(ex.code()).isEqualTo(ErrorCode.UNAUTHENTICATED));
    }

    @Test
    void suspendedAccountIsForbiddenEvenOnUnannotatedRoute() {
        signIn(USER);
        when(lookup.accessFor(USER)).thenReturn(Optional.of(access("OWNER", true, Set.of("listing.write"))));

        assertThatThrownBy(() -> invoke("open", OPEN_URI, null))
                .isInstanceOfSatisfying(AppException.class, ex -> {
                    assertThat(ex.code()).isEqualTo(ErrorCode.FORBIDDEN);
                    assertThat(ex.getMessage()).isEqualTo(AccessGuardInterceptor.SUSPENDED_MESSAGE);
                });
    }

    @Test
    void activeAccountWithGrantedPermissionPasses() throws Exception {
        signIn(USER);
        when(lookup.accessFor(USER)).thenReturn(Optional.of(access("OWNER", false, Set.of("listing.write"))));

        assertThat(invoke("write", OPEN_URI, null)).isTrue();
    }

    @Test
    void activeAccountWithoutGrantIsForbidden() {
        signIn(USER);
        when(lookup.accessFor(USER)).thenReturn(Optional.of(access("STAFF", false, Set.of("listing.read"))));

        assertThatThrownBy(() -> invoke("write", OPEN_URI, null))
                .isInstanceOfSatisfying(AppException.class, ex -> {
                    assertThat(ex.code()).isEqualTo(ErrorCode.FORBIDDEN);
                    assertThat(ex.getMessage()).isEqualTo(AccessGuardInterceptor.DENIED_MESSAGE);
                });
    }

    @Test
    void annotatedRouteWithoutLocalAccountIsForbidden() {
        signIn(USER);
        when(lookup.accessFor(USER)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> invoke("write", OPEN_URI, null)).isInstanceOf(AppException.class);
    }

    @Test
    void unannotatedRouteWithoutLocalAccountPassesSoProvisioningCanCreateIt() throws Exception {
        signIn(USER);
        when(lookup.accessFor(USER)).thenReturn(Optional.empty());

        assertThat(invoke("open", OPEN_URI, null)).isTrue();
    }

    @Test
    void classLevelAnnotationAppliesToEveryMethod() throws Exception {
        signIn(USER);
        when(lookup.accessFor(USER)).thenReturn(Optional.of(access("OWNER", false, Set.of("listing.read"))));

        HandlerMethod handler = new HandlerMethod(new ClassAnnotatedController(), "toString");
        assertThatThrownBy(() -> guard.preHandle(request(OPEN_URI), new MockHttpServletResponse(), handler))
                .isInstanceOf(AppException.class);
    }

    @Test
    void subjectThatIsNotAUuidIsUnauthenticated() {
        SecurityContextHolder.getContext().setAuthentication(new JwtAuthenticationToken(
                Jwt.withTokenValue("token").header("alg", "RS256").subject("not-a-uuid").build(),
                List.of()));

        assertThatThrownBy(() -> invoke("open", OPEN_URI, null))
                .isInstanceOfSatisfying(AppException.class,
                        ex -> assertThat(ex.code()).isEqualTo(ErrorCode.UNAUTHENTICATED));
    }

    @Test
    void ownerIsForbiddenOnAdminRoutes() {
        signIn(USER);
        when(lookup.accessFor(USER)).thenReturn(Optional.of(access("OWNER", false, Set.of("listing.write"))));

        assertThatThrownBy(() -> invoke("open", ADMIN_URI, null))
                .isInstanceOfSatisfying(AppException.class,
                        ex -> assertThat(ex.code()).isEqualTo(ErrorCode.FORBIDDEN));
    }

    @Test
    void adminIsAllowedOnAdminRoutes() throws Exception {
        signIn(USER);
        when(lookup.accessFor(USER)).thenReturn(Optional.of(access("ADMIN", false, Set.of("admin.user.read"))));

        assertThat(invoke("open", ADMIN_URI, null)).isTrue();
    }

    @Test
    void adminRouteWithoutLocalAccountIsForbidden() {
        signIn(USER);
        when(lookup.accessFor(USER)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> invoke("open", ADMIN_URI, null)).isInstanceOf(AppException.class);
    }

    @Test
    void resolvedAccessIsStoredOnTheRequestForTheRestOfTheCall() throws Exception {
        signIn(USER);
        AccountAccess resolved = access("OWNER", false, Set.of("listing.read"));
        when(lookup.accessFor(USER)).thenReturn(Optional.of(resolved));
        MockHttpServletRequest request = request(OPEN_URI);

        guard.preHandle(request, new MockHttpServletResponse(),
                new HandlerMethod(new SampleController(), "open"));

        assertThat(request.getAttribute(CurrentUser.ACCESS_ATTRIBUTE)).isEqualTo(resolved);
    }

    private boolean invoke(String methodName, String uri, Object unused) throws Exception {
        HandlerMethod handler = new HandlerMethod(new SampleController(), methodName);
        return guard.preHandle(request(uri), new MockHttpServletResponse(), handler);
    }

    private static MockHttpServletRequest request(String uri) {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", uri);
        request.setRequestURI(uri);
        return request;
    }

    private static AccountAccess access(String role, boolean suspended, Set<String> permissions) {
        return new AccountAccess(role, suspended, permissions);
    }

    private static void signIn(UUID userId) {
        Jwt jwt = Jwt.withTokenValue("token")
                .header("alg", "RS256")
                .subject(userId.toString())
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(300))
                .build();
        SecurityContextHolder.getContext().setAuthentication(new JwtAuthenticationToken(jwt, List.of()));
    }

    /** Stand-in controller carrying the annotations the guard inspects. */
    static class SampleController {

        public void open() {
        }

        @RequiresPermission("listing.write")
        public void write() {
        }
    }

    @RequiresPermission("admin.audit.read")
    static class ClassAnnotatedController {
    }
}
