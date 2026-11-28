package com.findstay.verification.api;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ReviewDecisionView(
        UUID id,
        ReviewEntityKind entityKind,
        UUID entityId,
        ReviewDecisionType decision,
        String reason,
        List<String> corrections,
        List<VerificationDocumentType> rejectedDocumentTypes,
        UUID decidedByUserId,
        Instant decidedAt
) {
}
