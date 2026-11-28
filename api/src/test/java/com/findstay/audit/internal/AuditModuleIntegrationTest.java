package com.findstay.audit.internal;

import com.findstay.audit.api.AuditEntryView;
import com.findstay.audit.api.AuditRecord;
import com.findstay.audit.api.AuditRecorder;
import com.findstay.shared.error.AppException;
import com.findstay.testing.AbstractIntegrationTest;
import com.findstay.testing.Req;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.sql.SQLException;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Full-stack PostgreSQL verification for Story {@code S1-08} ({@code T2}, {@code T3}, {@code T4},
 * {@code T6}): database role-level append-only immutability ({@code findstay_app} cannot UPDATE,
 * DELETE, or TRUNCATE {@code audit.audit_log}), {@link AuditRecorder} validation &amp; actor name
 * enrichment, paginated filter queries, and admin-only RBAC enforcement.
 */
@Req("BR-11")
@AutoConfigureMockMvc
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class AuditModuleIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private TransactionTemplate txTemplate;

    @Autowired
    private AuditRecorder auditRecorder;

    private UUID adminId;
    private UUID ownerId;
    private UUID staffId;
    private UUID guestId;
    private UUID targetUserId;
    private UUID orgId;

    @BeforeEach
    void setUp() {
        adminId = UUID.randomUUID();
        ownerId = UUID.randomUUID();
        staffId = UUID.randomUUID();
        guestId = UUID.randomUUID();
        targetUserId = UUID.randomUUID();
        orgId = UUID.randomUUID();

        seedUser(adminId, "audit-admin-" + adminId + "@findstay.gh", "ADMIN", "Kwame Mensah");
        seedUser(ownerId, "audit-owner-" + ownerId + "@findstay.gh", "OWNER", "Ama Boateng");
        seedUser(staffId, "audit-staff-" + staffId + "@findstay.gh", "STAFF", "Kojo Mensah");
        seedUser(guestId, "audit-guest-" + guestId + "@findstay.gh", "GUEST", "Esi Owusu");
        seedUser(targetUserId, "audit-target-" + targetUserId + "@findstay.gh", "OWNER", "Kofi Asante");
    }

    @Test
    @Req("NFR-66")
    void findstayAppRoleCanInsertAndSelectAuditLogButCannotUpdateDeleteOrTruncate() {
        UUID rowId = UUID.randomUUID();

        // 1. As findstay_app, INSERT and SELECT succeed
        Integer countAfterInsert = txTemplate.execute(status -> {
            jdbc.execute("SET LOCAL ROLE findstay_app");
            jdbc.update(
                    """
                    INSERT INTO audit.audit_log
                        (id, actor_id, org_id, action, entity_type, entity_id, metadata_json, created_at)
                    VALUES (?, ?, ?, 'user.suspended', 'USER', ?, '{"reason":"Policy breach"}'::jsonb, now())
                    """,
                    rowId, adminId, orgId, targetUserId.toString()
            );
            return jdbc.queryForObject(
                    "SELECT count(*) FROM audit.audit_log WHERE id = ?",
                    Integer.class,
                    rowId
            );
        });
        assertThat(countAfterInsert).isEqualTo(1);

        // 2. As findstay_app, UPDATE is rejected by PostgreSQL with SQLSTATE 42501
        assertThatThrownBy(() -> txTemplate.executeWithoutResult(status -> {
            jdbc.execute("SET LOCAL ROLE findstay_app");
            jdbc.update("UPDATE audit.audit_log SET action = 'tampered' WHERE id = ?", rowId);
        })).satisfies(ex -> assertThat(findSqlState(ex)).isEqualTo("42501"));

        // 3. As findstay_app, DELETE is rejected by PostgreSQL with SQLSTATE 42501
        assertThatThrownBy(() -> txTemplate.executeWithoutResult(status -> {
            jdbc.execute("SET LOCAL ROLE findstay_app");
            jdbc.update("DELETE FROM audit.audit_log WHERE id = ?", rowId);
        })).satisfies(ex -> assertThat(findSqlState(ex)).isEqualTo("42501"));

        // 4. As findstay_app, TRUNCATE is rejected by PostgreSQL with SQLSTATE 42501
        assertThatThrownBy(() -> txTemplate.executeWithoutResult(status -> {
            jdbc.execute("SET LOCAL ROLE findstay_app");
            jdbc.execute("TRUNCATE TABLE audit.audit_log");
        })).satisfies(ex -> assertThat(findSqlState(ex)).isEqualTo("42501"));
    }

    @Test
    @Req("UR-A07")
    void recordsSuspensionRestorationAndReviewDecisionsWithAdminFilteringAndActorNames() throws Exception {
        Instant windowStart = Instant.now().minusSeconds(5);

        AuditEntryView suspended = auditRecorder.record(AuditRecord.withReason(
                adminId,
                orgId,
                "user.suspended",
                "USER",
                targetUserId.toString(),
                "Repeated guest complaints"
        ));
        AuditEntryView restored = auditRecorder.record(AuditRecord.withReason(
                adminId,
                orgId,
                "user.restored",
                "USER",
                targetUserId.toString(),
                "Owner resolved compliance issues"
        ));
        UUID propertyId = UUID.randomUUID();
        auditRecorder.record(new AuditRecord(
                adminId,
                orgId,
                "listing.approved",
                "PROPERTY",
                propertyId.toString(),
                Map.of("reason", "All Takoradi documents verified", "propertyName", "Beach Road Villa")
        ));

        assertThat(suspended.actorName()).isEqualTo("Kwame Mensah");
        assertThat(restored.metadata().get("reason")).isEqualTo("Owner resolved compliance issues");

        Instant windowEnd = Instant.now().plusSeconds(5);

        // Filter by actorId + date range -> returns all 3 entries newest-first with resolved actorName
        mockMvc.perform(get("/api/v1/admin/audit-logs")
                        .param("actorId", adminId.toString())
                        .param("from", windowStart.toString())
                        .param("to", windowEnd.toString())
                        .param("limit", "10")
                        .param("offset", "0")
                        .with(jwt().jwt(j -> j.subject(adminId.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(3))
                .andExpect(jsonPath("$.items.length()").value(3))
                .andExpect(jsonPath("$.items[0].action").value("listing.approved"))
                .andExpect(jsonPath("$.items[0].actorName").value("Kwame Mensah"))
                .andExpect(jsonPath("$.items[1].action").value("user.restored"))
                .andExpect(jsonPath("$.items[2].action").value("user.suspended"));

        // Filter by action + entityType
        mockMvc.perform(get("/api/v1/admin/audit-logs")
                        .param("actorId", adminId.toString())
                        .param("action", "user.suspended")
                        .param("entityType", "USER")
                        .with(jwt().jwt(j -> j.subject(adminId.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(1))
                .andExpect(jsonPath("$.items[0].entityId").value(targetUserId.toString()))
                .andExpect(jsonPath("$.items[0].metadata.reason").value("Repeated guest complaints"));

        // Pagination offset/limit
        mockMvc.perform(get("/api/v1/admin/audit-logs")
                        .param("actorId", adminId.toString())
                        .param("limit", "1")
                        .param("offset", "1")
                        .with(jwt().jwt(j -> j.subject(adminId.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(3))
                .andExpect(jsonPath("$.items.length()").value(1))
                .andExpect(jsonPath("$.items[0].action").value("user.restored"));
    }

    @Test
    @Req("BRL-19")
    void rejectsMissingMandatoryAuditFieldsAndBlocksNonAdminReaders() throws Exception {
        // Mandatory fields validation
        assertThatThrownBy(() -> auditRecorder.record(
                new AuditRecord(null, null, "", "USER", "", Map.of())
        )).isInstanceOf(AppException.class);

        // Non-admin callers blocked with 403 FORBIDDEN
        mockMvc.perform(get("/api/v1/admin/audit-logs")
                        .with(jwt().jwt(j -> j.subject(ownerId.toString()))))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/v1/admin/audit-logs")
                        .with(jwt().jwt(j -> j.subject(staffId.toString()))))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/v1/admin/audit-logs")
                        .with(jwt().jwt(j -> j.subject(guestId.toString()))))
                .andExpect(status().isForbidden());

        // Unauthenticated blocked with 401
        mockMvc.perform(get("/api/v1/admin/audit-logs"))
                .andExpect(status().isUnauthorized());
    }

    private static String findSqlState(Throwable ex) {
        Throwable cursor = ex;
        while (cursor != null) {
            if (cursor instanceof SQLException sqlEx && sqlEx.getSQLState() != null) {
                return sqlEx.getSQLState();
            }
            cursor = cursor.getCause();
        }
        return null;
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
