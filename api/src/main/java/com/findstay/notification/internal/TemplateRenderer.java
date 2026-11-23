package com.findstay.notification.internal;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Robust template placeholder rendering engine for notification messages.
 * Replaces {{placeholder}} tokens with values from the event data map.
 * Safely handles missing placeholders and special regex characters.
 */
@Component
public class TemplateRenderer {

    private static final Pattern PLACEHOLDER_PATTERN = Pattern.compile("\\{\\{\\s*([a-zA-Z0-9_.-]+)\\s*\\}\\}");

    /**
     * Renders a text template with variables from the provided data map.
     * Missing placeholders are safely cleared to avoid leaking raw tokens.
     */
    public String render(String template, Map<String, Object> values) {
        if (template == null) {
            return null;
        }
        if (values == null || values.isEmpty()) {
            return PLACEHOLDER_PATTERN.matcher(template).replaceAll("");
        }

        Matcher matcher = PLACEHOLDER_PATTERN.matcher(template);
        StringBuilder sb = new StringBuilder();

        while (matcher.find()) {
            String placeholderKey = matcher.group(1);
            Object value = values.get(placeholderKey);
            String replacement = value != null ? Matcher.quoteReplacement(String.valueOf(value)) : "";
            matcher.appendReplacement(sb, replacement);
        }
        matcher.appendTail(sb);

        return sb.toString();
    }

    /**
     * Renders both subject and body from a NotificationTemplate entity.
     */
    public RenderedMessage render(NotificationTemplate template, Map<String, Object> values) {
        if (template == null) {
            return new RenderedMessage(null, null);
        }
        String renderedSubject = render(template.getSubjectTemplate(), values);
        String renderedBody = render(template.getBodyTemplate(), values);
        return new RenderedMessage(renderedSubject, renderedBody);
    }
}
