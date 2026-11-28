package com.findstay.verification.api;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Public view of an owner verification case. Never exposes plaintext Ghana Card numbers — only the
 * safely masked format (e.g. {@code GHA-******789-5}).
 */
public record VerificationCaseView(
        UUID id,
        UUID organizationId,
        VerificationCaseStatus status,
        String maskedGhanaCardNumber,
        Instant submittedAt,
        Instant decidedAt,
        List<VerificationDocumentView> documents,
        List<ReviewDecisionView> decisions
) {
}
