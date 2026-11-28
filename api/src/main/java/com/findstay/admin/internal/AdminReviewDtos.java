package com.findstay.admin.internal;

import com.findstay.listing.api.ListingReviewItemView;
import com.findstay.listing.api.UnitSummaryView;
import com.findstay.media.api.MediaAssetSummary;
import com.findstay.shared.validation.SafeText;
import com.findstay.verification.api.ReviewDecisionType;
import com.findstay.verification.api.ReviewDecisionView;
import com.findstay.verification.api.ReviewEntityKind;
import com.findstay.verification.api.VerificationCaseView;
import com.findstay.verification.api.VerificationDocumentType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

final class AdminReviewDtos {

    private AdminReviewDtos() {
    }

    record ReviewQueueItemResponse(
            UUID id,
            ReviewEntityKind kind,
            UUID organizationId,
            String organizationName,
            String title,
            String subtitle,
            String status,
            Instant updatedAt
    ) {
    }

    record ReviewDetailResponse(
            UUID id,
            ReviewEntityKind kind,
            UUID organizationId,
            String organizationName,
            String status,
            VerificationCaseView verificationCase,
            ListingReviewItemView listing,
            List<UnitSummaryView> units,
            List<MediaAssetSummary> listingPhotos,
            List<ReviewDecisionView> decisions
    ) {
    }

    record ReviewDecisionRequest(
            @NotNull(message = "decision is required")
            ReviewDecisionType decision,

            @Size(max = 1000)
            @SafeText
            String reason,

            List<@Size(max = 300) String> corrections,

            List<VerificationDocumentType> rejectedDocumentTypes
    ) {
    }

    record ListingModerationRequest(
            @Size(max = 1000)
            @SafeText
            String reason
    ) {
    }
}
