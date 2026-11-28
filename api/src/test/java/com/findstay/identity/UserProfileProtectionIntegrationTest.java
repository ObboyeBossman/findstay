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
 * Proves {@code S1-05-AC1}, {@code S1-05-AC2}, and {@code FR-04} (Task {@code S1-05-T5}):
 * <ul>
 *   <li>A signed-in user can view and edit only their own profile details.</li>
 *   <li>Cross-user isolation: User A's token cannot mutate or read User B's profile.</li>
 *   <li>Email is immutable via {@code PATCH /api/v1/me}.</li>
 *   <li>Validation rejects invalid phone numbers and blank names.</li>
 *   <li>Account lookup for password recovery verifies existence without exposing sensitive data.</li>
 * </ul>
 */
@Req("S1-05-AC2")
@AutoConfigureMockMvc
class UserProfileProtectionIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private EntityManager entityManager;

    @Test
    void crossUserProfileProtectionUserCannotAlterAnotherProfile() throws Exception {
        UUID userAId = UUID.randomUUID();
        UUID userBId = UUID.randomUUID();

        // 1. Provision User A
        mockMvc.perform(post("/api/v1/auth/provision")
                        .with(jwt().jwt(builder -> builder
                                .subject(userAId.toString())
                                .claim("email", "usera@example.com")
                                .claim("user_metadata", Map.of(
                                        "full_name", "User A Original",
                                        "phone", "+233241111111")))))
                .andExpect(status().isOk());

        // 2. Provision User B
        mockMvc.perform(post("/api/v1/auth/provision")
                        .with(jwt().jwt(builder -> builder
                                .subject(userBId.toString())
                                .claim("email", "userb@example.com")
                                .claim("user_metadata", Map.of(
                                        "full_name", "User B Target",
                                        "phone", "+233242222222")))))
                .andExpect(status().isOk());

        entityManager.flush();
        entityManager.clear();

        // 3. User A calls PATCH /api/v1/me to change their name and phone
        mockMvc.perform(patch("/api/v1/me")
                        .with(jwt().jwt(builder -> builder
                                .subject(userAId.toString())
                                .claim("email", "usera@example.com")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "User A Modified",
                                  "phone": "+233249999999"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(userAId.toString()))
                .andExpect(jsonPath("$.fullName").value("User A Modified"))
                .andExpect(jsonPath("$.phone").value("+233249999999"));

        entityManager.flush();
        entityManager.clear();

        // 4. Verify User B's profile in the database is completely untouched
        String userBName = jdbc.queryForObject(
                "SELECT full_name FROM identity.user_profile WHERE user_id = ?",
                String.class, userBId);
        String userBPhone = jdbc.queryForObject(
                "SELECT phone FROM identity.user_profile WHERE user_id = ?",
                String.class, userBId);

        assertThat(userBName).isEqualTo("User B Target");
        assertThat(userBPhone).isEqualTo("+233242222222");

        // 5. User A calling GET /api/v1/me only receives User A's data
        mockMvc.perform(get("/api/v1/me")
                        .with(jwt().jwt(builder -> builder
                                .subject(userAId.toString())
                                .claim("email", "usera@example.com"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.profile.id").value(userAId.toString()))
                .andExpect(jsonPath("$.profile.fullName").value("User A Modified"))
                .andExpect(jsonPath("$.profile.email").value("usera@example.com"));
    }

    @Test
    void emailCannotBeAlteredViaPatchMe() throws Exception {
        UUID userId = UUID.randomUUID();

        // Provision user with official email
        mockMvc.perform(post("/api/v1/auth/provision")
                        .with(jwt().jwt(builder -> builder
                                .subject(userId.toString())
                                .claim("email", "legitimate@example.com")
                                .claim("user_metadata", Map.of("full_name", "Legit User")))))
                .andExpect(status().isOk());

        // Attempting to pass an 'email' field in PATCH /me body must not alter the email
        mockMvc.perform(patch("/api/v1/me")
                        .with(jwt().jwt(builder -> builder
                                .subject(userId.toString())
                                .claim("email", "legitimate@example.com")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "Legit User Renamed",
                                  "email": "hacked@example.com"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("legitimate@example.com"));

        // Verify database row for account and profile retain the original email
        String accountEmail = jdbc.queryForObject(
                "SELECT email FROM identity.user_account WHERE id = ?",
                String.class, userId);
        assertThat(accountEmail).isEqualTo("legitimate@example.com");
    }

    @Test
    void profileUpdateRejectsInvalidInputs() throws Exception {
        UUID userId = UUID.randomUUID();

        // 1. Blank full name rejected
        mockMvc.perform(patch("/api/v1/me")
                        .with(jwt().jwt(builder -> builder
                                .subject(userId.toString())
                                .claim("email", "test@example.com")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "fullName": "   "
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));

        // 2. Non-Ghana phone rejected
        mockMvc.perform(patch("/api/v1/me")
                        .with(jwt().jwt(builder -> builder
                                .subject(userId.toString())
                                .claim("email", "test@example.com")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "phone": "+14155552671"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));

        // 3. Unsupported language rejected
        mockMvc.perform(patch("/api/v1/me")
                        .with(jwt().jwt(builder -> builder
                                .subject(userId.toString())
                                .claim("email", "test@example.com")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "preferredLanguage": "fr"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));
    }

    @Test
    void accountLookupForPasswordRecoveryDoesNotExposeSensitiveData() throws Exception {
        UUID userId = UUID.randomUUID();

        // Provision user with phone and metadata
        mockMvc.perform(post("/api/v1/auth/provision")
                        .with(jwt().jwt(builder -> builder
                                .subject(userId.toString())
                                .claim("email", "recovery@example.com")
                                .claim("user_metadata", Map.of(
                                        "full_name", "Recovery Target",
                                        "phone", "+233243333333")))))
                .andExpect(status().isOk());

        // Password recovery lookup should only confirm existence and display name, never phone or IDs
        mockMvc.perform(post("/api/v1/auth/lookup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "recovery@example.com"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exists").value(true))
                .andExpect(jsonPath("$.displayName").value("Recovery Target"))
                .andExpect(jsonPath("$.phone").doesNotExist())
                .andExpect(jsonPath("$.id").doesNotExist())
                .andExpect(jsonPath("$.roles").doesNotExist());

        // Non-existent recovery email returns exists: false gracefully without leakage
        mockMvc.perform(post("/api/v1/auth/lookup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "nonexistent@example.com"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exists").value(false))
                .andExpect(jsonPath("$.displayName").doesNotExist());
    }
}
