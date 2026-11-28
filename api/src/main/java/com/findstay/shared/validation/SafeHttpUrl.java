package com.findstay.shared.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * An optional absolute {@code http} or {@code https} URL (S1-06-T3). Blocks {@code javascript:},
 * {@code data:} and every other scheme, plus whitespace, control characters and URLs over 2048
 * characters. Blank or null values pass: presence is a separate rule for the field.
 */
@Documented
@Constraint(validatedBy = SafeHttpUrlValidator.class)
@Target({ElementType.FIELD, ElementType.METHOD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface SafeHttpUrl {

    String message() default "Must be an http or https URL";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
