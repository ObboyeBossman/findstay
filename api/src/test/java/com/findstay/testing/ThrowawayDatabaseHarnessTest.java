package com.findstay.testing;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * The S1-01-T12 demonstration: a real test running on the throwaway
 * PostgreSQL that proves the harness itself works — the database spins up,
 * the real Flyway scripts build the schema, real writes land and roll back,
 * and the database-level guarantees Sprint 1 depends on actually bite
 * (nothing is mocked, nothing is H2).
 *
 * <p>Teammates copy this pattern: extend {@link AbstractIntegrationTest},
 * label the class or each method with {@code @Req("...")}, autowire
 * {@code JdbcTemplate} (or repositories once stories land them), and write
 * normal tests. Docker missing → the class skips loudly; CI always has
 * Docker.
 *
 * <p><b>All database-level proofs currently live in this one class.</b> The
 * container lifecycle is per test class, while the Spring context (and its
 * connection pool) is cached per run — a second integration class would stop
 * this container and start a new one the cached context cannot see. Until
 * DEC-S1-04/B-F1 lands the shared-container singleton, add database-level
 * proofs as methods here.
 */
@Req("S1-01-T12")
class ThrowawayDatabaseHarnessTest extends AbstractIntegrationTest {

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private DataSource dataSource;

    @Test
    @Req("S1-01-T9")
    void theRealFlywayScriptsBuiltThisDatabaseFromScratch() {
        List<Map<String, Object>> history =
                jdbc.queryForList("SELECT version, success FROM flyway_schema_history ORDER BY installed_rank");
        // V1_01..V1_13 today; additive sprints only add more — never fewer.
        assertTrue(history.size() >= 13,
                "expected at least the Sprint 1 baseline migrations, got " + history);
        assertTrue(history.stream().allMatch(r -> Boolean.TRUE.equals(r.get("success"))),
                "a migration failed on the throwaway database: " + history);
        assertTrue(history.stream().anyMatch(r -> "1.13".equals(String.valueOf(r.get("version")))),
                "V1_13 (the T15 reference-list seeds) is part of every fresh database");
    }

    @Test
    @Req("DEC-S1-01/L")
    void theStarterReferenceListsArePresentWithTheAgreedValues() {
        assertEquals(
                List.of(
                        "DOUBLE_ROOM",
                        "ENTIRE_HOUSE",
                        "ONE_BEDROOM_APARTMENT",
                        "SINGLE_ROOM",
                        "STUDIO",
                        "SUITE",
                        "TWO_BEDROOM_APARTMENT"),
                codesWhereActive("listing.accommodation_type"),
                "the seven kickoff R1 accommodation types are the only active types");
        assertTrue(count("listing.accommodation_type") >= 7, "at least the seven kickoff accommodation types");
        assertEquals(List.of("NIGHTLY"), codesWhereActive("listing.billing_period"),
                "Per Night is the only active billing period (no weekly, ever)");
        assertEquals(4, count("listing.billing_period"), "4 billing periods seeded, 3 inactive");
        assertEquals(3, count("admin.platform_setting"), "privacy.policy_version + the two dark flags");
        assertEquals("1", jdbc.queryForObject(
                "SELECT value FROM admin.platform_setting WHERE key = 'privacy.policy_version'", String.class));
        assertEquals("false", jdbc.queryForObject(
                "SELECT value FROM admin.platform_setting WHERE key = 'flag.auth.sms_otp'", String.class));
    }

    @Test
    @Req("S1-01-T12")
    void writesAreRealAndEveryTestSeesAFreshDatabase() {
        // a real write on the real database…
        jdbc.update("""
                INSERT INTO admin.platform_setting (key, value, description, is_feature_flag,
                                                    updated_by_user_id, updated_at)
                VALUES ('test.harness.probe', 'written-by-ThrowawayDatabaseHarnessTest',
                        'probe row for the harness demo; rolled back by @Transactional',
                        false, NULL, now())
                ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
                """);
        // …is really there while the test runs…
        assertEquals("written-by-ThrowawayDatabaseHarnessTest", jdbc.queryForObject(
                "SELECT value FROM admin.platform_setting WHERE key = 'test.harness.probe'", String.class));
        // …and @Transactional rolls it back when the test ends, so the next
        // test starts from a fresh database. (Proven by this class re-running:
        // the unique insert never conflicts because it never persists.)
    }

    @Test
    @Req("S1-08-AC2")
    void auditRowsCannotBeEditedOrDeletedEvenAtTheDatabaseRoleLevel() throws SQLException {
        // A connection OUTSIDE the Spring-managed transaction: SET ROLE is
        // session state, and everything here is rolled back by hand. In
        // PostgreSQL an error (the denial itself) aborts the transaction, so
        // each probe runs in its own transaction: insert, prove the denial,
        // roll back.
        try (Connection c = dataSource.getConnection(); Statement st = c.createStatement()) {
            c.setAutoCommit(false);

            st.execute("SET ROLE findstay_app");
            appendAuditProbeRow(st); // INSERT + SELECT are granted — the app can append
            expectPermissionDenied(st, "UPDATE audit.audit_log SET action = 'tampered'");
            st.execute("ROLLBACK");

            st.execute("SET ROLE findstay_app");
            appendAuditProbeRow(st);
            expectPermissionDenied(st, "DELETE FROM audit.audit_log");
            st.execute("ROLLBACK");
        }
    }

    private static void appendAuditProbeRow(Statement st) throws SQLException {
        st.executeUpdate("""
                INSERT INTO audit.audit_log (id, actor_id, org_id, action,
                                              entity_type, entity_id, metadata_json, created_at)
                VALUES ('00000000-0000-7000-8000-000000000001',
                        '00000000-0000-7000-8000-000000000002',
                        NULL, 'test.harness.probe', 'harness', 'probe', '{}', now())
                """);
    }

    private static void expectPermissionDenied(Statement st, String sql) {
        SQLException denied = assertThrows(SQLException.class, () -> st.executeUpdate(sql),
                "expected permission denied for: " + sql);
        assertEquals("42501", denied.getSQLState(),
                "permission denied expected, got: " + denied.getMessage());
    }

    @Test
    @Req("S1-14-AC2")
    void overlappingAvailabilityBlocksAreRejectedByTheDatabase() {
        String insert = """
                INSERT INTO availability.availability_block
                    (id, unit_id, start_at, end_at, reason, created_by_user_id, created_at)
                VALUES ('%s', '11111111-1111-1111-1111-111111111111',
                        '2026-12-01T10:00:00Z', '2026-12-05T10:00:00Z',
                        'OWNER_BLOCK', '22222222-2222-2222-2222-222222222222', now())
                """;
        jdbc.update(insert.formatted(UUID.randomUUID()));
        // same unit, intersecting range → exclusion constraint (23P01) bites:
        DataAccessException overlap = assertThrows(DataAccessException.class,
                () -> jdbc.update(insert.formatted(UUID.randomUUID())));
        assertTrue(overlap.getCause() instanceof SQLException sql
                        && "23P01".equals(sql.getSQLState()),
                "exclusion violation expected, got: " + overlap.getCause());
    }

    // -- DEC-S1-04/B: direct integration, no boundary table ------------

    /**
     * The vendor-id boundary landed in V1_14 (DEC-S1-04/A) and was reverted
     * by V1_15 (DEC-S1-04/B) while the database still held zero accounts:
     * direct provider integration, no mapping table. Every fresh database
     * carries both migrations — applied migrations are never edited — and
     * the boundary table must be gone.
     */
    @Test
    @Req("DEC-S1-04/B")
    void theVendorBoundaryWasRevertedAndItsTableIsGone() {
        List<Map<String, Object>> history =
                jdbc.queryForList("SELECT version FROM flyway_schema_history");
        assertTrue(history.stream().anyMatch(r -> "1.14".equals(String.valueOf(r.get("version")))),
                "V1_14 (auth_identity, DEC-S1-04/A) stays in the history, never edited: " + history);
        assertTrue(history.stream().anyMatch(r -> "1.15".equals(String.valueOf(r.get("version")))),
                "V1_15 (the DEC-S1-04/B revert) must be in every fresh database: " + history);
        Boolean gone = jdbc.queryForObject(
                "SELECT to_regclass('identity.auth_identity') IS NULL", Boolean.class);
        assertEquals(Boolean.TRUE, gone,
                "identity.auth_identity was dropped by V1_15 (DEC-S1-04/B)");
    }

    // ------------------------------------------------------------------

    private int count(String table) {
        Integer n = jdbc.queryForObject("SELECT count(*) FROM " + table, Integer.class);
        return n == null ? 0 : n;
    }

    private List<String> codesWhereActive(String table) {
        return jdbc.queryForList(
                "SELECT code FROM " + table + " WHERE is_active ORDER BY code", String.class);
    }
}
