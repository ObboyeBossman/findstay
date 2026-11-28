package com.findstay.admin.internal;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.findstay.testing.AbstractIntegrationTest;
import com.findstay.testing.Req;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Full-stack PostgreSQL verification for Story {@code S1-16} ({@code T2}, {@code T3}, {@code T4},
 * {@code T6}): Admin Dashboard KPIs, user create/suspend/restore with immediate JWT access block,
 * platform settings + feature-flag validation with old→new value audit logging, and admin-only RBAC.
 */
@Req("UR-A01")
@AutoConfigureMockMvc
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class AdminOperationsIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private ObjectMapper objectMapper;

    private UUID adminId;
    private UUID ownerId;
    private UUID guestId;

    @BeforeEach
    void setUp() {
        adminId = UUID.randomUUID();
        ownerId = UUID.randomUUID();
        guestId = UUID.randomUUID();

        seedUser(adminId, "ops-admin-" + adminId + "@findstay.gh", "ADMIN", "Kwesi Admin");
        seedUser(ownerId, "ops-owner-" + ownerId + "@findstay.gh", "OWNER", "Efua Owner");
        seedUser(guestId, "ops-guest-" + guestId + "@findstay.gh", "GUEST", "Kojo Guest");
    }

    @Test
    @Req("FR-87")
    void adminCanCreateSearchSuspendImmediatelyBlockAndRestoreUsersWithAuditTrail() throws Exception {
        String newEmail = "created-" + UUID.randomUUID() + "@findstay.gh";

        // 1. Admin creates a new user account -> 201 + audited
        MvcResult createdRes = mockMvc.perform(post("/api/v1/admin/users")
                        .with(jwt().jwt(j -> j.subject(adminId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "%s",
                                  "displayName": "Kofi NewOwner",
                                  "phone": "+233244112233",
                                  "role": "OWNER"
                                }
                                """.formatted(newEmail)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value(newEmail))
                .andExpect(jsonPath("$.roleCode").value("OWNER"))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andReturn();
        UUID createdUserId = UUID.fromString(
                objectMapper.readTree(createdRes.getResponse().getContentAsString()).get("id").asText()
        );

        // Search finds the created user
        mockMvc.perform(get("/api/v1/admin/users")
                        .param("q", newEmail)
                        .with(jwt().jwt(j -> j.subject(adminId.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(1))
                .andExpect(jsonPath("$.items[0].id").value(createdUserId.toString()));

        // Active user can call protected endpoint /api/v1/me/notifications
        mockMvc.perform(get("/api/v1/me/notifications")
                        .with(jwt().jwt(j -> j.subject(createdUserId.toString()))))
                .andExpect(status().isOk());

        // Self-suspension blocked (422)
        mockMvc.perform(post("/api/v1/admin/users/{userId}/suspend", adminId)
                        .with(jwt().jwt(j -> j.subject(adminId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"reason": "Attempting to suspend myself"}
                                """))
                .andExpect(status().isUnprocessableEntity());

        // Short suspension reason blocked (422)
        mockMvc.perform(post("/api/v1/admin/users/{userId}/suspend", createdUserId)
                        .with(jwt().jwt(j -> j.subject(adminId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"reason": "too short"}
                                """))
                .andExpect(status().isUnprocessableEntity());

        // 2. Suspend user with mandatory reason -> immediately blocked on protected routes!
        mockMvc.perform(post("/api/v1/admin/users/{userId}/suspend", createdUserId)
                        .with(jwt().jwt(j -> j.subject(adminId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"reason": "Repeated policy violation during pilot review"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUSPENDED"));

        // Immediate block even with unexpired valid JWT (403 FORBIDDEN)
        mockMvc.perform(get("/api/v1/me/notifications")
                        .with(jwt().jwt(j -> j.subject(createdUserId.toString()))))
                .andExpect(status().isForbidden());

        // Dashboard reflects at least 1 suspended user
        mockMvc.perform(get("/api/v1/admin/dashboard")
                        .with(jwt().jwt(j -> j.subject(adminId.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.suspendedUsersCount").value(org.hamcrest.Matchers.greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.totalUsersCount").value(org.hamcrest.Matchers.greaterThanOrEqualTo(4)));

        // 3. Restore user -> immediately regains access + audited
        mockMvc.perform(post("/api/v1/admin/users/{userId}/restore", createdUserId)
                        .with(jwt().jwt(j -> j.subject(adminId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"note": "Compliance resolved by owner"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"));

        mockMvc.perform(get("/api/v1/me/notifications")
                        .with(jwt().jwt(j -> j.subject(createdUserId.toString()))))
                .andExpect(status().isOk());

        // Verify all 3 audit events recorded in audit.audit_log
        for (String action : new String[]{"user.admin_created", "user.suspended", "user.restored"}) {
            Integer count = jdbc.queryForObject(
                    "SELECT count(*) FROM audit.audit_log WHERE actor_id = ? AND action = ? AND entity_id = ?",
                    Integer.class,
                    adminId, action, createdUserId.toString()
            );
            assertThat(count).isEqualTo(1);
        }
    }

    @Test
    @Req("FR-92")
    void platformSettingsValidateValuesAndRecordOldAndNewValuesInAuditLog() throws Exception {
        // Seeded settings present (V1_13) with feature flags default false (C7)
        mockMvc.perform(get("/api/v1/admin/settings")
                        .with(jwt().jwt(j -> j.subject(adminId.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(org.hamcrest.Matchers.greaterThanOrEqualTo(3)));

        // Invalid boolean on feature flag rejected (400)
        mockMvc.perform(put("/api/v1/admin/settings/flag.notifications.sms")
                        .with(jwt().jwt(j -> j.subject(adminId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"value": "maybe"}
                                """))
                .andExpect(status().isBadRequest());

        // Update privacy.policy_version 1 -> 2 via PUT
        mockMvc.perform(put("/api/v1/admin/settings/privacy.policy_version")
                        .with(jwt().jwt(j -> j.subject(adminId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"value": "2"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.value").value("2"));

        // Toggle feature flag via PATCH
        mockMvc.perform(patch("/api/v1/admin/settings")
                        .with(jwt().jwt(j -> j.subject(adminId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"key": "flag.notifications.sms", "value": "true"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.value").value("true"));

        // Verify oldValue & newValue recorded in audit.audit_log
        String metaJson = jdbc.queryForObject(
                """
                SELECT metadata_json::text
                FROM audit.audit_log
                WHERE actor_id = ? AND action = 'platform.setting_updated' AND entity_id = 'privacy.policy_version'
                ORDER BY created_at DESC LIMIT 1
                """,
                String.class,
                adminId
        );
        var metaNode = objectMapper.readTree(metaJson);
        assertThat(metaNode.get("oldValue").asText()).isEqualTo("1");
        assertThat(metaNode.get("newValue").asText()).isEqualTo("2");

        // Restore defaults so other tests see clean state
        jdbc.update("UPDATE admin.platform_setting SET value = '1' WHERE key = 'privacy.policy_version'");
        jdbc.update("UPDATE admin.platform_setting SET value = 'false' WHERE key = 'flag.notifications.sms'");
    }

    @Test
    @Req("UR-A08")
    void nonAdminsAreBlockedFromDashboardUsersAndSettings() throws Exception {
        for (UUID nonAdmin : new UUID[]{ownerId, guestId}) {
            mockMvc.perform(get("/api/v1/admin/dashboard")
                            .with(jwt().jwt(j -> j.subject(nonAdmin.toString()))))
                    .andExpect(status().isForbidden());
            mockMvc.perform(get("/api/v1/admin/users")
                            .with(jwt().jwt(j -> j.subject(nonAdmin.toString()))))
                    .andExpect(status().isForbidden());
            mockMvc.perform(get("/api/v1/admin/settings")
                            .with(jwt().jwt(j -> j.subject(nonAdmin.toString()))))
                    .andExpect(status().isForbidden());
        }
    }

    private void seedUser(UUID userId, String email, String roleCode, String fullName) {
        UUID roleId = jdbc.queryForObject(
                "SELECT id FROM identity.role WHERE code = ?",
                UUID.class,
                roleCode
        );
        jdbc.update(
                """
                INSERT INTO identity.user_account (id, email, role_id, status, created_at, updated_at)
                VALUES (?, ?, ?, 'ACTIVE', now(), now())
                """,
                userId, email, roleId
        );
        jdbc.update(
                """
                INSERT INTO identity.user_profile (user_id, full_name, updated_at)
                VALUES (?, ?, now())
                """,
                userId, fullName
        );
    }
}
