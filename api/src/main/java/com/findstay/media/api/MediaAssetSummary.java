package com.findstay.media.api;

import java.time.Instant;
import java.util.UUID;

/** Public projection of an uploaded asset and its document ownership link. */
public record MediaAssetSummary(
        UUID assetId,
        UUID documentId,
        UUID organizationId,
        MediaOwnerType ownerType,
        UUID ownerId,
        MediaBucket bucket,
        String storageKey,
        String contentType,
        long sizeBytes,
        MediaAssetStatus status,
        String publicUrl,
        Instant createdAt,
        Instant uploadedAt
) {
}
