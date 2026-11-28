package com.findstay.verification.internal;

import com.findstay.audit.api.AuditRecord;
import com.findstay.audit.api.AuditRecorder;
import com.findstay.shared.error.ApiError;
import com.findstay.shared.error.AppException;
import com.findstay.shared.id.IdGenerator;
import com.findstay.shared.privacy.PrivacyPolicyVersionLookup;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.InetAddress;
import java.sql.Timestamp;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Ghana Act 843 privacy notice metadata and append-only consent recording ({@code S1-11-T2},
 * {@code S1-11-T3}, {@code NFR-31}, {@code NFR-36}).
 *
 * <p>Stores records in {@code verification.consent_record} with PostgreSQL {@code inet} IP
 * addresses and records {@code consent.recorded} in {@code audit.audit_log}.
 */
@Service
class ConsentService {

    private static final String PRIVACY_POLICY_URL = "/privacy";
    private static final String FALLBACK_IP = "127.0.0.1";

    private final JdbcTemplate jdbc;
    private final ObjectProvider<PrivacyPolicyVersionLookup> policyVersionLookup;
    private final AuditRecorder auditRecorder;
    private final IdGenerator idGenerator;
    private final Clock clock;

    ConsentService(
            JdbcTemplate jdbc,
            ObjectProvider<PrivacyPolicyVersionLookup> policyVersionLookup,
            AuditRecorder auditRecorder,
            IdGenerator idGenerator,
            Clock clock
    ) {
        this.jdbc = jdbc;
        this.policyVersionLookup = policyVersionLookup;
        this.auditRecorder = auditRecorder;
        this.idGenerator = idGenerator;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    ConsentDtos.PrivacyNoticeMetadata getPrivacyNoticeMetadata() {
        return new ConsentDtos.PrivacyNoticeMetadata(
                resolveCurrentPolicyVersion(),
                "2026-11-15",
                "Data Protection Act, 2012 (Act 843), Republic of Ghana",
                "Data Protection Commission (DPC), Ghana",
                "privacy@findstay.com",
                PRIVACY_POLICY_URL
        );
    }

    @Transactional(readOnly = true)
    ConsentDtos.ConsentStateView getLatestConsentState(UUID userId) {
        String currentVersion = resolveCurrentPolicyVersion();
        List<ConsentDtos.ConsentRecordView> history = listUserConsentHistory(userId);
        Instant acceptedForCurrent = history.stream()
                .filter(r -> currentVersion.equals(r.policyVersion()))
                .map(ConsentDtos.ConsentRecordView::consentedAt)
                .findFirst()
                .orElse(null);

        return new ConsentDtos.ConsentStateView(
                currentVersion,
                PRIVACY_POLICY_URL,
                acceptedForCurrent,
                acceptedForCurrent == null,
                history
        );
    }

    @Transactional
    ConsentDtos.ConsentRecordView recordConsent(
            UUID userId,
            ConsentDtos.RecordConsentRequest request,
            String clientIp
    ) {
        if (request == null || !Boolean.TRUE.equals(request.accepted())) {
            throw AppException.validation(
                    "Explicit consent to the Ghana Act 843 Privacy Notice is required",
                    List.of(new ApiError.Detail("accepted", "You must accept the Privacy Notice"))
            );
        }

        String currentVersion = resolveCurrentPolicyVersion();
        String requestedVersion = (request.policyVersion() != null && !request.policyVersion().isBlank())
                ? request.policyVersion().trim()
                : currentVersion;

        if (!currentVersion.equals(requestedVersion)) {
            throw AppException.validation(
                    "Consent must reference the active privacy policy version (" + currentVersion + ")",
                    List.of(new ApiError.Detail("policyVersion", "Expected policy version " + currentVersion))
            );
        }

        UUID recordId = idGenerator.newId();
        Instant now = clock.instant();
        String sanitizedIp = sanitizeIpAddress(clientIp);

        jdbc.update(
                """
                INSERT INTO verification.consent_record
                    (id, user_id, policy_version, consented_at, ip_address, created_at)
                VALUES (?, ?, ?, ?, CAST(? AS inet), ?)
                """,
                recordId,
                userId,
                requestedVersion,
                Timestamp.from(now),
                sanitizedIp,
                Timestamp.from(now)
        );

        auditRecorder.record(new AuditRecord(
                userId,
                null,
                "consent.recorded",
                "CONSENT_RECORD",
                recordId.toString(),
                Map.of(
                        "policyVersion", requestedVersion,
                        "law", "Ghana Act 843"
                )
        ));

        return new ConsentDtos.ConsentRecordView(
                recordId,
                userId,
                requestedVersion,
                now,
                sanitizedIp
        );
    }

    private List<ConsentDtos.ConsentRecordView> listUserConsentHistory(UUID userId) {
        return jdbc.query(
                """
                SELECT id, user_id, policy_version, consented_at, host(ip_address) AS ip_text
                FROM verification.consent_record
                WHERE user_id = ?
                ORDER BY consented_at DESC
                """,
                (rs, rowNum) -> new ConsentDtos.ConsentRecordView(
                        rs.getObject("id", UUID.class),
                        rs.getObject("user_id", UUID.class),
                        rs.getString("policy_version"),
                        rs.getTimestamp("consented_at").toInstant(),
                        rs.getString("ip_text")
                ),
                userId
        );
    }

    private String resolveCurrentPolicyVersion() {
        PrivacyPolicyVersionLookup lookup = policyVersionLookup.getIfAvailable();
        return lookup != null ? lookup.currentPolicyVersion() : PrivacyPolicyVersionLookup.DEFAULT_VERSION;
    }

    private static String sanitizeIpAddress(String rawIp) {
        if (rawIp == null || rawIp.isBlank()) {
            return FALLBACK_IP;
        }
        String candidate = rawIp.split(",")[0].trim();
        try {
            InetAddress parsed = InetAddress.getByName(candidate);
            return parsed.getHostAddress();
        } catch (Exception ex) {
            return FALLBACK_IP;
        }
    }
}
