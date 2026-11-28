package com.findstay.media.api;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

/** Result of issuing a direct-to-R2 pre-signed PUT upload URL (S1-09-T4). */
public record PresignedUploadResponse(
        UUID assetId,
        UUID documentId,
        MediaBucket bucket,
        String storageKey,
        String uploadUrl,
        Map<String, String> requiredHeaders,
        Instant expiresAt,
        String publicUrl
) {
}
