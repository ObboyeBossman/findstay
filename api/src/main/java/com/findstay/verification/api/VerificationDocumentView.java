package com.findstay.verification.api;

import java.time.Instant;
import java.util.UUID;

public record VerificationDocumentView(
        UUID id,
        VerificationDocumentType documentType,
        VerificationDocumentStatus status,
        String fixNote,
        UUID mediaAssetId,
        Instant submittedAt
) {
}
