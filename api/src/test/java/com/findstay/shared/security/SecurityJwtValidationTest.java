package com.findstay.shared.security;

import com.findstay.testing.Req;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.time.Instant;
import java.util.Date;
import java.util.Map;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Proves {@code S1-04-AC2} / {@code TA-07} / {@code TA-08}: protected endpoints validate
 * Supabase JWTs against JWKS and reject anonymous, malformed, expired, and wrong-issuer tokens.
 */
@Req("S1-04-AC2")
@WebMvcTest(SecurityJwtValidationTest.ProbeController.class)
@Import({SecurityConfig.class, CorsConfig.class, com.findstay.shared.time.TimeConfig.class,
        SecurityJwtValidationTest.ProbeController.class})
class SecurityJwtValidationTest {

    private static final String KEY_ID = "findstay-test-key-1";
    private static final RSAKey TEST_RSA_KEY;
    private static final HttpServer JWKS_SERVER;
    private static final String ISSUER;

    static {
        try {
            KeyPairGenerator gen = KeyPairGenerator.getInstance("RSA");
            gen.initialize(2048);
            KeyPair kp = gen.generateKeyPair();
            TEST_RSA_KEY = new RSAKey.Builder((RSAPublicKey) kp.getPublic())
                    .privateKey((RSAPrivateKey) kp.getPrivate())
                    .keyID(KEY_ID)
                    .build();

            String jwksJson = new JWKSet(TEST_RSA_KEY.toPublicJWK()).toString();
            JWKS_SERVER = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
            JWKS_SERVER.createContext("/auth/v1/.well-known/jwks.json", exchange -> {
                byte[] body = jwksJson.getBytes(StandardCharsets.UTF_8);
                exchange.getResponseHeaders().add("Content-Type", "application/json");
                exchange.sendResponseHeaders(200, body.length);
                try (OutputStream out = exchange.getResponseBody()) {
                    out.write(body);
                }
            });
            JWKS_SERVER.start();
            ISSUER = "http://127.0.0.1:" + JWKS_SERVER.getAddress().getPort() + "/auth/v1";
        } catch (Exception e) {
            throw new ExceptionInInitializerError(e);
        }
    }

    @DynamicPropertySource
    static void registerJwksProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.security.oauth2.resourceserver.jwt.jwk-set-uri",
                () -> ISSUER + "/.well-known/jwks.json");
        registry.add("findstay.auth.issuer", () -> ISSUER);
    }

    @AfterAll
    static void stopJwksServer() throws IOException {
        JWKS_SERVER.stop(0);
    }

    @Autowired
    private MockMvc mockMvc;

    @Test
    void rejectsAnonymousRequest() throws Exception {
        mockMvc.perform(get("/api/v1/security-probe"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void rejectsMalformedToken() throws Exception {
        mockMvc.perform(get("/api/v1/security-probe")
                        .header("Authorization", "Bearer not-a-valid-jwt"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void rejectsExpiredToken() throws Exception {
        String token = signToken(
                ISSUER,
                Instant.now().minusSeconds(600),
                Instant.now().minusSeconds(60));
        mockMvc.perform(get("/api/v1/security-probe")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void rejectsWrongIssuerToken() throws Exception {
        String token = signToken(
                "https://evil-issuer.example/auth/v1",
                Instant.now().minusSeconds(10),
                Instant.now().plusSeconds(3600));
        mockMvc.perform(get("/api/v1/security-probe")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void acceptsValidSignedToken() throws Exception {
        String token = signToken(
                ISSUER,
                Instant.now().minusSeconds(10),
                Instant.now().plusSeconds(3600));
        mockMvc.perform(get("/api/v1/security-probe")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sub").isNotEmpty());
    }

    private static String signToken(String issuer, Instant issuedAt, Instant expiresAt) throws Exception {
        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .subject(UUID.randomUUID().toString())
                .issuer(issuer)
                .issueTime(Date.from(issuedAt))
                .expirationTime(Date.from(expiresAt))
                .claim("email", "guest@findstay.gh")
                .build();
        SignedJWT jwt = new SignedJWT(
                new JWSHeader.Builder(JWSAlgorithm.RS256).keyID(KEY_ID).build(),
                claims);
        jwt.sign(new RSASSASigner(TEST_RSA_KEY));
        return jwt.serialize();
    }

    @RestController
    static class ProbeController {
        @GetMapping("/api/v1/security-probe")
        Map<String, String> probe(@AuthenticationPrincipal Jwt jwt) {
            return Map.of("sub", jwt.getSubject());
        }
    }
}
