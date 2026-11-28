package com.findstay.admin.internal;

import com.findstay.admin.internal.AdminReviewDtos.ListingModerationRequest;
import com.findstay.admin.internal.AdminReviewDtos.ReviewDecisionRequest;
import com.findstay.admin.internal.AdminReviewDtos.ReviewDetailResponse;
import com.findstay.admin.internal.AdminReviewDtos.ReviewQueueItemResponse;
import com.findstay.shared.security.OrgScope;
import com.findstay.shared.security.RequiresPermission;
import com.findstay.verification.api.ReviewEntityKind;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * Administrator approval queue, review decision, and listing moderation endpoints ({@code S1-15-T3}).
 */
@RestController
@RequestMapping("/api/v1/admin")
class AdminReviewController {

    private final AdminReviewService adminReviewService;

    AdminReviewController(AdminReviewService adminReviewService) {
        this.adminReviewService = adminReviewService;
    }

    @GetMapping("/reviews")
    @RequiresPermission("admin.review.read")
    List<ReviewQueueItemResponse> listReviewQueue(
            @RequestParam(required = false) String kind,
            @RequestParam(required = false, defaultValue = "PENDING") String status
    ) {
        return adminReviewService.listReviewQueue(kind, status);
    }

    @GetMapping("/reviews/{kind}/{id}")
    @RequiresPermission("admin.review.read")
    ReviewDetailResponse getReviewDetail(
            @PathVariable ReviewEntityKind kind,
            @PathVariable UUID id
    ) {
        return adminReviewService.getReviewDetail(kind, id);
    }

    @PostMapping("/reviews/{kind}/{id}/decision")
    @RequiresPermission("admin.review.decide")
    ReviewDetailResponse decideReview(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable ReviewEntityKind kind,
            @PathVariable UUID id,
            @Valid @RequestBody ReviewDecisionRequest request
    ) {
        return adminReviewService.decideReview(OrgScope.requireUserId(jwt), kind, id, request);
    }

    @PostMapping("/listings/{propertyId}/suspend")
    @RequiresPermission("admin.listing.moderate")
    ReviewDetailResponse suspendListing(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID propertyId,
            @Valid @RequestBody(required = false) ListingModerationRequest request
    ) {
        return adminReviewService.suspendListing(OrgScope.requireUserId(jwt), propertyId, request);
    }

    @PostMapping("/listings/{propertyId}/restore")
    @RequiresPermission("admin.listing.moderate")
    ReviewDetailResponse restoreListing(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID propertyId,
            @Valid @RequestBody(required = false) ListingModerationRequest request
    ) {
        return adminReviewService.restoreListing(OrgScope.requireUserId(jwt), propertyId, request);
    }
}
