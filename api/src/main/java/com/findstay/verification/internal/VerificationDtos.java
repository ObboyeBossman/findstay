package com.findstay.verification.internal;

import com.findstay.media.api.PresignedUploadResponse;
import com.findstay.shared.validation.SafeText;
import com.findstay.verification.api.VerificationCaseView;
import com.findstay.verification.api.VerificationDocumentType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

final class VerificationDtos {

    private VerificationDtos() {
    }

    record PresignVerificationDocRequest(
            @NotNull(message = "documentType is required")
            VerificationDocumentType documentType,

            @NotBlank(message = "filename is required")
            @Size(max = 200)
            @SafeText
            String filename,

            @NotBlank(message = "contentType is required")
            @Size(max = 100)
            String contentType,

            @Positive(message = "sizeBytes must be positive")
            long sizeBytes
    ) {
    }

    record VerificationPresignResponse(
            VerificationDocumentType documentType,
            UUID documentId,
            PresignedUploadResponse upload
    ) {
    }

    record SubmittedDocumentInput(
            @NotNull(message = "documentType is required")
            VerificationDocumentType documentType,

            @NotNull(message = "documentId is required")
            UUID documentId,

            @NotNull(message = "assetId is required")
            UUID assetId
    ) {
    }

    record SubmitVerificationRequest(
            @NotBlank(message = "ghanaCardNumber is required")
            @Size(max = 32)
            String ghanaCardNumber,

            @NotEmpty(message = "documents are required")
            List<@Valid SubmittedDocumentInput> documents
    ) {
    }

    record ResubmitVerificationRequest(
            @Size(max = 32)
            String ghanaCardNumber,

            @NotEmpty(message = "At least one updated document is required")
            List<@Valid SubmittedDocumentInput> documents
    ) {
    }

    record OwnerVerificationStatusResponse(
            UUID organizationId,
            String organizationVerificationStatus,
            VerificationCaseView verificationCase
    ) {
    }
}
