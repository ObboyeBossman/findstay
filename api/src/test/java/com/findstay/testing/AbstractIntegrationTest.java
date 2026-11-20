package com.findstay.testing;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.DockerClientFactory;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * The throwaway-database harness (S1-01-T12): every integration test gets a
 * <b>real PostgreSQL</b> — started in a container, migrated from scratch by
 * the real Flyway scripts, and thrown away afterwards. Tests prove real
 * behaviour: real DDL constraints, real grants, real SQL semantics. Nothing
 * is mocked, nothing is H2.
 *
 * <p>How to use it — any teammate writes:
 * <pre>{@code
 * @Req("S1-08-AC2")                       // the requirement this proves
 * class AuditRulesIntegrationTest extends AbstractIntegrationTest {
 *
 *     @Autowired JdbcTemplate jdbc;       // real database access
 *
 *     @Test
 *     void auditRowsCannotBeUpdated() { … }
 * }
 * }</pre>
 *
 * <p>Lifecycle and isolation:
 * <ul>
 *   <li><b>One real PostgreSQL 16 per test run</b> (container shared for
 *       speed; Ryuk destroys it after the run — nothing leaks).</li>
 *   <li><b>Every test sees a fresh database</b> via {@code @Transactional}
 *       rollback — data a test writes vanishes when the test ends.</li>
 *   <li><b>Fresh schema on boot</b>: Spring starts with Flyway applying
 *       {@code V1_01}… in order against the empty container database — the
 *       same scripts, the same engine, as staging.</li>
 *   <li><b>No Docker? Tests skip loudly, they never fake green</b>:
 *       {@code @Testcontainers(disabledWithoutDocker = true)} reports them
 *       as skipped/disabled. CI (GitHub Actions) always has Docker, so the
 *       suite always truly runs there.</li>
 *   <li>State a test must not roll back (e.g. {@code SET ROLE} session
 *       games) can use a plain {@code DataSource} connection outside the
 *       managed transaction — see {@code ThrowawayDatabaseHarnessTest}.</li>
 * </ul>
 *
 * <p>Module rules still apply: reach other modules only through their public
 * {@code api} packages, never their internals.
 */
@SpringBootTest
@Testcontainers(disabledWithoutDocker = true)
@Transactional
public abstract class AbstractIntegrationTest {

    /**
     * Singleton PostgreSQL 16 container shared across all integration test classes
     * (DEC-S1-04/B-F1) so the cached Spring context keeps a live connection pool.
     * Ryuk destroys it when the JVM exits.
     */
    protected static final PostgreSQLContainer<?> POSTGRES =
            new PostgreSQLContainer<>("postgres:16.4-alpine");

    static {
        if (DockerClientFactory.instance().isDockerAvailable()) {
            POSTGRES.start();
        }
    }

    @DynamicPropertySource
    static void registerPostgresProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
    }
}
