package com.findstay.verification.internal;

import com.findstay.shared.error.ApiError;
import com.findstay.shared.error.AppException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * AES-256-GCM encryption and masking for Ghana Card numbers (NFR-28, TA-09, P-12,
 * Ghana Data Protection Act 843).
 *
 * <p><b>Wire format</b> stored in
 * {@code verification.verification_case.ghana_card_number_encrypted} ({@code bytea}):
 * {@code [12-byte IV] || [ciphertext + 16-byte GCM authentication tag]}.
 * A fresh random IV is generated per encryption call, so two encryptions of the same
 * Ghana Card always produce different stored ciphertexts.
 *
 * <p><b>Key source:</b> {@code FINDSTAY_PII_ENCRYPTION_KEY} environment variable — a
 * Base64-encoded 256-bit (32-byte) AES key. The constructor validates this on startup
 * and throws {@link IllegalStateException} if the key is absent or malformed, preventing
 * the application from starting without a properly configured secret.
 *
 * <p><b>Plaintext safety:</b> this class never holds a plaintext Ghana Card number as a
 * field. Callers receive only ciphertext {@code byte[]} or the safely masked
 * {@code String}; neither logs nor {@code toString()} can expose the raw number.
 */
@Service
class GhanaCardCryptoService {

    /** Compiled pattern for the canonical Ghana Card format, used by {@link #validate}. */
    static final Pattern GHANA_CARD_PATTERN = Pattern.compile("^GHA-\\d{9}-\\d$");

    private static final int IV_BYTES = 12;          // 96-bit IV as required by AES-GCM
    private static final int GCM_TAG_BITS = 128;     // 128-bit authentication tag (JVM default)
    private static final int KEY_BYTES = 32;          // 256-bit key
    private static final String CIPHER_ALGORITHM = "AES/GCM/NoPadding";
    private static final String KEY_ALGORITHM = "AES";

    // Masking constants for GHA-XXXXXXXXX-C format
    private static final int MIDDLE_SEGMENT_START = 4;  // after "GHA-"
    private static final int MIDDLE_SEGMENT_END = 13;   // 9 digits
    private static final int VISIBLE_TAIL_LENGTH = 3;   // show last 3 of the 9-digit segment
    private static final int CHECK_DIGIT_START = 14;    // after the second "-"

    private final SecretKey secretKey;
    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * Constructs the service and validates the encryption key on startup.
     *
     * @param base64Key Base64-encoded 256-bit AES key from {@code FINDSTAY_PII_ENCRYPTION_KEY}
     * @throws IllegalStateException if the key is absent, not valid Base64, or not exactly 32 bytes
     */
    GhanaCardCryptoService(@Value("${findstay.pii.encryption-key:}") String base64Key) {
        if (base64Key == null || base64Key.isBlank()) {
            throw new IllegalStateException(
                    "FINDSTAY_PII_ENCRYPTION_KEY is not configured. " +
                    "Set it to a Base64-encoded 256-bit (32-byte) AES key " +
                    "before starting the application.");
        }
        byte[] keyBytes;
        try {
            keyBytes = Base64.getDecoder().decode(base64Key.trim());
        } catch (IllegalArgumentException ex) {
            throw new IllegalStateException(
                    "FINDSTAY_PII_ENCRYPTION_KEY is not valid Base64.", ex);
        }
        if (keyBytes.length != KEY_BYTES) {
            throw new IllegalStateException(
                    "FINDSTAY_PII_ENCRYPTION_KEY must decode to exactly 32 bytes (256 bits); " +
                    "got " + keyBytes.length + " bytes.");
        }
        this.secretKey = new SecretKeySpec(keyBytes, KEY_ALGORITHM);
    }

    /**
     * Validates the Ghana Card format then encrypts it with AES-256-GCM.
     *
     * <p>A unique random 96-bit IV is generated per call, so calling this method twice
     * with the same input produces different stored ciphertexts.
     *
     * @param rawNumber Ghana Card number, case-insensitive (e.g. {@code GHA-123456789-5}
     *                  or {@code gha-123456789-5}); normalised to uppercase before encrypting
     * @return {@code byte[]} in the format {@code [12-byte IV] || [ciphertext + 16-byte GCM tag]}
     *         for direct storage in the {@code bytea} column
     * @throws AppException with {@link com.findstay.shared.error.ErrorCode#VALIDATION_FAILED}
     *         if the Ghana Card format is invalid
     */
    byte[] encrypt(String rawNumber) {
        String normalized = validate(rawNumber);
        byte[] iv = new byte[IV_BYTES];
        secureRandom.nextBytes(iv);

        byte[] ciphertext;
        try {
            Cipher cipher = Cipher.getInstance(CIPHER_ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, new GCMParameterSpec(GCM_TAG_BITS, iv));
            ciphertext = cipher.doFinal(normalized.getBytes(StandardCharsets.UTF_8));
        } catch (Exception ex) {
            throw new IllegalStateException("Ghana Card encryption failed", ex);
        }

        byte[] result = new byte[IV_BYTES + ciphertext.length];
        System.arraycopy(iv, 0, result, 0, IV_BYTES);
        System.arraycopy(ciphertext, 0, result, IV_BYTES, ciphertext.length);
        return result;
    }

    /**
     * Decrypts a stored ciphertext back to the original Ghana Card number.
     *
     * <p>For internal use only — called by admin-review or compliance code that
     * legitimately needs the raw number after an authorised read of the
     * {@code verification_case} row.
     *
     * @param stored the {@code bytea} value from the database column
     * @return the original normalised Ghana Card number (e.g. {@code GHA-123456789-5})
     * @throws IllegalStateException if decryption fails (wrong key, corrupted data)
     * @throws IllegalArgumentException if {@code stored} is null or too short to contain an IV
     */
    String decrypt(byte[] stored) {
        if (stored == null || stored.length <= IV_BYTES) {
            throw new IllegalArgumentException(
                    "Stored ciphertext is null or too short to contain an IV");
        }
        byte[] iv = Arrays.copyOfRange(stored, 0, IV_BYTES);
        byte[] ciphertext = Arrays.copyOfRange(stored, IV_BYTES, stored.length);

        try {
            Cipher cipher = Cipher.getInstance(CIPHER_ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, new GCMParameterSpec(GCM_TAG_BITS, iv));
            return new String(cipher.doFinal(ciphertext), StandardCharsets.UTF_8);
        } catch (Exception ex) {
            throw new IllegalStateException("Ghana Card decryption failed", ex);
        }
    }

    /**
     * Returns a safely masked Ghana Card number for use in UI and API responses.
     *
     * <p>The first six digits of the nine-digit middle segment are replaced with
     * asterisks; the last three digits and the check digit remain visible so an owner
     * can confirm which card they submitted without revealing the sensitive portion.
     *
     * <p>Example: {@code GHA-123456789-5} → {@code GHA-******789-5}
     *
     * @param rawNumber Ghana Card number, case-insensitive; normalised before masking
     * @throws AppException with {@link com.findstay.shared.error.ErrorCode#VALIDATION_FAILED}
     *         if the Ghana Card format is invalid
     */
    String mask(String rawNumber) {
        String normalized = validate(rawNumber);
        // Format: GHA-NNNNNNNNN-C  (positions 0-14, length 15)
        //   "GHA-"       → positions 0-3
        //   9 digits     → positions 4-12
        //   "-"          → position 13
        //   check digit  → position 14
        String middleNine = normalized.substring(MIDDLE_SEGMENT_START, MIDDLE_SEGMENT_END);
        String checkDigit = normalized.substring(CHECK_DIGIT_START);
        String maskedMiddle = "******" + middleNine.substring(MIDDLE_SEGMENT_END - MIDDLE_SEGMENT_START - VISIBLE_TAIL_LENGTH);
        return "GHA-" + maskedMiddle + "-" + checkDigit;
    }

    /**
     * Validates and normalises a raw Ghana Card number string.
     *
     * <p>Trims whitespace and upper-cases the input before pattern matching.
     * The accepted format is {@code GHA-XXXXXXXXX-X} where X is a decimal digit.
     *
     * @param rawNumber the raw input from the caller
     * @return the normalised (uppercase, trimmed) Ghana Card number
     * @throws AppException VALIDATION_FAILED if null, blank, or format mismatch
     */
    private static String validate(String rawNumber) {
        if (rawNumber == null || rawNumber.isBlank()) {
            throw AppException.validation("Ghana Card number is required", List.of(
                    new ApiError.Detail("ghanaCardNumber", "must not be blank")));
        }
        String normalized = rawNumber.trim().toUpperCase(Locale.ROOT);
        if (!GHANA_CARD_PATTERN.matcher(normalized).matches()) {
            throw AppException.validation("Ghana Card number format is invalid", List.of(
                    new ApiError.Detail("ghanaCardNumber",
                            "must match GHA-XXXXXXXXX-X " +
                            "(9-digit personal number followed by 1 check digit)")));
        }
        return normalized;
    }
}
