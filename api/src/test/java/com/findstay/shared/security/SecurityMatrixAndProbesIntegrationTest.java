package com.findstay.shared.security;

import com.findstay.testing.AbstractIntegrationTest;
import com.findstay.testing.Req;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Full-stack security verification suite for {@code S1-06-T5}:
 * <ul>
 *   <li>Role-by-endpoint matrix against real PostgreSQL {@code V1_16} permissions across
 *       {@code GUEST}, {@code OWNER}, {@code STAFF}, {@code ADMIN}, unauthenticated callers,
 *       and suspended accounts.</li>
 *   <li>IDOR probes across user profiles, {@link ObjectAccess#requireSelfOrAdmin}, and
 *       cross-organisation updates.</li>
 *   <li>SQL injection probes against lookup, profile, and organisation endpoints.</li>
 *   <li>XSS and unsafe URL probes across profile and organisation mutations.</li>
 *   <li>Security HTTP headers verification on real full-stack responses.</li>
 * </ul>
 */
@Req("FR-07")
@AutoConfigureMockMvc
@Import(SecurityMatrixAndProbesIntegrationTest.ProbeConfig.class)
class SecurityMatrixAndProbesIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private EntityManager entityManager;

    @TestConfiguration
    static class ProbeConfig {
        @Bean
        SecurityProbeController securityProbeController() {
            return new SecurityProbeController();
        }
    }

    @RestController
    static class SecurityProbeController {

        @GetMapping("/api/v1/admin")
        Map<String, String> adminRoot() {
            return Map.of("area", "admin-root");
        }

        @RequiresPermission("admin.dashboard.read")
        @GetMapping("/api/v1/admin/probe-dashboard")
        Map<String, String> adminDashboard() {
            return Map.of("area", "admin-dashboard");
        }

        @RequiresPermission("org.staff.manage")
        @GetMapping("/api/v1/probe/org-staff-manage")
        Map<String, String> manageStaff() {
            return Map.of("action", "org.staff.manage");
        }

        @RequiresPermission("listing.write")
        @GetMapping("/api/v1/probe/listing-write")
        Map<String, String> writeListing() {
            return Map.of("action", "listing.write");
        }

        @RequiresPermission("profile.read")
        @GetMapping("/api/v1/probe/records/{ownerId}")
        Map<String, String> readUserRecord(@PathVariable UUID ownerId) {
            ObjectAccess.requireSelfOrAdmin(ownerId);
            return Map.of("ownerId", ownerId.toString());
        }
    }

    private UUID seedAccount(String email, String fullName, String roleCode, String status) {
        UUID userId = UUID.randomUUID();
        UUID roleId = jdbc.queryForObject(
                "SELECT id FROM identity.role WHERE code = ?", UUID.class, roleCode);
        Timestamp now = Timestamp.from(Instant.now());
        jdbc.update(
                "INSERT INTO identity.user_account (id, email, role_id, status, created_at, updated_at) "
                        + "VALUES (?, ?, ?, ?, ?, ?)",
                userId, email, roleId, status, now, now);
        jdbc.update(
                "INSERT INTO identity.user_profile (user_id, full_name, preferred_language, updated_at) "
                        + "VALUES (?, ?, 'en', ?)",
                userId, fullName, now);
        return userId;
    }

    private UUID seedOrganization(UUID ownerId, String name, String email) {
        UUID orgId = UUID.randomUUID();
        UUID membershipId = UUID.randomUUID();
        Timestamp now = Timestamp.from(Instant.now());
        jdbc.update(
                "INSERT INTO organization.organization (id, name, display_name, contact_email, verification_status, created_at, updated_at) "
                        + "VALUES (?, ?, ?, ?, 'NOT_SUBMITTED', ?, ?)",
                orgId, name, name, email, now, now);
        jdbc.update(
                "INSERT INTO organization.membership (id, organization_id, user_id, role, is_primary_owner, joined_at) "
                        + "VALUES (?, ?, ?, 'OWNER', true, ?)",
                membershipId, orgId, ownerId, now);
        return orgId;
    }

    private void addStaffMembership(UUID orgId, UUID staffId) {
        jdbc.update(
                "INSERT INTO organization.membership (id, organization_id, user_id, role, is_primary_owner, joined_at) "
                        + "VALUES (?, ?, ?, 'STAFF', false, ?)",
                UUID.randomUUID(), orgId, staffId, Timestamp.from(Instant.now()));
    }

    @Test
    @Req("FR-07")
    void roleByEndpointMatrixEnforcesRealDatabasePermissionsAcrossAllFourRoles() throws Exception {
        UUID guestId = seedAccount("matrix.guest@example.com", "Matrix Guest", "GUEST", "ACTIVE");
        UUID ownerId = seedAccount("matrix.owner@example.com", "Matrix Owner", "OWNER", "ACTIVE");
        UUID staffId = seedAccount("matrix.staff@example.com", "Matrix Staff", "STAFF", "ACTIVE");
        UUID adminId = seedAccount("matrix.admin@example.com", "Matrix Admin", "ADMIN", "ACTIVE");
        UUID suspendedAdminId = seedAccount("matrix.suspended@example.com", "Suspended Admin", "ADMIN", "SUSPENDED");

        UUID ownerOrgId = seedOrganization(ownerId, "Matrix Harbour Suites", "matrix.owner@example.com");
        addStaffMembership(ownerOrgId, staffId);

        // 1. Unauthenticated caller gets 401 on protected routes.
        mockMvc.perform(get("/api/v1/me")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/v1/admin")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/v1/admin/probe-dashboard")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/v1/owner/org")).andExpect(status().isUnauthorized());

        // 2. /api/v1/me exposes accurate V1_16 roles and permissions per role.
        mockMvc.perform(get("/api/v1/me").with(jwt().jwt(b -> b.subject(guestId.toString()).claim("email", "matrix.guest@example.com"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("GUEST"))
                .andExpect(jsonPath("$.permissions", hasItem("profile.read")))
                .andExpect(jsonPath("$.permissions", not(hasItem("org.read"))))
                .andExpect(jsonPath("$.permissions", not(hasItem("admin.dashboard.read"))));

        mockMvc.perform(get("/api/v1/me").with(jwt().jwt(b -> b.subject(staffId.toString()).claim("email", "matrix.staff@example.com"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("STAFF"))
                .andExpect(jsonPath("$.permissions", hasItem("listing.write")))
                .andExpect(jsonPath("$.permissions", not(hasItem("org.staff.manage"))))
                .andExpect(jsonPath("$.permissions", not(hasItem("verification.read"))));

        mockMvc.perform(get("/api/v1/me").with(jwt().jwt(b -> b.subject(adminId.toString()).claim("email", "matrix.admin@example.com"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ADMIN"))
                .andExpect(jsonPath("$.permissions", hasItem("admin.dashboard.read")))
                .andExpect(jsonPath("$.permissions", hasItem("media.private.read")));

        // 3. Admin routes (/api/v1/admin and /api/v1/admin/**): ONLY active ADMIN is allowed.
        for (UUID denied : List.of(guestId, ownerId, staffId, suspendedAdminId)) {
            mockMvc.perform(get("/api/v1/admin").with(jwt().jwt(b -> b.subject(denied.toString()))))
                    .andExpect(status().isForbidden())
                    .andExpect(jsonPath("$.code").value("FORBIDDEN"));
            mockMvc.perform(get("/api/v1/admin/probe-dashboard").with(jwt().jwt(b -> b.subject(denied.toString()))))
                    .andExpect(status().isForbidden())
                    .andExpect(jsonPath("$.code").value("FORBIDDEN"));
        }
        mockMvc.perform(get("/api/v1/admin").with(jwt().jwt(b -> b.subject(adminId.toString()))))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/admin/probe-dashboard").with(jwt().jwt(b -> b.subject(adminId.toString()))))
                .andExpect(status().isOk());

        // 4. @RequiresPermission("org.staff.manage"): OWNER only.
        mockMvc.perform(get("/api/v1/probe/org-staff-manage").with(jwt().jwt(b -> b.subject(ownerId.toString()))))
                .andExpect(status().isOk());
        for (UUID denied : List.of(guestId, staffId, adminId, suspendedAdminId)) {
            mockMvc.perform(get("/api/v1/probe/org-staff-manage").with(jwt().jwt(b -> b.subject(denied.toString()))))
                    .andExpect(status().isForbidden());
        }

        // 5. @RequiresPermission("listing.write"): OWNER & STAFF allowed; GUEST & ADMIN denied.
        for (UUID allowed : List.of(ownerId, staffId)) {
            mockMvc.perform(get("/api/v1/probe/listing-write").with(jwt().jwt(b -> b.subject(allowed.toString()))))
                    .andExpect(status().isOk());
        }
        for (UUID denied : List.of(guestId, adminId, suspendedAdminId)) {
            mockMvc.perform(get("/api/v1/probe/listing-write").with(jwt().jwt(b -> b.subject(denied.toString()))))
                    .andExpect(status().isForbidden());
        }

        // 6. Owner org endpoints: OWNER read+write, STAFF read-only, GUEST & ADMIN denied.
        mockMvc.perform(get("/api/v1/owner/org").with(jwt().jwt(b -> b.subject(ownerId.toString()))))
                .andExpect(status().isOk());
        mockMvc.perform(patch("/api/v1/owner/org")
                        .with(jwt().jwt(b -> b.subject(ownerId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"displayName\":\"Matrix Harbour Updated\"}"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/owner/org").with(jwt().jwt(b -> b.subject(staffId.toString()))))
                .andExpect(status().isOk());
        mockMvc.perform(patch("/api/v1/owner/org")
                        .with(jwt().jwt(b -> b.subject(staffId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"displayName\":\"Staff Should Fail\"}"))
                .andExpect(status().isForbidden());

        for (UUID denied : List.of(guestId, adminId, suspendedAdminId)) {
            mockMvc.perform(get("/api/v1/owner/org").with(jwt().jwt(b -> b.subject(denied.toString()))))
                    .andExpect(status().isForbidden());
            mockMvc.perform(patch("/api/v1/owner/org")
                            .with(jwt().jwt(b -> b.subject(denied.toString())))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"displayName\":\"Unauthorized\"}"))
                    .andExpect(status().isForbidden());
        }

        // 7. Immediate suspension enforcement: suspending active admin blocks the very next request.
        jdbc.update("UPDATE identity.user_account SET status = 'SUSPENDED' WHERE id = ?", adminId);
        entityManager.flush();
        entityManager.clear();
        mockMvc.perform(get("/api/v1/admin/probe-dashboard").with(jwt().jwt(b -> b.subject(adminId.toString()))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    @Req("BRL-02")
    void idorProbesBlockDirectObjectAccessAcrossUsersAndOrganizations() throws Exception {
        UUID guestA = seedAccount("idor.guesta@example.com", "Guest A", "GUEST", "ACTIVE");
        UUID guestB = seedAccount("idor.guestb@example.com", "Guest B", "GUEST", "ACTIVE");
        UUID ownerA = seedAccount("idor.ownera@example.com", "Owner A", "OWNER", "ACTIVE");
        UUID ownerB = seedAccount("idor.ownerb@example.com", "Owner B", "OWNER", "ACTIVE");
        UUID admin = seedAccount("idor.admin@example.com", "IDOR Admin", "ADMIN", "ACTIVE");

        UUID orgA = seedOrganization(ownerA, "Owner A Suites", "idor.ownera@example.com");
        UUID orgB = seedOrganization(ownerB, "Owner B Suites", "idor.ownerb@example.com");

        // 1. Direct record IDOR: Guest A cannot read Guest B's record; own record & Admin succeed.
        mockMvc.perform(get("/api/v1/probe/records/" + guestB)
                        .with(jwt().jwt(b -> b.subject(guestA.toString()))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        mockMvc.perform(get("/api/v1/probe/records/" + guestA)
                        .with(jwt().jwt(b -> b.subject(guestA.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ownerId").value(guestA.toString()));

        mockMvc.perform(get("/api/v1/probe/records/" + guestB)
                        .with(jwt().jwt(b -> b.subject(admin.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ownerId").value(guestB.toString()));

        // 2. Profile mass-assignment / IDOR probe: forged id, email, and role are ignored.
        mockMvc.perform(patch("/api/v1/me")
                        .with(jwt().jwt(b -> b.subject(guestA.toString()).claim("email", "idor.guesta@example.com")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "id": "%s",
                                  "role": "ADMIN",
                                  "email": "escalated@example.com",
                                  "fullName": "Guest A Renamed"
                                }
                                """.formatted(guestB)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(guestA.toString()))
                .andExpect(jsonPath("$.email").value("idor.guesta@example.com"));

        String guestBName = jdbc.queryForObject(
                "SELECT full_name FROM identity.user_profile WHERE user_id = ?", String.class, guestB);
        String guestARole = jdbc.queryForObject(
                "SELECT r.code FROM identity.user_account u JOIN identity.role r ON r.id = u.role_id WHERE u.id = ?",
                String.class, guestA);
        assertThat(guestBName).isEqualTo("Guest B");
        assertThat(guestARole).isEqualTo("GUEST");

        // 3. Cross-organisation IDOR probe: forged organization id in PATCH /api/v1/owner/org cannot touch Org B.
        mockMvc.perform(patch("/api/v1/owner/org")
                        .with(jwt().jwt(b -> b.subject(ownerA.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "id": "%s",
                                  "organizationId": "%s",
                                  "name": "Hijacked Org Name"
                                }
                                """.formatted(orgB, orgB)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(orgA.toString()));

        String orgBName = jdbc.queryForObject(
                "SELECT name FROM organization.organization WHERE id = ?", String.class, orgB);
        assertThat(orgBName).isEqualTo("Owner B Suites");
    }

    @Test
    @Req("NFR-21")
    void sqlInjectionProbesDoNotBypassQueriesOrCorruptTables() throws Exception {
        UUID victimId = seedAccount("sqli.victim@example.com", "Victim Account", "OWNER", "ACTIVE");
        UUID orgId = seedOrganization(victimId, "Safe Coast Lodge", "sqli.victim@example.com");

        Integer accountsBefore = jdbc.queryForObject("SELECT count(*) FROM identity.user_account", Integer.class);
        Integer orgsBefore = jdbc.queryForObject("SELECT count(*) FROM organization.organization", Integer.class);

        List<String> sqliEmails = List.of(
                "' OR '1'='1",
                "sqli.victim@example.com' OR 1=1 --",
                "x@y.com'; DROP TABLE identity.user_account; --",
                "\" UNION SELECT email FROM identity.user_account --"
        );

        for (String payload : sqliEmails) {
            mockMvc.perform(post("/api/v1/auth/lookup")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"email\":\"" + payload.replace("\"", "\\\"") + "\"}"))
                    .andExpect(result -> assertThat(result.getResponse().getStatus()).isIn(200, 400))
                    .andExpect(result -> assertThat(result.getResponse().getContentAsString())
                            .doesNotContain("Victim Account"));
        }

        // Parameterised JPA/SQL saves SQL-looking text literally without executing DDL/DML.
        String sqliName = "O'Brien'; DROP TABLE identity.user_account; --";
        mockMvc.perform(patch("/api/v1/me")
                        .with(jwt().jwt(b -> b.subject(victimId.toString()).claim("email", "sqli.victim@example.com")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fullName\":\"" + sqliName + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value(sqliName));

        mockMvc.perform(patch("/api/v1/owner/org")
                        .with(jwt().jwt(b -> b.subject(victimId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"displayName\":\"" + sqliName + "\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.displayName").value(sqliName));

        assertThat(jdbc.queryForObject("SELECT count(*) FROM identity.user_account", Integer.class))
                .isEqualTo(accountsBefore);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM organization.organization", Integer.class))
                .isEqualTo(orgsBefore);
        assertThat(jdbc.queryForObject(
                "SELECT display_name FROM organization.organization WHERE id = ?", String.class, orgId))
                .isEqualTo(sqliName);
    }

    @Test
    @Req("NFR-23")
    void xssAndDangerousUrlProbesAreRejectedAcrossProfileAndOrganizationEndpoints() throws Exception {
        UUID ownerId = seedAccount("xss.owner@example.com", "Clean Owner", "OWNER", "ACTIVE");
        UUID orgId = seedOrganization(ownerId, "Clean Lodge", "xss.owner@example.com");

        for (String xss : List.of(
                "<script>alert(1)</script>",
                "<img src=x onerror=alert(1)>",
                "Clean\\u0000Owner")) {
            mockMvc.perform(patch("/api/v1/me")
                            .with(jwt().jwt(b -> b.subject(ownerId.toString()).claim("email", "xss.owner@example.com")))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"fullName\":\"" + xss + "\"}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));

            mockMvc.perform(patch("/api/v1/owner/org")
                            .with(jwt().jwt(b -> b.subject(ownerId.toString())))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"name\":\"" + xss + "\"}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));

            mockMvc.perform(patch("/api/v1/owner/org")
                            .with(jwt().jwt(b -> b.subject(ownerId.toString())))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"displayName\":\"" + xss + "\"}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));
        }

        for (String badUrl : List.of(
                "javascript:alert(1)",
                "data:text/html,<script>alert(1)</script>",
                "vbscript:msgbox(1)")) {
            mockMvc.perform(patch("/api/v1/me")
                            .with(jwt().jwt(b -> b.subject(ownerId.toString()).claim("email", "xss.owner@example.com")))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"avatarUrl\":\"" + badUrl + "\"}"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));
        }

        // Database retains the original clean values.
        assertThat(jdbc.queryForObject(
                "SELECT full_name FROM identity.user_profile WHERE user_id = ?", String.class, ownerId))
                .isEqualTo("Clean Owner");
        assertThat(jdbc.queryForObject(
                "SELECT name FROM organization.organization WHERE id = ?", String.class, orgId))
                .isEqualTo("Clean Lodge");
    }

    @Test
    @Req("NFR-24")
    void securityHttpHeadersArePresentOnFullStackApiResponses() throws Exception {
        UUID ownerId = seedAccount("headers.owner@example.com", "Header Owner", "OWNER", "ACTIVE");
        seedOrganization(ownerId, "Header Lodge", "headers.owner@example.com");

        mockMvc.perform(get("/api/v1/me")
                        .with(jwt().jwt(b -> b.subject(ownerId.toString()).claim("email", "headers.owner@example.com"))))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("X-Frame-Options", "DENY"))
                .andExpect(header().string("Referrer-Policy", "no-referrer"))
                .andExpect(header().string("Content-Security-Policy", containsString("default-src 'none'")));

        mockMvc.perform(get("/api/v1/owner/org")
                        .with(jwt().jwt(b -> b.subject(ownerId.toString()))))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("X-Frame-Options", "DENY"))
                .andExpect(header().string("Referrer-Policy", "no-referrer"))
                .andExpect(header().string("Content-Security-Policy", containsString("frame-ancestors 'none'")));
    }
}
