package com.findstay.shared.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

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

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults()) // browser origins for /api/v1 (TA-02) — see CorsConfig
                .sessionManagement(sessions -> sessions.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/actuator/health", "/actuator/health/**", "/actuator/info").permitAll()
                        .requestMatchers("/api/v1/health").permitAll()
                        .anyRequest().authenticated())
                .oauth2ResourceServer(oauth -> oauth.jwt(Customizer.withDefaults()));
        return http.build();
    }
}
