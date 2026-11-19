package com.findstay.identity.internal;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

/**
 * Optional server-side lookup against the Supabase Auth Admin API ({@code auth.users})
 * used as a fallback by {@link IdentityProvisioningService#lookupAccount(String)} when an
 * account exists in Supabase Auth before being provisioned in {@code identity.user_account}.
 */
@Component
class SupabaseAuthLookupClient {

    private static final Logger log = LoggerFactory.getLogger(SupabaseAuthLookupClient.class);

    private final String supabaseUrl;
    private final String serviceRoleKey;
    private final RestClient restClient;

    SupabaseAuthLookupClient(
            @Value("${findstay.auth.supabase-url:}") String supabaseUrl,
            @Value("${findstay.auth.supabase-service-role-key:}") String serviceRoleKey) {
        this.supabaseUrl = trimTrailingSlash(supabaseUrl);
        this.serviceRoleKey = serviceRoleKey == null ? "" : serviceRoleKey.trim();
        this.restClient = RestClient.create();
    }

    boolean isConfigured() {
        return !supabaseUrl.isEmpty() && !serviceRoleKey.isEmpty();
    }

    Optional<SupabaseAuthUser> findByEmail(String normalizedEmail) {
        if (!isConfigured() || normalizedEmail == null || normalizedEmail.isBlank()) {
            return Optional.empty();
        }

        String uri = UriComponentsBuilder
                .fromHttpUrl(supabaseUrl + "/auth/v1/admin/users")
                .queryParam("filter", normalizedEmail)
                .queryParam("page", 1)
                .queryParam("per_page", 50)
                .toUriString();

        try {
            AdminUsersResponse response = restClient.get()
                    .uri(uri)
                    .header("apikey", serviceRoleKey)
                    .header("Authorization", "Bearer " + serviceRoleKey)
                    .retrieve()
                    .body(AdminUsersResponse.class);

            if (response == null || response.users() == null) {
                return Optional.empty();
            }

            String target = normalizedEmail.trim().toLowerCase(Locale.ROOT);
            return response.users().stream()
                    .filter(u -> u.email() != null && u.email().trim().toLowerCase(Locale.ROOT).equals(target))
                    .findFirst()
                    .map(u -> new SupabaseAuthUser(u.email().trim().toLowerCase(Locale.ROOT), extractDisplayName(u.userMetadata())));
        } catch (Exception ex) {
            log.warn("Supabase Auth admin lookup failed: {}", ex.getMessage());
            return Optional.empty();
        }
    }

    private static String extractDisplayName(Map<String, Object> metadata) {
        if (metadata == null) {
            return null;
        }
        for (String key : List.of("full_name", "name")) {
            Object raw = metadata.get(key);
            if (raw instanceof String str && !str.isBlank()) {
                return str.trim();
            }
        }
        return null;
    }

    private static String trimTrailingSlash(String value) {
        if (value == null) {
            return "";
        }
        String trimmed = value.trim();
        while (trimmed.endsWith("/")) {
            trimmed = trimmed.substring(0, trimmed.length() - 1);
        }
        return trimmed;
    }

    record SupabaseAuthUser(String email, String displayName) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record AdminUsersResponse(List<AdminUser> users) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record AdminUser(
            String email,
            @JsonProperty("user_metadata") Map<String, Object> userMetadata) {}
}
