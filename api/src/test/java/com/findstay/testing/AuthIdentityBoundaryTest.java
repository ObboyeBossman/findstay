package com.findstay.testing;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * The DEC-S1-04/A boundary, proven on the real throwaway database: the vendor
 * id lives in exactly one table, the uniqueness that makes provision idempotent
 * actually bites, and the app role can use the table through the grants
 * V1_12's default privileges extended to it.
 *
 * <p>What this proves for S1-04 (issue #4): the provision recipe in the
 * decision is executable as-is — insert the account (FindStay's own UUIDv7)
 * and its credential in one transaction, and a replay of the same credential
 * is a lookup, never a duplicate.
 */
@Req("DEC-S1-04/A")
class AuthIdentityBoundaryTest extends AbstractIntegrationTest {

    /** A FindStay user id and its Supabase credential — the provision shape. */
    private static final String ACCOUNT_ID = "018f4e11-0000-7000-8000-000000000001";
    private static final String ACCOUNT_ID_2 = "018f4e11-0000-7000-8000-000000000002";
    private static final String SUPABASE_UID = "b61d0e95-4b2b-4b71-b0b7-5f5a9c1d2e3f";

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private DataSource dataSource;

    @Test
    void theBoundaryMigrationIsPartOfEveryFreshDatabase() {
        List<Map<String, Object>> history = jdbc.queryForList(
                "SELECT version, success FROM flyway_schema_history ORDER BY installed_rank");
        assertTrue(history.stream().anyMatch(r -> "1.14".equals(String.valueOf(r.get("version")))),
                "V1_14 (auth_identity, DEC-S1-04/A) must be in every fresh database");
        assertTrue(history.stream().allMatch(r -> Boolean.TRUE.equals(r.get("success"))),
                "a migration failed: " + history);
    }

    @Test
    void theProvisionRecipeWorksAndResolvesBackToTheFindStayId() {
        // provision: the account gets FindStay's own id, the credential points at it
        jdbc.update("""
                INSERT INTO identity.user_account (id, email, created_at, updated_at)
                VALUES ('%s', 'guest@example.com', now(), now())
                """.formatted(ACCOUNT_ID));
        jdbc.update("""
                INSERT INTO identity.auth_identity
                    (id, user_account_id, provider, provider_user_id, created_at, updated_at)
                VALUES ('018f4e11-0000-7000-8000-0000000000a1', '%s',
                        'SUPABASE', '%s', now(), now())
                """.formatted(ACCOUNT_ID, SUPABASE_UID));

        // the JWT filter's lookup: provider uid -> the FindStay user id
        String resolved = jdbc.queryForObject("""
                SELECT user_account_id FROM identity.auth_identity
                WHERE provider = 'SUPABASE' AND provider_user_id = '%s'
                """.formatted(SUPABASE_UID), String.class);
        assertEquals(ACCOUNT_ID, resolved, "the credential must resolve to FindStay's id");
        // and the account's email is just copied data, never the login key
        assertNotNull(jdbc.queryForObject(
                "SELECT email FROM identity.user_account WHERE id = '%s'".formatted(ACCOUNT_ID),
                String.class));
    }

    @Test
    void aSecondCredentialMayLinkToTheSameAccount() {
        provisionTwoCredentialsOnOneAccount();
        assertEquals(2, jdbc.queryForObject(
                "SELECT count(*) FROM identity.auth_identity WHERE user_account_id = '%s'"
                        .formatted(ACCOUNT_ID), Integer.class),
                "one person, two credentials, one FindStay id (the provider-swap shape)");
    }

    /**
     * The constraints bite — each probe in its own transaction on its own
     * connection, because in PostgreSQL an error aborts the transaction (the
     * same pattern the audit append-only proof uses).
     */
    @Test
    void theVendorIdRulesActuallyBite() throws SQLException {
        try (Connection c = dataSource.getConnection(); Statement st = c.createStatement()) {
            c.setAutoCommit(false);

            // a duplicate credential (same provider uid) is never a second account
            seedAccountAndCredential(st);
            expectSqlState(st, "23505", duplicateCredentialSql());
            st.execute("ROLLBACK");

            // an orphan credential (no account) cannot exist
            expectSqlState(st, "23503", """
                    INSERT INTO identity.auth_identity
                        (id, user_account_id, provider, provider_user_id, created_at, updated_at)
                    VALUES ('018f4e11-0000-7000-8000-0000000000b2',
                            '018f4e11-dead-7000-8000-0000000000ff',
                            'SUPABASE', 'orphan-uid', now(), now())
                    """);
            st.execute("ROLLBACK");

            // an unknown provider is rejected — closed set, adding one is a migration
            seedAccountAndCredential(st);
            expectSqlState(st, "23514", """
                    INSERT INTO identity.auth_identity
                        (id, user_account_id, provider, provider_user_id, created_at, updated_at)
                    VALUES ('018f4e11-0000-7000-8000-0000000000b3',
                            '%s', 'GOOGLE', 'some-google-uid', now(), now())
                    """.formatted(ACCOUNT_ID_2));
            st.execute("ROLLBACK");
        }
    }

    /**
     * V1_12's ALTER DEFAULT PRIVILEGES extended the CRUD grants to later
     * identity tables — prove the app role can actually provision through
     * auth_identity, exactly as S1-04 will.
     */
    @Test
    void theAppRoleCanUseTheBoundaryTable() throws SQLException {
        try (Connection c = dataSource.getConnection(); Statement st = c.createStatement()) {
            c.setAutoCommit(false);
            st.execute("SET ROLE findstay_app");
            seedAccountAndCredential(st); // INSERT both rows as the app role
            String resolved = st.executeQuery("""
                    SELECT user_account_id FROM identity.auth_identity
                    WHERE provider = 'SUPABASE' AND provider_user_id = '%s'
                    """.formatted(SUPABASE_UID)).getString(1);
            assertEquals(ACCOUNT_ID, resolved, "SELECT as findstay_app must resolve the credential");
            st.execute("ROLLBACK");
        }
    }

    // -- helpers -------------------------------------------------------------

    private void provisionTwoCredentialsOnOneAccount() {
        jdbc.update("""
                INSERT INTO identity.user_account (id, email, created_at, updated_at)
                VALUES ('%s', 'two-credentials@example.com', now(), now())
                """.formatted(ACCOUNT_ID));
        jdbc.update("""
                INSERT INTO identity.auth_identity
                    (id, user_account_id, provider, provider_user_id, created_at, updated_at)
                VALUES ('018f4e11-0000-7000-8000-0000000000c1', '%s',
                        'SUPABASE', 'uid-credential-one', now(), now())
                """.formatted(ACCOUNT_ID));
        jdbc.update("""
                INSERT INTO identity.auth_identity
                    (id, user_account_id, provider, provider_user_id, created_at, updated_at)
                VALUES ('018f4e11-0000-7000-8000-0000000000c2', '%s',
                        'SUPABASE', 'uid-credential-two', now(), now())
                """.formatted(ACCOUNT_ID));
    }

    private static void seedAccountAndCredential(Statement st) throws SQLException {
        st.executeUpdate("""
                INSERT INTO identity.user_account (id, email, created_at, updated_at)
                VALUES ('%s', 'boundary@example.com', now(), now())
                """.formatted(ACCOUNT_ID_2));
        st.executeUpdate("""
                INSERT INTO identity.auth_identity
                    (id, user_account_id, provider, provider_user_id, created_at, updated_at)
                VALUES ('018f4e11-0000-7000-8000-0000000000b1', '%s',
                        'SUPABASE', '%s', now(), now())
                """.formatted(ACCOUNT_ID_2, SUPABASE_UID));
    }

    private static String duplicateCredentialSql() {
        return """
                INSERT INTO identity.auth_identity
                    (id, user_account_id, provider, provider_user_id, created_at, updated_at)
                VALUES ('018f4e11-0000-7000-8000-0000000000b9', '%s',
                        'SUPABASE', '%s', now(), now())
                """.formatted(ACCOUNT_ID_2, SUPABASE_UID);
    }

    private static void expectSqlState(Statement st, String expected, String sql) {
        SQLException violated = assertThrows(SQLException.class, () -> st.executeUpdate(sql),
                "expected SQLState " + expected + " for: " + sql);
        assertEquals(expected, violated.getSQLState(),
                "expected " + expected + ", got " + violated.getSQLState() + ": " + violated.getMessage());
    }
}
