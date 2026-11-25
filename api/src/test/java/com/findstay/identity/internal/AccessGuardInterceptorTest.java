package com.findstay.identity.internal;

import com.findstay.shared.error.AppException;
import com.findstay.shared.error.ErrorCode;
import com.findstay.shared.security.RequiresPermission;
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
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * S1-06-T2 acceptance: the permission check reads the database, suspended accounts are refused,
 * and unannotated routes are unaffected. Repository and account are mocked, so no database needed.
 */
class AccessGuardInterceptorTest {

    private static final UUID USER = UUID.fromString("01a16000-0000-7000-8000-00000000abcd");

    private UserAccountRepository accounts;
    private AccessGuardInterceptor guard;

    @BeforeEach
    void setUp() {
        accounts = mock(UserAccountRepository.class);
        guard = new AccessGuardInterceptor(accounts);
    }

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void unannotatedRouteWithoutTokenPasses() throws Exception {
        assertThat(invoke("open")).isTrue();
    }

    @Test
    void annotatedRouteWithoutTokenIsUnauthenticated() {
        assertThatThrownBy(() -> invoke("write"))
                .isInstanceOfSatisfying(AppException.class,
                        ex -> assertThat(ex.code()).isEqualTo(ErrorCode.UNAUTHENTICATED));
    }

    @Test
    void suspendedAccountIsForbiddenEvenOnUnannotatedRoute() {
        signIn(USER);
        UserAccount suspended = mock(UserAccount.class);
        when(suspended.isSuspended()).thenReturn(true);
        when(accounts.findById(USER)).thenReturn(Optional.of(suspended));

        assertThatThrownBy(() -> invoke("open"))
                .isInstanceOfSatisfying(AppException.class, ex -> {
                    assertThat(ex.code()).isEqualTo(ErrorCode.FORBIDDEN);
                    assertThat(ex.getMessage()).isEqualTo(AccessGuardInterceptor.SUSPENDED_MESSAGE);
                });
    }

    @Test
    void activeAccountWithGrantedPermissionPasses() throws Exception {
        signIn(USER);
        UserAccount active = mock(UserAccount.class);
        when(active.isSuspended()).thenReturn(false);
        when(accounts.findById(USER)).thenReturn(Optional.of(active));
        when(accounts.hasPermission(USER, "listing.write")).thenReturn(true);

        assertThat(invoke("write")).isTrue();
    }

    @Test
    void activeAccountWithoutGrantIsForbidden() {
        signIn(USER);
        UserAccount active = mock(UserAccount.class);
        when(active.isSuspended()).thenReturn(false);
        when(accounts.findById(USER)).thenReturn(Optional.of(active));
        when(accounts.hasPermission(USER, "listing.write")).thenReturn(false);

        assertThatThrownBy(() -> invoke("write"))
                .isInstanceOfSatisfying(AppException.class, ex -> {
                    assertThat(ex.code()).isEqualTo(ErrorCode.FORBIDDEN);
                    assertThat(ex.getMessage()).isEqualTo(AccessGuardInterceptor.DENIED_MESSAGE);
                });
    }

    @Test
    void annotatedRouteWithoutLocalAccountIsForbidden() {
        signIn(USER);
        when(accounts.findById(USER)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> invoke("write")).isInstanceOf(AppException.class);
        verify(accounts, never()).hasPermission(USER, "listing.write");
    }

    @Test
    void unannotatedRouteWithoutLocalAccountPassesSoProvisioningCanCreateIt() throws Exception {
        signIn(USER);
        when(accounts.findById(USER)).thenReturn(Optional.empty());

        assertThat(invoke("open")).isTrue();
    }

    @Test
    void classLevelAnnotationAppliesToEveryMethod() {
        signIn(USER);
        UserAccount active = mock(UserAccount.class);
        when(active.isSuspended()).thenReturn(false);
        when(accounts.findById(USER)).thenReturn(Optional.of(active));
        when(accounts.hasPermission(USER, "audit.read")).thenReturn(false);

        HandlerMethod handler = new HandlerMethod(new ClassAnnotatedController(), "toString");
        assertThatThrownBy(() -> guard.preHandle(new MockHttpServletRequest(),
                new MockHttpServletResponse(), handler)).isInstanceOf(AppException.class);
    }

    @Test
    void subjectThatIsNotAUuidIsUnauthenticated() {
        SecurityContextHolder.getContext().setAuthentication(new JwtAuthenticationToken(
                Jwt.withTokenValue("token").header("alg", "RS256").subject("not-a-uuid").build(),
                List.of()));

        assertThatThrownBy(() -> invoke("open"))
                .isInstanceOfSatisfying(AppException.class,
                        ex -> assertThat(ex.code()).isEqualTo(ErrorCode.UNAUTHENTICATED));
    }

    private boolean invoke(String methodName) throws Exception {
        HandlerMethod handler = new HandlerMethod(new SampleController(), methodName);
        return guard.preHandle(new MockHttpServletRequest(), new MockHttpServletResponse(), handler);
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

    @RequiresPermission("audit.read")
    static class ClassAnnotatedController {
    }
}
