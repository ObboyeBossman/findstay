package com.findstay.shared.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;

/**
 * The platform's single HTTP security rule (S1-01-T11, for T16's proof):
 *
 * <ul>
 *   <li>public: the health surfaces — {@code /actuator/health},
 *       {@code /actuator/info} (build identity for deploy verification) and
 *       {@code GET /api/v1/health} (what the website's SystemStatus and the
 *       CI deploy check call);</li>
 *   <li>everything else requires a valid Supabase JWT (validated via JWKS —
 *       {@code spring.security.oauth2.resourceserver.jwt.jwk-set-uri}).</li>
 * </ul>
 *
 * <p>Stateless API: no sessions, no CSRF (no cookies are used); auth is the
 * Authorization bearer header only. Business endpoints arriving with their
 * stories add their authorization rules on top of {@code anyRequest()
 * .authenticated()}, never below it.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Security headers (S1-06-T3) on every response. The API returns JSON only, so the CSP
     * forbids all loading and framing; HSTS tells browsers to use HTTPS for a year.
     *
     * <p>When {@code findstay.security.require-https} is true (the {@code prod} profile), plain
     * HTTP requests are redirected to HTTPS. The platform terminates TLS in front of the app and
     * forwards the original scheme, so {@code server.forward-headers-strategy=framework} must be set.
     */
    @Bean
    SecurityFilterChain filterChain(
            HttpSecurity http,
            @Value("${findstay.security.require-https:false}") boolean requireHttps) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults()) // browser origins for /api/v1 (TA-02) — see CorsConfig
                .sessionManagement(sessions -> sessions.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .headers(headers -> headers
                        .contentTypeOptions(Customizer.withDefaults())
                        .frameOptions(frame -> frame.deny())
                        .contentSecurityPolicy(csp -> csp.policyDirectives(
                                "default-src 'none'; frame-ancestors 'none'; base-uri 'none'"))
                        .referrerPolicy(ref -> ref.policy(
                                ReferrerPolicyHeaderWriter.ReferrerPolicy.NO_REFERRER))
                        .httpStrictTransportSecurity(hsts -> hsts
                                .includeSubDomains(true)
                                .maxAgeInSeconds(31_536_000)))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/actuator/health", "/actuator/health/**", "/actuator/info").permitAll()
                        .requestMatchers("/api/v1/health").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/lookup").permitAll()
                        .anyRequest().authenticated())
                .oauth2ResourceServer(oauth -> oauth.jwt(Customizer.withDefaults()));
        if (requireHttps) {
            http.requiresChannel(channel -> channel.anyRequest().requiresSecure());
        }
        return http.build();
    }

    /**
     * Validates Supabase JWT signatures via JWKS (supporting RS256 and ES256) and
     * enforces both timestamp validity (exp/nbf) and the expected issuer claim (TA-07, TA-08).
     */
    @Bean
    JwtDecoder jwtDecoder(
            @Value("${spring.security.oauth2.resourceserver.jwt.jwk-set-uri}") String jwkSetUri,
            @Value("${findstay.auth.issuer:}") String configuredIssuer) {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(jwkSetUri)
                .jwsAlgorithms(algs -> {
                    algs.add(SignatureAlgorithm.RS256);
                    algs.add(SignatureAlgorithm.ES256);
                })
                .build();
        String issuer = resolveIssuer(jwkSetUri, configuredIssuer);
        OAuth2TokenValidator<Jwt> validator = (issuer != null && !issuer.isBlank())
                ? JwtValidators.createDefaultWithIssuer(issuer)
                : JwtValidators.createDefault();
        decoder.setJwtValidator(validator);
        return decoder;
    }

    private static String resolveIssuer(String jwkSetUri, String configuredIssuer) {
        if (configuredIssuer != null && !configuredIssuer.isBlank()) {
            return configuredIssuer.trim();
        }
        String suffix = "/.well-known/jwks.json";
        if (jwkSetUri != null && jwkSetUri.endsWith(suffix)) {
            return jwkSetUri.substring(0, jwkSetUri.length() - suffix.length());
        }
        return null;
    }
}
