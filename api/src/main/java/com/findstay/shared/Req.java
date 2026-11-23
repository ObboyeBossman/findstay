package com.findstay.shared;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Requirement traceability annotation to map tests to specific requirement IDs.
 * (e.g., @Req("FR-71"), @Req("NFR-24")).
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface Req {
    String value();
}
