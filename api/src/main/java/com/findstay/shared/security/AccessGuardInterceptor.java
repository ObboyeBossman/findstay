package com.findstay.shared.security;

import com.findstay.shared.error.AppException;
import com.findstay.shared.security.PermissionLookup.AccountAccess;
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
 * Enforces account status, admin-route access and {@link RequiresPermission} on every controller
 * method (S1-06-T2). Every decision is made from the database on the current request, so a
 * revoked permission or a suspension takes effect immediately, before the JWT expires.
 *
 * <ol>
 *   <li><b>Suspension.</b> A signed-in caller whose account is suspended is refused with 403 on
 *       every route.</li>
 *   <li><b>Admin routes.</b> Anything under {@code /api/v1/admin/} requires the ADMIN role. Any
 *       other role, or no account, is 403.</li>
 *   <li><b>Permission.</b> A method (or controller) annotated with {@link RequiresPermission} needs
 *       that code in the caller's role. No account or no grant is 403. No token is 401.</li>
 * </ol>
 *
 * <p>A signed-in caller with no local account yet is allowed through unannotated routes, so that
 * provisioning can create the account.
 */
class AccessGuardInterceptor implements HandlerInterceptor {

    static final String ADMIN_ROOT_PATH = "/api/v1/admin";
    static final String ADMIN_PATH_PREFIX = "/api/v1/admin/";
    static final String SUSPENDED_MESSAGE = "This account has been suspended";
    static final String DENIED_MESSAGE = "You do not have permission to do this";

    private final PermissionLookup lookup;

    AccessGuardInterceptor(PermissionLookup lookup) {
        this.lookup = lookup;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (!(handler instanceof HandlerMethod method)) {
            return true;
        }
        Optional<String> required = requiredPermission(method);
        String uri = request.getRequestURI();
        boolean adminRoute = ADMIN_ROOT_PATH.equals(uri) || uri.startsWith(ADMIN_PATH_PREFIX);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (!(authentication instanceof JwtAuthenticationToken)) {
            if (required.isPresent() || adminRoute) {
                throw AppException.unauthenticated("Authentication is required");
            }
            return true;
        }

        UUID userId = CurrentUser.id()
                .orElseThrow(() -> AppException.unauthenticated("Authentication is required"));
        Optional<AccountAccess> access = lookup.accessFor(userId);
        access.ifPresent(resolved -> request.setAttribute(CurrentUser.ACCESS_ATTRIBUTE, resolved));

        if (access.isPresent() && access.get().suspended()) {
            throw AppException.forbidden(SUSPENDED_MESSAGE);
        }
        if (adminRoute && (access.isEmpty() || !access.get().isAdmin())) {
            throw AppException.forbidden(DENIED_MESSAGE);
        }
        if (required.isPresent() && (access.isEmpty() || !access.get().has(required.get()))) {
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
}
