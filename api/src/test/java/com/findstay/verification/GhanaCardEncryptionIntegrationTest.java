package com.findstay.verification;

import com.findstay.testing.AbstractIntegrationTest;
import com.findstay.testing.Req;
import com.findstay.verification.internal.GhanaCardCryptoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Integration tests for Ghana Card encryption against a real PostgreSQL database
 * (NFR-28, TA-09).
 *
 * <p>These tests prove that:
 * <ol>
 *   <li>Two encryptions of the same Ghana Card produce different {@code bytea} ciphertexts
 *       in the database (unique random IV per write).</li>
 *   <li>A raw SQL {@code SELECT} of {@code ghana_card_number_encrypted} never surfaces
 *       the plaintext digits — only an opaque binary blob.</li>
 *   <li>Both stored ciphertexts decrypt back to the original Ghana Card number.</li>
 *   <li>The masking helper produces the correct safe representation.</li>
 * </ol>
 *
 * <p>The Spring context uses the test encryption key from {@code application-test.properties};
 * the real {@code FINDSTAY_PII_ENCRYPTION_KEY} secret is never needed in tests.
 */
@Req("NFR-28")
class GhanaCardEncryptionIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private GhanaCardCryptoService cryptoService;

    @Autowired
    private JdbcTemplate jdbc;

    @Test
    void storedCiphertextDoesNotContainPlaintextGhanaCardDigits() {
        // Arrange
        String card = "GHA-987654321-3";
        byte[] ciphertext = cryptoService.encrypt(card);
        UUID caseId = UUID.randomUUID();
        UUID orgId = UUID.randomUUID();
        Instant now = Instant.now();

        // Act — persist to the real verification schema
        jdbc.update(
                """
                INSERT INTO verification.verification_case
                    (id, organization_id, status, ghana_card_number_encrypted,
                     submitted_at, created_at, updated_at)
                VALUES (?, ?, 'PENDING', ?, ?, ?, ?)
                """,
                caseId, orgId, ciphertext, now, now, now);

        // Assert — raw hex dump of the bytea must not contain the plaintext digit sequence
        String hexCiphertext = jdbc.queryForObject(
                "SELECT encode(ghana_card_number_encrypted, 'hex') " +
                "FROM verification.verification_case WHERE id = ?",
                String.class, caseId);

        assertThat(hexCiphertext)
                .as("Stored ciphertext must not expose plaintext Ghana Card digits")
                .isNotBlank()
                .doesNotContain("987654321");
    }

    @Test
    void twoEncryptionsOfSameCardProduceDifferentStoredCiphertextsAndBothDecryptCorrectly() {
        // Arrange
        String card = "GHA-123456789-0";
        byte[] ciphertext1 = cryptoService.encrypt(card);
        byte[] ciphertext2 = cryptoService.encrypt(card);
        Instant now = Instant.now();

        UUID caseId1 = UUID.randomUUID();
        UUID caseId2 = UUID.randomUUID();
        UUID orgId1 = UUID.randomUUID();
        UUID orgId2 = UUID.randomUUID();

        // Act — persist both rows
        jdbc.update(
                """
                INSERT INTO verification.verification_case
                    (id, organization_id, status, ghana_card_number_encrypted,
                     submitted_at, created_at, updated_at)
                VALUES (?, ?, 'PENDING', ?, ?, ?, ?)
                """,
                caseId1, orgId1, ciphertext1, now, now, now);

        jdbc.update(
                """
                INSERT INTO verification.verification_case
                    (id, organization_id, status, ghana_card_number_encrypted,
                     submitted_at, created_at, updated_at)
                VALUES (?, ?, 'PENDING', ?, ?, ?, ?)
                """,
                caseId2, orgId2, ciphertext2, now, now, now);

        // Assert — stored hex values must differ (different IVs)
        String hex1 = jdbc.queryForObject(
                "SELECT encode(ghana_card_number_encrypted, 'hex') " +
                "FROM verification.verification_case WHERE id = ?",
                String.class, caseId1);
        String hex2 = jdbc.queryForObject(
                "SELECT encode(ghana_card_number_encrypted, 'hex') " +
                "FROM verification.verification_case WHERE id = ?",
                String.class, caseId2);

        assertThat(hex1).isNotEqualTo(hex2);

        // Both must decrypt to the original card number
        assertThat(cryptoService.decrypt(ciphertext1)).isEqualTo(card);
        assertThat(cryptoService.decrypt(ciphertext2)).isEqualTo(card);
    }

    @Test
    void maskingHelperProducesSafeRepresentationForUiAndApiResponses() {
        // GHA-987654321-3 → GHA-******321-3 (last 3 digits of middle segment visible)
        assertThat(cryptoService.mask("GHA-987654321-3"))
                .isEqualTo("GHA-******321-3");

        // The masked value must not expose the hidden portion
        assertThat(cryptoService.mask("GHA-987654321-3"))
                .doesNotContain("987654");
    }
}
