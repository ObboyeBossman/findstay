package com.findstay.shared.security;

import com.findstay.shared.security.PermissionLookup.AccountAccess;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;

import java.util.Optional;
import java.util.UUID;

/**
 * The signed-in user for the current request (S1-06-T2).
 *
 * <p>The id comes only from the verified JWT {@code sub} claim. The access state is the one the
 * guard resolved from the database for this request; it is never read from request headers or
 * body fields.
 */
public final class CurrentUser {

    /** Request attribute where the guard stores the resolved {@link AccountAccess}. */
    static final String ACCESS_ATTRIBUTE = CurrentUser.class.getName() + ".ACCESS";

    private CurrentUser() {
    }

    /** The verified user id, or empty when the request is not authenticated with a valid subject. */
    public static Optional<UUID> id() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (!(authentication instanceof JwtAuthenticationToken jwt)) {
            return Optional.empty();
        }
        try {
            return Optional.of(UUID.fromString(jwt.getToken().getSubject()));
        } catch (IllegalArgumentException | NullPointerException e) {
            return Optional.empty();
        }
    }

    /** The database-resolved account state for this request, when the guard has run. */
    public static Optional<AccountAccess> access() {
        RequestAttributes attributes = RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            return Optional.empty();
        }
        Object value = attributes.getAttribute(ACCESS_ATTRIBUTE, RequestAttributes.SCOPE_REQUEST);
        return value instanceof AccountAccess access ? Optional.of(access) : Optional.empty();
    }
}
