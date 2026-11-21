package com.findstay.verification;

import com.findstay.shared.error.AppException;
import com.findstay.testing.Req;
import com.findstay.verification.internal.GhanaCardCryptoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Base64;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Unit tests for Ghana Card AES-256-GCM encryption and masking (NFR-28, TA-09, P-12).
 * These tests run entirely in-process without a database or Spring context.
 */
@Req("NFR-28")
class GhanaCardCryptoServiceTest {

    /** 32 zero-bytes encoded in Base64 — a valid 256-bit key for test purposes only. */
    private static final String TEST_KEY = Base64.getEncoder().encodeToString(new byte[32]);

    private GhanaCardCryptoService service;

    @BeforeEach
    void setUp() {
        service = new GhanaCardCryptoService(TEST_KEY);
    }

    // -------------------------------------------------------------------------
    // Encryption uniqueness (random IV per call)
    // -------------------------------------------------------------------------

    @Test
    void twoEncryptionsOfTheSameCardProduceDifferentCiphertexts() {
        // Requirement: each encryption uses a fresh random IV, so identical inputs must
        // produce different stored ciphertexts (NFR-28 — unique IV per write).
        byte[] c1 = service.encrypt("GHA-123456789-5");
        byte[] c2 = service.encrypt("GHA-123456789-5");

        assertThat(c1).isNotEqualTo(c2);
    }

    // -------------------------------------------------------------------------
    // Round-trip accuracy
    // -------------------------------------------------------------------------

    @Test
    void encryptedValueDecryptsAccuratelyToOriginalCard() {
        String card = "GHA-987654321-0";
        byte[] ciphertext = service.encrypt(card);

        assertThat(service.decrypt(ciphertext)).isEqualTo(card);
    }

    @Test
    void bothCiphertextsFromSameInputDecryptToTheSameCard() {
        String card = "GHA-111222333-7";
        byte[] c1 = service.encrypt(card);
        byte[] c2 = service.encrypt(card);

        assertThat(service.decrypt(c1)).isEqualTo(card);
        assertThat(service.decrypt(c2)).isEqualTo(card);
    }

    // -------------------------------------------------------------------------
    // Input normalisation
    // -------------------------------------------------------------------------

    @Test
    void encryptAcceptsCaseInsensitiveInputAndNormalisesToUppercase() {
        byte[] ciphertext = service.encrypt("gha-123456789-5");

        assertThat(service.decrypt(ciphertext)).isEqualTo("GHA-123456789-5");
    }

    @Test
    void encryptStripsLeadingAndTrailingWhitespace() {
        byte[] ciphertext = service.encrypt("  GHA-123456789-5  ");

        assertThat(service.decrypt(ciphertext)).isEqualTo("GHA-123456789-5");
    }

    // -------------------------------------------------------------------------
    // Format validation — rejects malformed inputs
    // -------------------------------------------------------------------------

    @Test
    void encryptRejectsTooFewMiddleDigits() {
        assertThatThrownBy(() -> service.encrypt("GHA-12345678-5"))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("format is invalid");
    }

    @Test
    void encryptRejectsTooManyMiddleDigits() {
        assertThatThrownBy(() -> service.encrypt("GHA-1234567890-5"))
                .isInstanceOf(AppException.class);
    }

    @Test
    void encryptRejectsWrongPrefix() {
        assertThatThrownBy(() -> service.encrypt("GH-123456789-5"))
                .isInstanceOf(AppException.class);
    }

    @Test
    void encryptRejectsNonDigitCharactersInMiddleSegment() {
        assertThatThrownBy(() -> service.encrypt("GHA-ABCDEFGHI-5"))
                .isInstanceOf(AppException.class);
    }

    @Test
    void encryptRejectsNullInput() {
        assertThatThrownBy(() -> service.encrypt(null))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("required");
    }

    @Test
    void encryptRejectsBlankInput() {
        assertThatThrownBy(() -> service.encrypt("   "))
                .isInstanceOf(AppException.class)
                .hasMessageContaining("required");
    }

    @Test
    void maskRejectsInvalidFormat() {
        assertThatThrownBy(() -> service.mask("INVALID-NUMBER"))
                .isInstanceOf(AppException.class);
    }

    // -------------------------------------------------------------------------
    // Masking — hides sensitive middle digits
    // -------------------------------------------------------------------------

    @Test
    void maskHidesSensitiveMiddleDigitsAndKeepsLastThreeAndCheckDigit() {
        // GHA-123456789-5 → GHA-******789-5
        // First 6 of the 9-digit segment are masked; last 3 and check digit are visible.
        assertThat(service.mask("GHA-123456789-5")).isEqualTo("GHA-******789-5");
    }

    @Test
    void maskedValueNeverContainsTheHiddenDigits() {
        String masked = service.mask("GHA-999888777-3");

        assertThat(masked).doesNotContain("999888");
        assertThat(masked).startsWith("GHA-");
        assertThat(masked).endsWith("-3");
    }

    @Test
    void maskNormalisesLowercaseInputBeforeMasking() {
        assertThat(service.mask("gha-123456789-5")).isEqualTo("GHA-******789-5");
    }

    // -------------------------------------------------------------------------
    // Key configuration validation — fail fast on bad key
    // -------------------------------------------------------------------------

    @Test
    void constructorRejectsMissingKey() {
        assertThatThrownBy(() -> new GhanaCardCryptoService(""))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("FINDSTAY_PII_ENCRYPTION_KEY");
    }

    @Test
    void constructorRejectsNullKey() {
        assertThatThrownBy(() -> new GhanaCardCryptoService(null))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void constructorRejectsNonBase64Key() {
        assertThatThrownBy(() -> new GhanaCardCryptoService("not-valid-base64!!!"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Base64");
    }

    @Test
    void constructorRejectsTooShortKey() {
        // 16 bytes (128-bit) — valid Base64 but wrong length for AES-256
        String shortKey = Base64.getEncoder().encodeToString(new byte[16]);

        assertThatThrownBy(() -> new GhanaCardCryptoService(shortKey))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("32 bytes");
    }

    @Test
    void constructorRejectsTooLongKey() {
        // 48 bytes — valid Base64 but wrong length for AES-256
        String longKey = Base64.getEncoder().encodeToString(new byte[48]);

        assertThatThrownBy(() -> new GhanaCardCryptoService(longKey))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("32 bytes");
    }
}
