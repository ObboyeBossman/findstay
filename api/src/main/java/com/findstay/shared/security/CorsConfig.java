package com.findstay.shared.security;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Browser access to the API (TA-02): the website's origin is allowed to call
 * `/api/v1/...`. Without this, the browser blocks every response — the exact
 * gap the S1-01-T16 end-to-end proof caught on staging (the footer
 * SystemStatus fetched `/api/v1/health`, the server answered 200, and the
 * browser refused to hand the answer to the page).
 *
 * <p>Origins are configuration, not code: `findstay.cors.allowed-origins`
 * defaults to the local dev server and the staging website; production adds
 * its origin when the hosting story (S1-02) wires the domain. Credentials
 * stay off — the API is a bearer-token API, not a cookie API.
 */
@Configuration
public class CorsConfig {

    @Bean
    CorsConfigurationSource corsConfigurationSource(
            @Value("${findstay.cors.allowed-origins}") List<String> allowedOrigins) {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(allowedOrigins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
