package com.findstay.verification.api;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Public boundary of the {@code verification} module ({@code S1-12}, consumed by {@code S1-15}
 * admin review queue and {@code S1-13} listing verification gate).
 */
public interface VerificationReviewApi {

    /** Returns whether the organisation currently holds an {@code APPROVED} verification case. */
    boolean isOrganizationApproved(UUID organizationId);

    /** Lists verification cases filtered by status (or all when {@code status == null}). */
    List<VerificationCaseView> listCasesForReview(VerificationCaseStatus status);

    /** Loads a single verification case for an authorised admin reviewer. */
    VerificationCaseView getCaseForReview(UUID caseId);

    /** Returns the latest verification case for an organisation, if any. */
    Optional<VerificationCaseView> findLatestCaseForOrganization(UUID organizationId);

    /**
     * Applies an admin reviewer's decision to a {@code PENDING} verification case, updates
     * {@code organization.verification_status}, records {@code verification.review_decision},
     * and dispatches owner lifecycle notifications.
     */
    VerificationCaseView decideVerificationCase(
            UUID caseId,
            UUID adminUserId,
            ReviewDecisionType decision,
            String reason,
            List<String> corrections,
            List<VerificationDocumentType> rejectedDocumentTypes
    );

    /**
     * Persists a listing review decision row in {@code verification.review_decision}
     * ({@code entity_kind = 'LISTING'}) for {@code S1-15}.
     */
    ReviewDecisionView recordListingReviewDecision(
            UUID propertyId,
            UUID adminUserId,
            ReviewDecisionType decision,
            String reason,
            List<String> corrections
    );

    /** Lists review decisions for either a verification case or a listing (newest first). */
    List<ReviewDecisionView> listDecisions(ReviewEntityKind entityKind, UUID entityId);
}
