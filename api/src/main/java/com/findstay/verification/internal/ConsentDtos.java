package com.findstay.verification.internal;

import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

final class ConsentDtos {

    private ConsentDtos() {
    }

    record PrivacyNoticeMetadata(
            String policyVersion,
            String effectiveDate,
            String governingLaw,
            String supervisoryAuthority,
            String dpoEmail,
            String policyUrl
    ) {
    }

    record RecordConsentRequest(
            Boolean accepted,

            @Size(max = 32)
            String policyVersion
    ) {
    }

    record ConsentRecordView(
            UUID id,
            UUID userId,
            String policyVersion,
            Instant consentedAt,
            String ipAddress
    ) {
    }

    record ConsentStateView(
            String policyVersion,
            String policyUrl,
            Instant acceptedAt,
            boolean requiresConsent,
            List<ConsentRecordView> history
    ) {
    }
}
