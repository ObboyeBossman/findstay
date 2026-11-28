package com.findstay.shared.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Single-line free text that must not carry markup or control characters (S1-06-T3). Rejects
 * {@code <} and {@code >}, which covers {@code <script>} tags, and any ASCII control character
 * including tabs and line breaks. Null passes; combine with {@code @NotBlank} where required.
 */
@Documented
@Constraint(validatedBy = SafeTextValidator.class)
@Target({ElementType.FIELD, ElementType.METHOD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface SafeText {

    String message() default "Cannot contain < or > characters or control characters";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
