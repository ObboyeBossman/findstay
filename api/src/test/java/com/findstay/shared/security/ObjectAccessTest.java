package com.findstay.shared.security;

import com.findstay.shared.error.AppException;
import com.findstay.shared.error.ErrorCode;
import com.findstay.shared.security.PermissionLookup.AccountAccess;
import com.findstay.testing.Req;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/** S1-06-T2: object-level ownership checks. Owners and admins pass; everyone else is refused. */
@Req("FR-07")
class ObjectAccessTest {

    private static final UUID OWNER = UUID.fromString("01a16000-0000-7000-8000-000000000001");
    private static final UUID OTHER = UUID.fromString("01a16000-0000-7000-8000-000000000002");

    @AfterEach
    void clearContexts() {
        SecurityContextHolder.clearContext();
        RequestContextHolder.resetRequestAttributes();
    }

    @Test
    void requireOwnerAllowsTheOwner() {
        assertThatCode(() -> ObjectAccess.requireOwner(OWNER, OWNER)).doesNotThrowAnyException();
    }

    @Test
    void requireOwnerRefusesAnotherUser() {
        assertThatThrownBy(() -> ObjectAccess.requireOwner(OTHER, OWNER))
                .isInstanceOfSatisfying(AppException.class,
                        ex -> assertThat(ex.code()).isEqualTo(ErrorCode.FORBIDDEN));
    }

    @Test
    void requireOwnerRefusesMissingIds() {
        assertThatThrownBy(() -> ObjectAccess.requireOwner(null, OWNER)).isInstanceOf(AppException.class);
        assertThatThrownBy(() -> ObjectAccess.requireOwner(OWNER, null)).isInstanceOf(AppException.class);
    }

    @Test
    void requireSelfOrAdminAllowsTheOwnerOfTheRecord() {
        signIn(OWNER);
        bindRequest(access("OWNER"));

        assertThatCode(() -> ObjectAccess.requireSelfOrAdmin(OWNER)).doesNotThrowAnyException();
    }

    @Test
    void requireSelfOrAdminAllowsAnAdminOnSomeoneElsesRecord() {
        signIn(OTHER);
        bindRequest(access("ADMIN"));

        assertThatCode(() -> ObjectAccess.requireSelfOrAdmin(OWNER)).doesNotThrowAnyException();
    }

    @Test
    void requireSelfOrAdminRefusesANonAdminOnSomeoneElsesRecord() {
        signIn(OTHER);
        bindRequest(access("OWNER"));

        assertThatThrownBy(() -> ObjectAccess.requireSelfOrAdmin(OWNER))
                .isInstanceOfSatisfying(AppException.class,
                        ex -> assertThat(ex.code()).isEqualTo(ErrorCode.FORBIDDEN));
    }

    @Test
    void requireSelfOrAdminRefusesWhenNothingIsSignedIn() {
        bindRequest(access("OWNER"));

        assertThatThrownBy(() -> ObjectAccess.requireSelfOrAdmin(OWNER)).isInstanceOf(AppException.class);
    }

    private static AccountAccess access(String role) {
        return new AccountAccess(role, false, Set.of());
    }

    private static void bindRequest(AccountAccess access) {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setAttribute(CurrentUser.ACCESS_ATTRIBUTE, access);
        RequestContextHolder.setRequestAttributes(new ServletRequestAttributes(request));
    }

    private static void signIn(UUID userId) {
        Jwt jwt = Jwt.withTokenValue("token").header("alg", "RS256").subject(userId.toString()).build();
        SecurityContextHolder.getContext().setAuthentication(new JwtAuthenticationToken(jwt, List.of()));
    }
}
