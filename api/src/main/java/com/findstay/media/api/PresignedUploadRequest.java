package com.findstay.media.api;

import java.util.UUID;

/** Request passed by owning modules or the media API to issue a direct-to-R2 pre-signed PUT URL. */
public record PresignedUploadRequest(
        UUID organizationId,
        MediaOwnerType ownerType,
        UUID ownerId,
        String filename,
        String contentType,
        long sizeBytes
) {
}
