package com.findstay.shared.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Locale;

public final class SafeHttpUrlValidator implements ConstraintValidator<SafeHttpUrl, String> {

    private static final int MAX_LENGTH = 2048;

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isBlank()) {
            return true;
        }
        String candidate = value.trim();
        if (candidate.length() > MAX_LENGTH || TextRules.hasControlOrWhitespace(candidate)) {
            return false;
        }
        try {
            URI uri = new URI(candidate);
            String scheme = uri.getScheme();
            if (scheme == null) {
                return false;
            }
            String lower = scheme.toLowerCase(Locale.ROOT);
            boolean webScheme = lower.equals("https") || lower.equals("http");
            return webScheme && uri.getHost() != null && !uri.getHost().isBlank();
        } catch (URISyntaxException ex) {
            return false;
        }
    }
}
