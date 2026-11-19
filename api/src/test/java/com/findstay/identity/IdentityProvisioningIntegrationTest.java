package com.findstay.identity;

import com.findstay.testing.AbstractIntegrationTest;
import com.findstay.testing.Req;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Proves {@code S1-04-AC1} and {@code DEC-S1-01/A} / {@code DEC-S1-04/B} against real
 * PostgreSQL: idempotent provisioning, lazy {@code GET /api/v1/me}, {@code PATCH /api/v1/me},
 * and suspended-account rejection.
 */
@Req("S1-04-AC1")
@AutoConfigureMockMvc
class IdentityProvisioningIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private EntityManager entityManager;

    @Test
    void provisionCreatesAccountAndProfileIdempotently() throws Exception {
        UUID userId = UUID.randomUUID();

        mockMvc.perform(post("/api/v1/auth/provision")
                        .with(jwt().jwt(builder -> builder
                                .subject(userId.toString())
                                .claim("email", "Ama.Mensah@example.com")
                                .claim("user_metadata", Map.of(
                                        "full_name", "Ama Mensah",
                                        "phone", "+233241234567")))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.profile.id").value(userId.toString()))
                .andExpect(jsonPath("$.profile.email").value("ama.mensah@example.com"))
                .andExpect(jsonPath("$.profile.fullName").value("Ama Mensah"))
                .andExpect(jsonPath("$.profile.phone").value("+233241234567"))
                .andExpect(jsonPath("$.profile.preferredLanguage").value("en"))
                .andExpect(jsonPath("$.consent.policyVersion").value("1"));

        // Second call must be idempotent and leave exactly one row.
        mockMvc.perform(post("/api/v1/auth/provision")
                        .with(jwt().jwt(builder -> builder
                                .subject(userId.toString())
                                .claim("email", "ama.mensah@example.com"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.profile.id").value(userId.toString()));

        Integer count = jdbc.queryForObject(
                "SELECT count(*) FROM identity.user_account WHERE id = ?",
                Integer.class, userId);
        assertThat(count).isEqualTo(1);
    }

    @Test
    void getMeLazyProvisionsMissingAccount() throws Exception {
        UUID userId = UUID.randomUUID();

        mockMvc.perform(get("/api/v1/me")
                        .with(jwt().jwt(builder -> builder
                                .subject(userId.toString())
                                .claim("email", "kwame@example.com"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.profile.id").value(userId.toString()))
                .andExpect(jsonPath("$.profile.email").value("kwame@example.com"))
                .andExpect(jsonPath("$.profile.fullName").value("kwame"));
    }

    @Test
    void patchMeUpdatesProfileAndValidatesPhone() throws Exception {
        UUID userId = UUID.randomUUID();

        mockMvc.perform(patch("/api/v1/me")
                        .with(jwt().jwt(builder -> builder
                                .subject(userId.toString())
                                .claim("email", "kofi@example.com")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "Kofi Boateng",
                                  "phone": "+233551234567",
                                  "preferredLanguage": "en"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Kofi Boateng"))
                .andExpect(jsonPath("$.phone").value("+233551234567"));

        mockMvc.perform(patch("/api/v1/me")
                        .with(jwt().jwt(builder -> builder
                                .subject(userId.toString())
                                .claim("email", "kofi@example.com")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "phone": "not-a-ghana-phone"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));
    }

    @Test
    void suspendedAccountIsRejectedWithForbidden() throws Exception {
        UUID userId = UUID.randomUUID();

        mockMvc.perform(post("/api/v1/auth/provision")
                        .with(jwt().jwt(builder -> builder
                                .subject(userId.toString())
                                .claim("email", "suspended@example.com"))))
                .andExpect(status().isOk());

        jdbc.update("UPDATE identity.user_account SET status = 'SUSPENDED' WHERE id = ?", userId);
        entityManager.flush();
        entityManager.clear();

        mockMvc.perform(get("/api/v1/me")
                        .with(jwt().jwt(builder -> builder
                                .subject(userId.toString())
                                .claim("email", "suspended@example.com"))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    void anonymousMeRequestIsRejected() throws Exception {
        mockMvc.perform(get("/api/v1/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void lookupReturnsExistenceAndDisplayNameWithoutAuth() throws Exception {
        UUID userId = UUID.randomUUID();

        mockMvc.perform(post("/api/v1/auth/provision")
                        .with(jwt().jwt(builder -> builder
                                .subject(userId.toString())
                                .claim("email", "abraham@example.com")
                                .claim("user_metadata", Map.of("full_name", "Abraham Bossman")))))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/auth/lookup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "email": "ABRAHAM@EXAMPLE.COM" }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exists").value(true))
                .andExpect(jsonPath("$.displayName").value("Abraham Bossman"));

        mockMvc.perform(post("/api/v1/auth/lookup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "email": "unknown@example.com" }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exists").value(false));
    }
}
