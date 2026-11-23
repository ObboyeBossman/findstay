package com.findstay.shared;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

public final class SecurityUtils {

    private SecurityUtils() {}

    /**
     * Resolves the authenticated caller's UUID strictly from the JWT `sub` claim.
     * Prevents insecure direct object referencing (IDOR) per NFR-24.
     */
    public static UUID getRequiredUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthenticated request");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof Jwt jwt) {
            String sub = jwt.getSubject();
            if (sub != null && !sub.isBlank()) {
                try {
                    return UUID.fromString(sub);
                } catch (IllegalArgumentException e) {
                    throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "JWT subject is not a valid UUID: " + sub);
                }
            }
        }

        // Support standard principal name if using mock authentication in tests
        try {
            return UUID.fromString(authentication.getName());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Caller identity is not a valid UUID: " + authentication.getName());
        }
    }
}
