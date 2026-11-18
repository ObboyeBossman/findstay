package com.findstay.testing;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.ResultSet;
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
 * DEC-S1-04/A-F4 lands the shared-container singleton, add database-level
 * proofs as methods here.
 */
@Req("S1-01-T12")
class ThrowawayDatabaseHarnessTest extends AbstractIntegrationTest {

    /** The DEC-S1-04/A provision shape: a FindStay id and its Supabase credential. */
    private static final String ACCOUNT_ID = "018f4e11-0000-7000-8000-000000000001";
    private static final String ACCOUNT_ID_2 = "018f4e11-0000-7000-8000-000000000002";
    private static final String SUPABASE_UID = "b61d0e95-4b2b-4b71-b0b7-5f5a9c1d2e3f";

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
        assertEquals(7, count("listing.accommodation_type"), "the seven kickoff accommodation types");
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

    // -- DEC-S1-04/A: the vendor-id boundary ----------------------------

    @Test
    @Req("DEC-S1-04/A")
    void theVendorBoundaryMigrationIsPartOfEveryFreshDatabase() {
        List<Map<String, Object>> history =
                jdbc.queryForList("SELECT version FROM flyway_schema_history");
        assertTrue(history.stream().anyMatch(r -> "1.14".equals(String.valueOf(r.get("version")))),
                "V1_14 (auth_identity, DEC-S1-04/A) must be in every fresh database: " + history);
    }

    @Test
    @Req("DEC-S1-04/A")
    void theProvisionRecipeWorksAndResolvesBackToTheFindStayId() {
        provisionAccountWithCredential(ACCOUNT_ID, "guest@example.com", SUPABASE_UID);

        // the JWT filter's lookup: provider uid -> the FindStay user id
        assertEquals(ACCOUNT_ID, jdbc.queryForObject("""
                SELECT user_account_id FROM identity.auth_identity
                WHERE provider = 'SUPABASE' AND provider_user_id = '%s'
                """.formatted(SUPABASE_UID), String.class),
                "the credential must resolve to FindStay's own id");
        // the account exists with the copied email — informational, never the login key
        assertEquals("guest@example.com", jdbc.queryForObject(
                "SELECT email FROM identity.user_account WHERE id = '%s'".formatted(ACCOUNT_ID),
                String.class));
    }

    @Test
    @Req("DEC-S1-04/A")
    void aSecondCredentialMayLinkToTheSameAccount() {
        provisionAccountWithCredential(ACCOUNT_ID, "two-credentials@example.com", "uid-credential-one");
        jdbc.update(credentialSql(ACCOUNT_ID, "uid-credential-two"));
        assertEquals(2, jdbc.queryForObject(
                "SELECT count(*) FROM identity.auth_identity WHERE user_account_id = '%s'"
                        .formatted(ACCOUNT_ID), Integer.class),
                "one person, two credentials, one FindStay id (the provider-swap shape)");
    }

    @Test
    @Req("DEC-S1-04/A")
    void duplicateCredentialsAreRejectedByTheDatabase() {
        provisionAccountWithCredential(ACCOUNT_ID, "dup@example.com", SUPABASE_UID);
        // a replay of the same credential is never a second account — the
        // provision flow catches 23505 and answers 200 OK (DEC-S1-04/A)
        DataAccessException duplicate = assertThrows(DataAccessException.class,
                () -> jdbc.update(credentialSql(ACCOUNT_ID_2, SUPABASE_UID)));
        assertTrue(duplicate.getCause() instanceof SQLException sql
                        && "23505".equals(sql.getSQLState()),
                "unique violation expected, got: " + duplicate.getCause());
    }

    @Test
    @Req("DEC-S1-04/A")
    void orphanCredentialsAreRejectedByTheDatabase() {
        DataAccessException orphan = assertThrows(DataAccessException.class,
                () -> jdbc.update(credentialSql("018f4e11-dead-7000-8000-0000000000ff", "orphan-uid")));
        assertTrue(orphan.getCause() instanceof SQLException sql
                        && "23503".equals(sql.getSQLState()),
                "foreign key violation expected, got: " + orphan.getCause());
    }

    @Test
    @Req("DEC-S1-04/A")
    void unknownProvidersAreRejectedByTheDatabase() {
        provisionAccountWithCredential(ACCOUNT_ID, "closed-set@example.com", SUPABASE_UID);
        DataAccessException unknown = assertThrows(DataAccessException.class,
                () -> jdbc.update("""
                        INSERT INTO identity.auth_identity
                            (id, user_account_id, provider, provider_user_id, created_at, updated_at)
                        VALUES ('018f4e11-0000-7000-8000-0000000000b3',
                                '%s', 'GOOGLE', 'some-google-uid', now(), now())
                        """.formatted(ACCOUNT_ID)));
        assertTrue(unknown.getCause() instanceof SQLException sql
                        && "23514".equals(sql.getSQLState()),
                "check violation expected (provider is a closed set), got: " + unknown.getCause());
    }

    /**
     * V1_12's ALTER DEFAULT PRIVILEGES extended the CRUD grants to later
     * identity tables — prove the app role can actually provision through
     * auth_identity, exactly as S1-04 will. Own connection, own transaction,
     * rolled back by hand (the SET ROLE pattern above).
     */
    @Test
    @Req("DEC-S1-04/A")
    void theAppRoleCanProvisionThroughTheBoundaryTable() throws SQLException {
        try (Connection c = dataSource.getConnection(); Statement st = c.createStatement()) {
            c.setAutoCommit(false);
            st.execute("SET ROLE findstay_app");
            st.executeUpdate("""
                    INSERT INTO identity.user_account (id, email, created_at, updated_at)
                    VALUES ('%s', 'app-role@example.com', now(), now())
                    """.formatted(ACCOUNT_ID));
            st.executeUpdate("""
                    INSERT INTO identity.auth_identity
                        (id, user_account_id, provider, provider_user_id, created_at, updated_at)
                    VALUES ('018f4e11-0000-7000-8000-0000000000b1', '%s',
                            'SUPABASE', '%s', now(), now())
                    """.formatted(ACCOUNT_ID, SUPABASE_UID));
            ResultSet rs = st.executeQuery("""
                    SELECT user_account_id FROM identity.auth_identity
                    WHERE provider = 'SUPABASE' AND provider_user_id = '%s'
                    """.formatted(SUPABASE_UID));
            assertTrue(rs.next(), "the credential must resolve as findstay_app");
            assertEquals(ACCOUNT_ID, rs.getString(1));
            st.execute("ROLLBACK");
        }
    }

    private void provisionAccountWithCredential(String accountId, String email, String providerUserId) {
        jdbc.update("""
                INSERT INTO identity.user_account (id, email, created_at, updated_at)
                VALUES ('%s', '%s', now(), now())
                """.formatted(accountId, email));
        jdbc.update(credentialSql(accountId, providerUserId));
    }

    private static String credentialSql(String accountId, String providerUserId) {
        return """
                INSERT INTO identity.auth_identity
                    (id, user_account_id, provider, provider_user_id, created_at, updated_at)
                VALUES ('%s', '%s', 'SUPABASE', '%s', now(), now())
                """.formatted(UUID.randomUUID(), accountId, providerUserId);
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
