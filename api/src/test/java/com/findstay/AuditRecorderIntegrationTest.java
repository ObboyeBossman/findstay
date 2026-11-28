package com.findstay.audit;

import com.findstay.audit.api.AuditEntry;
import com.findstay.audit.api.AuditRecorder;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
// @Req({"BR-11", "BRL-19", "UR-A07", "UR-AN02", "NFR-66"}) -> uncomment with your exact @Req annotation
class AuditRecorderIntegrationTest {

    @Autowired
    private AuditRecorder auditRecorder;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void record_persistsAllFieldsAccurately() {
        UUID actorId = UUID.randomUUID();
        UUID orgId = UUID.randomUUID();
        String entityId = UUID.randomUUID().toString();

        AuditEntry entry = new AuditEntry(
                actorId,
                orgId,
                "listing.approved",
                "PROPERTY",
                entityId,
                Map.of("reason", "Verified ownership docs")
        );

        auditRecorder.record(entry);

        Map<String, Object> row = jdbcTemplate.queryForMap(
                "SELECT * FROM audit.audit_log WHERE entity_id = ?", entityId
        );

        assertThat(row.get("id")).isNotNull();
        assertThat(row.get("actor_id")).isEqualTo(actorId);
        assertThat(row.get("org_id")).isEqualTo(orgId);
        assertThat(row.get("action")).isEqualTo("listing.approved");
        assertThat(row.get("entity_type")).isEqualTo("PROPERTY");
        assertThat(row.get("metadata_json").toString()).contains("Verified ownership docs");
        assertThat(row.get("created_at")).isNotNull();
    }

    @Test
    void record_rejectsMissingMandatoryFields() {
        UUID actorId = UUID.randomUUID();

        assertThatThrownBy(() -> new AuditEntry(null, null, "user.suspended", "USER_ACCOUNT", "123", Map.of()))
                .isInstanceOf(IllegalArgumentException.class);

        assertThatThrownBy(() -> new AuditEntry(actorId, null, "  ", "USER_ACCOUNT", "123", Map.of()))
                .isInstanceOf(IllegalArgumentException.class);

        assertThatThrownBy(() -> new AuditEntry(actorId, null, "user.suspended", "", "123", Map.of()))
                .isInstanceOf(IllegalArgumentException.class);

        assertThatThrownBy(() -> new AuditEntry(actorId, null, "user.suspended", "USER_ACCOUNT", null, Map.of()))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void databaseRole_blocksUpdateAndDeleteOnAuditLog() {
        UUID actorId = UUID.randomUUID();
        String entityId = UUID.randomUUID().toString();

        auditRecorder.record(AuditEntry.of(actorId, "user.suspended", "USER_ACCOUNT", entityId));

        // Verify UPDATE fails under findstay_app role
        assertThatThrownBy(() -> jdbcTemplate.execute(
                "SET ROLE findstay_app; UPDATE audit.audit_log SET action = 'tampered' WHERE entity_id = '" + entityId + "';"
        )).isInstanceOf(DataAccessException.class);

        // Verify DELETE fails under findstay_app role
        assertThatThrownBy(() -> jdbcTemplate.execute(
                "SET ROLE findstay_app; DELETE FROM audit.audit_log WHERE entity_id = '" + entityId + "';"
        )).isInstanceOf(DataAccessException.class);
    }
}
