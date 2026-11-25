package com.findstay.shared.security;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Declares the permission code a controller method (or every method of a controller) needs.
 *
 * <p>The check is table-driven: the enforcing interceptor reads
 * {@code identity.role_permission} for the caller's role on every request, so granting or
 * revoking a permission is a data change, never a code change (S1-06-T2). A caller whose
 * account is suspended is refused before any permission is considered.
 *
 * <p>Enforcement lives in {@code identity.internal}; this annotation only declares intent,
 * so feature modules can use it without depending on identity's internals.
 *
 * <pre>{@code
 * @RequiresPermission("listing.write")
 * @PatchMapping("/owner/properties/{id}")
 * ResponseEntity<...> update(...) { ... }
 * }</pre>
 */
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD, ElementType.TYPE})
public @interface RequiresPermission {

    /** A module-prefixed permission code, for example {@code listing.write}. */
    String value();
}
