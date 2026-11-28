package com.findstay.admin.internal;

import com.findstay.admin.internal.AdminReviewDtos.ListingModerationRequest;
import com.findstay.admin.internal.AdminReviewDtos.ReviewDecisionRequest;
import com.findstay.admin.internal.AdminReviewDtos.ReviewDetailResponse;
import com.findstay.admin.internal.AdminReviewDtos.ReviewQueueItemResponse;
import com.findstay.audit.api.AuditRecord;
import com.findstay.audit.api.AuditRecorder;
import com.findstay.listing.api.CatalogQuery;
import com.findstay.listing.api.ListingModerationApi;
import com.findstay.listing.api.ListingReviewItemView;
import com.findstay.listing.api.PropertyStatus;
import com.findstay.listing.api.UnitSummaryView;
import com.findstay.media.api.MediaAssetSummary;
import com.findstay.media.api.MediaOwnerType;
import com.findstay.media.api.MediaServiceApi;
import com.findstay.organization.api.OrganizationAccessApi;
import com.findstay.organization.api.OrganizationSummary;
import com.findstay.shared.error.ApiError;
import com.findstay.shared.error.AppException;
import com.findstay.shared.error.ErrorCode;
import com.findstay.verification.api.ReviewDecisionType;
import com.findstay.verification.api.ReviewDecisionView;
import com.findstay.verification.api.ReviewEntityKind;
import com.findstay.verification.api.VerificationCaseStatus;
import com.findstay.verification.api.VerificationCaseView;
import com.findstay.verification.api.VerificationReviewApi;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

/**
 * Orchestrates the unified Admin Review Queue, three-way review decisions, and listing
 * suspension/restoration across {@code verification}, {@code listing}, {@code media},
 * {@code audit}, and {@code organization} public API seams ({@code S1-15-T3}).
 */
@Service
class AdminReviewService {

    private final VerificationReviewApi verificationReviewApi;
    private final ListingModerationApi listingModerationApi;
    private final CatalogQuery catalogQuery;
    private final MediaServiceApi mediaServiceApi;
    private final OrganizationAccessApi organizationAccessApi;
    private final AuditRecorder auditRecorder;

    AdminReviewService(
            VerificationReviewApi verificationReviewApi,
            ListingModerationApi listingModerationApi,
            CatalogQuery catalogQuery,
            MediaServiceApi mediaServiceApi,
            OrganizationAccessApi organizationAccessApi,
            AuditRecorder auditRecorder
    ) {
        this.verificationReviewApi = verificationReviewApi;
        this.listingModerationApi = listingModerationApi;
        this.catalogQuery = catalogQuery;
        this.mediaServiceApi = mediaServiceApi;
        this.organizationAccessApi = organizationAccessApi;
        this.auditRecorder = auditRecorder;
    }

    @Transactional(readOnly = true)
    List<ReviewQueueItemResponse> listReviewQueue(String kindParam, String statusParam) {
        String normalizedKind = kindParam == null ? "ALL" : kindParam.trim().toUpperCase(Locale.ROOT);
        String normalizedStatus = statusParam == null ? "PENDING" : statusParam.trim().toUpperCase(Locale.ROOT);

        Map<UUID, String> orgNameCache = new HashMap<>();
        List<ReviewQueueItemResponse> items = new ArrayList<>();

        boolean includeVerifications = "ALL".equals(normalizedKind) || "VERIFICATION".equals(normalizedKind);
        boolean includeListings = "ALL".equals(normalizedKind) || "LISTING".equals(normalizedKind);

        if (includeVerifications && !"LIVE".equals(normalizedStatus)) {
            List<VerificationCaseView> cases = "PENDING".equals(normalizedStatus)
                    ? verificationReviewApi.listCasesForReview(VerificationCaseStatus.PENDING)
                    : verificationReviewApi.listCasesForReview(null);

            for (VerificationCaseView c : cases) {
                if ("DECIDED".equals(normalizedStatus) && c.status() == VerificationCaseStatus.PENDING) {
                    continue;
                }
                String orgName = resolveOrgName(c.organizationId(), orgNameCache);
                items.add(new ReviewQueueItemResponse(
                        c.id(),
                        ReviewEntityKind.VERIFICATION,
                        c.organizationId(),
                        orgName,
                        orgName + " — Owner Verification",
                        "Ghana Card " + c.maskedGhanaCardNumber() + " · " + c.documents().size() + " documents",
                        c.status().name(),
                        c.decidedAt() != null ? c.decidedAt() : c.submittedAt()
                ));
            }
        }

        if (includeListings) {
            List<ListingReviewItemView> listings = "PENDING".equals(normalizedStatus)
                    ? listingModerationApi.listPropertiesForReview(PropertyStatus.PENDING_REVIEW)
                    : listingModerationApi.listPropertiesForReview(null);

            for (ListingReviewItemView l : listings) {
                if ("LIVE".equals(normalizedStatus)
                        && l.status() != PropertyStatus.ACTIVE
                        && l.status() != PropertyStatus.PAUSED
                        && l.status() != PropertyStatus.SUSPENDED) {
                    continue;
                }
                if ("DECIDED".equals(normalizedStatus)
                        && (l.status() == PropertyStatus.DRAFT || l.status() == PropertyStatus.PENDING_REVIEW)) {
                    continue;
                }
                if ("ALL".equals(normalizedStatus) && l.status() == PropertyStatus.DRAFT) {
                    continue;
                }
                String orgName = resolveOrgName(l.organizationId(), orgNameCache);
                String location = (l.areaName() != null ? l.areaName() + ", " : "") + l.town();
                items.add(new ReviewQueueItemResponse(
                        l.propertyId(),
                        ReviewEntityKind.LISTING,
                        l.organizationId(),
                        orgName,
                        l.name(),
                        location + " · " + l.unitCount() + " unit(s) · " + l.photoCount() + " photo(s)",
                        l.status().name(),
                        l.updatedAt()
                ));
            }
        }

        items.sort(Comparator.comparing(
                ReviewQueueItemResponse::updatedAt,
                Comparator.nullsLast(Comparator.reverseOrder())
        ));
        return items;
    }

    @Transactional(readOnly = true)
    ReviewDetailResponse getReviewDetail(ReviewEntityKind kind, UUID id) {
        if (kind == ReviewEntityKind.VERIFICATION) {
            VerificationCaseView vCase = verificationReviewApi.getCaseForReview(id);
            String orgName = resolveOrgName(vCase.organizationId(), new HashMap<>());
            List<ReviewDecisionView> decisions = verificationReviewApi.listDecisions(ReviewEntityKind.VERIFICATION, id);
            return new ReviewDetailResponse(
                    vCase.id(),
                    ReviewEntityKind.VERIFICATION,
                    vCase.organizationId(),
                    orgName,
                    vCase.status().name(),
                    vCase,
                    null,
                    List.of(),
                    List.of(),
                    decisions
            );
        }

        ListingReviewItemView listing = listingModerationApi.getPropertyForReview(id);
        String orgName = resolveOrgName(listing.organizationId(), new HashMap<>());
        List<UnitSummaryView> units = catalogQuery.listUnitsForProperty(id);
        List<MediaAssetSummary> photos = mediaServiceApi.listDocuments(MediaOwnerType.PROPERTY_PHOTO, id);
        List<ReviewDecisionView> decisions = verificationReviewApi.listDecisions(ReviewEntityKind.LISTING, id);
        return new ReviewDetailResponse(
                listing.propertyId(),
                ReviewEntityKind.LISTING,
                listing.organizationId(),
                orgName,
                listing.status().name(),
                null,
                listing,
                units,
                photos,
                decisions
        );
    }

    @Transactional
    ReviewDetailResponse decideReview(
            UUID adminUserId,
            ReviewEntityKind kind,
            UUID id,
            ReviewDecisionRequest request
    ) {
        ReviewDecisionType decision = request.decision();
        String reason = request.reason() != null ? request.reason().trim() : "";
        List<String> corrections = request.corrections() == null
                ? List.of()
                : request.corrections().stream()
                .filter(c -> c != null && !c.isBlank())
                .map(String::trim)
                .toList();

        if (decision == ReviewDecisionType.REJECT && reason.isBlank()) {
            throw new AppException(
                    ErrorCode.BUSINESS_RULE_VIOLATION,
                    "A written reason is mandatory when rejecting a submission",
                    List.of(new ApiError.Detail("reason", "Provide a written rejection reason"))
            );
        }
        if (decision == ReviewDecisionType.REQUEST_CORRECTIONS) {
            boolean hasFixDetail = !reason.isBlank() || !corrections.isEmpty();
            if (!hasFixDetail) {
                throw new AppException(
                        ErrorCode.BUSINESS_RULE_VIOLATION,
                        "Written correction notes are mandatory when requesting corrections",
                        List.of(new ApiError.Detail("reason", "Specify what the owner must fix"))
                );
            }
        }

        if (kind == ReviewEntityKind.VERIFICATION) {
            VerificationCaseView updated = verificationReviewApi.decideVerificationCase(
                    id,
                    adminUserId,
                    decision,
                    reason,
                    corrections,
                    request.rejectedDocumentTypes()
            );

            String auditAction = switch (decision) {
                case APPROVE -> "verification.approved";
                case REQUEST_CORRECTIONS -> "verification.corrections_requested";
                case REJECT -> "verification.rejected";
            };
            Map<String, Object> meta = new LinkedHashMap<>();
            if (!reason.isBlank()) meta.put("reason", reason);
            if (!corrections.isEmpty()) meta.put("corrections", corrections);
            meta.put("resultingStatus", updated.status().name());

            auditRecorder.record(new AuditRecord(
                    adminUserId,
                    updated.organizationId(),
                    auditAction,
                    "VERIFICATION_CASE",
                    updated.id().toString(),
                    meta
            ));
            return getReviewDetail(ReviewEntityKind.VERIFICATION, updated.id());
        }

        // LISTING three-way decision
        ListingReviewItemView updated = switch (decision) {
            case APPROVE -> listingModerationApi.approveAndPublish(id, adminUserId, reason);
            case REQUEST_CORRECTIONS -> listingModerationApi.requestCorrections(
                    id,
                    adminUserId,
                    !reason.isBlank() ? reason : String.join("; ", corrections)
            );
            case REJECT -> listingModerationApi.rejectListing(id, adminUserId, reason);
        };

        verificationReviewApi.recordListingReviewDecision(
                id,
                adminUserId,
                decision,
                !reason.isBlank() ? reason : String.join("; ", corrections),
                corrections
        );

        String auditAction = switch (decision) {
            case APPROVE -> "listing.approved";
            case REQUEST_CORRECTIONS -> "listing.corrections_requested";
            case REJECT -> "listing.rejected";
        };
        Map<String, Object> meta = new LinkedHashMap<>();
        if (!reason.isBlank()) meta.put("reason", reason);
        if (!corrections.isEmpty()) meta.put("corrections", corrections);
        meta.put("propertyName", updated.name());
        meta.put("resultingStatus", updated.status().name());

        auditRecorder.record(new AuditRecord(
                adminUserId,
                updated.organizationId(),
                auditAction,
                "PROPERTY",
                updated.propertyId().toString(),
                meta
        ));

        return getReviewDetail(ReviewEntityKind.LISTING, updated.propertyId());
    }

    @Transactional
    ReviewDetailResponse suspendListing(UUID adminUserId, UUID propertyId, ListingModerationRequest request) {
        String reason = request != null && request.reason() != null ? request.reason().trim() : "";
        if (reason.isBlank()) {
            throw new AppException(
                    ErrorCode.BUSINESS_RULE_VIOLATION,
                    "A written reason is mandatory when suspending a listing",
                    List.of(new ApiError.Detail("reason", "Provide a written suspension reason"))
            );
        }
        ListingReviewItemView updated = listingModerationApi.suspendListing(propertyId, adminUserId, reason);
        auditRecorder.record(new AuditRecord(
                adminUserId,
                updated.organizationId(),
                "listing.suspended",
                "PROPERTY",
                updated.propertyId().toString(),
                Map.of("reason", reason, "propertyName", updated.name())
        ));
        return getReviewDetail(ReviewEntityKind.LISTING, updated.propertyId());
    }

    @Transactional
    ReviewDetailResponse restoreListing(UUID adminUserId, UUID propertyId, ListingModerationRequest request) {
        String reason = request != null && request.reason() != null ? request.reason().trim() : "";
        if (reason.isBlank()) {
            throw new AppException(
                    ErrorCode.BUSINESS_RULE_VIOLATION,
                    "A written reason is mandatory when restoring a suspended listing",
                    List.of(new ApiError.Detail("reason", "Provide a written restoration reason"))
            );
        }
        ListingReviewItemView updated = listingModerationApi.restoreListing(propertyId, adminUserId, reason);
        auditRecorder.record(new AuditRecord(
                adminUserId,
                updated.organizationId(),
                "listing.restored",
                "PROPERTY",
                updated.propertyId().toString(),
                Map.of("reason", reason, "propertyName", updated.name())
        ));
        return getReviewDetail(ReviewEntityKind.LISTING, updated.propertyId());
    }

    private String resolveOrgName(UUID organizationId, Map<UUID, String> cache) {
        return cache.computeIfAbsent(organizationId, id ->
                organizationAccessApi.findOrganizationById(id)
                        .map(OrganizationSummary::displayName)
                        .orElse("Organisation " + id.toString().substring(0, 8))
        );
    }
}
