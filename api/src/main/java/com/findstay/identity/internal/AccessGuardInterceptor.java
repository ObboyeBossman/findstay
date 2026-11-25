package com.findstay.identity.internal;

import com.findstay.shared.error.AppException;
import com.findstay.shared.security.RequiresPermission;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Optional;
import java.util.UUID;

/**
 * Enforces the account-status and permission rules on every controller method (S1-06-T2).
 *
 * <ol>
 *   <li><b>Active account.</b> A signed-in caller whose account is suspended is refused with
 *       403, on every route. A caller with no local account yet is allowed through, so that
 *       provisioning can create it.</li>
 *   <li><b>Permission.</b> If the method (or its controller) declares
 *       {@link RequiresPermission}, the caller's role must hold that code in
 *       {@code identity.role_permission}. No account, or no grant, is a 403. No token on such
 *       a route is a 401.</li>
 * </ol>
 *
 * <p>Routes without a JWT, such as {@code POST /api/v1/auth/lookup}, are untouched unless they
 * declare a permission, in which case they require a token.
 */
class AccessGuardInterceptor implements HandlerInterceptor {

    static final String SUSPENDED_MESSAGE = "This account has been suspended";
    static final String DENIED_MESSAGE = "You do not have permission to do this";

    private final UserAccountRepository accounts;

    AccessGuardInterceptor(UserAccountRepository accounts) {
        this.accounts = accounts;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (!(handler instanceof HandlerMethod method)) {
            return true;
        }
        Optional<String> required = requiredPermission(method);
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (!(authentication instanceof JwtAuthenticationToken jwt)) {
            if (required.isPresent()) {
                throw AppException.unauthenticated("Authentication is required");
            }
            return true;
        }

        UUID userId = subjectOf(jwt);
        Optional<UserAccount> account = accounts.findById(userId);
        if (account.isPresent() && account.get().isSuspended()) {
            throw AppException.forbidden(SUSPENDED_MESSAGE);
        }
        if (required.isPresent()
                && (account.isEmpty() || !accounts.hasPermission(userId, required.get()))) {
            throw AppException.forbidden(DENIED_MESSAGE);
        }
        return true;
    }

    static Optional<String> requiredPermission(HandlerMethod method) {
        RequiresPermission onMethod = method.getMethodAnnotation(RequiresPermission.class);
        if (onMethod != null) {
            return Optional.of(onMethod.value());
        }
        RequiresPermission onType = method.getBeanType().getAnnotation(RequiresPermission.class);
        return Optional.ofNullable(onType).map(RequiresPermission::value);
    }

    private static UUID subjectOf(JwtAuthenticationToken jwt) {
        try {
            return UUID.fromString(jwt.getToken().getSubject());
        } catch (IllegalArgumentException | NullPointerException e) {
            throw AppException.unauthenticated("Authentication is required");
        }
    }
}
