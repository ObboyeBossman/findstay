package com.findstay.media.internal;

import com.findstay.media.api.MediaOwnerType;
import com.findstay.shared.validation.SafeText;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.util.UUID;

final class MediaDtos {

    private MediaDtos() {
    }

    record PresignUploadHttpRequest(
            @NotNull(message = "ownerType is required")
            MediaOwnerType ownerType,

            @NotNull(message = "ownerId is required")
            UUID ownerId,

            @NotBlank(message = "filename is required")
            @Size(max = 200, message = "filename must be 200 characters or fewer")
            @SafeText
            String filename,

            @NotBlank(message = "contentType is required")
            @Size(max = 100, message = "contentType must be 100 characters or fewer")
            String contentType,

            @Positive(message = "sizeBytes must be greater than zero")
            long sizeBytes
    ) {
    }
}
