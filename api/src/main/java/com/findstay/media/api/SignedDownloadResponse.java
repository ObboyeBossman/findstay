package com.findstay.media.api;

import java.time.Instant;
import java.util.UUID;

/** Short-lived signed GET URL for accessing a private verification document (S1-09-T5). */
public record SignedDownloadResponse(
        UUID assetId,
        String storageKey,
        String downloadUrl,
        Instant expiresAt,
        String contentType,
        long sizeBytes
) {
}
