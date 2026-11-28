package com.findstay.notification.internal;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Pure, safe mustache-style {@code {{key}}} template renderer ({@code S1-10-T3}).
 * Replaces known placeholders with their string values and strips unknown placeholders cleanly
 * without ever evaluating expressions.
 */
final class TemplateRenderer {

    private static final Pattern PLACEHOLDER = Pattern.compile("\\{\\{\\s*([a-zA-Z0-9_.-]+)\\s*}}");

    private TemplateRenderer() {
    }

    static String render(String template, Map<String, Object> variables) {
        if (template == null || template.isEmpty()) {
            return "";
        }
        Map<String, Object> safeVars = variables == null ? Map.of() : variables;
        Matcher matcher = PLACEHOLDER.matcher(template);
        StringBuilder out = new StringBuilder(template.length());
        while (matcher.find()) {
            String key = matcher.group(1);
            Object val = safeVars.get(key);
            String replacement = val == null ? "" : String.valueOf(val);
            matcher.appendReplacement(out, Matcher.quoteReplacement(replacement));
        }
        matcher.appendTail(out);
        return out.toString().replaceAll("\\s{2,}", " ").trim();
    }
}
