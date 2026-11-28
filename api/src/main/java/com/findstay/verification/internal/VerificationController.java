package com.findstay.verification.internal;

import com.findstay.media.api.SignedDownloadResponse;
import com.findstay.shared.security.OrgMembership;
import com.findstay.shared.security.OrgScope;
import com.findstay.shared.security.RequiresPermission;
import com.findstay.verification.api.VerificationCaseView;
import com.findstay.verification.internal.VerificationDtos.OwnerVerificationStatusResponse;
import com.findstay.verification.internal.VerificationDtos.PresignVerificationDocRequest;
import com.findstay.verification.internal.VerificationDtos.ResubmitVerificationRequest;
import com.findstay.verification.internal.VerificationDtos.SubmitVerificationRequest;
import com.findstay.verification.internal.VerificationDtos.VerificationPresignResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * Owner verification endpoints ({@code S1-12-T4}): status tracker, pre-signed private document
 * upload slots, submit, resubmit after corrections, and owner-only signed preview URLs.
 *
 * <p>Strictly restricted to organisation {@code OWNER} accounts ({@code STAFF} and {@code GUEST}
 * receive {@code 403 FORBIDDEN}).
 */
@RestController
@RequestMapping("/api/v1/owner/verification")
class VerificationController {

    private final VerificationService verificationService;
    private final OrgScope orgScope;

    VerificationController(VerificationService verificationService, OrgScope orgScope) {
        this.verificationService = verificationService;
        this.orgScope = orgScope;
    }

    @GetMapping
    @RequiresPermission("verification.read")
    OwnerVerificationStatusResponse getVerificationStatus(@AuthenticationPrincipal Jwt jwt) {
        OrgMembership membership = orgScope.requireOwner(jwt);
        return verificationService.getOwnerStatus(membership.organizationId());
    }

    @PostMapping("/presign")
    @ResponseStatus(HttpStatus.CREATED)
    @RequiresPermission("verification.submit")
    VerificationPresignResponse presignDocument(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody PresignVerificationDocRequest request
    ) {
        OrgMembership membership = orgScope.requireOwner(jwt);
        return verificationService.presignDocument(membership.organizationId(), request);
    }

    @PostMapping("/submit")
    @ResponseStatus(HttpStatus.CREATED)
    @RequiresPermission("verification.submit")
    VerificationCaseView submitVerification(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody SubmitVerificationRequest request
    ) {
        UUID userId = OrgScope.requireUserId(jwt);
        OrgMembership membership = orgScope.requireOwner(userId);
        return verificationService.submitCase(membership.organizationId(), userId, request);
    }

    @PostMapping("/resubmit")
    @RequiresPermission("verification.submit")
    VerificationCaseView resubmitVerification(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody ResubmitVerificationRequest request
    ) {
        UUID userId = OrgScope.requireUserId(jwt);
        OrgMembership membership = orgScope.requireOwner(userId);
        return verificationService.resubmitCase(membership.organizationId(), userId, request);
    }

    @GetMapping("/documents/{assetId}/signed-url")
    @RequiresPermission("verification.read")
    SignedDownloadResponse getDocumentSignedUrl(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID assetId
    ) {
        UUID userId = OrgScope.requireUserId(jwt);
        orgScope.requireOwner(userId);
        return verificationService.issueOwnerDocumentSignedUrl(userId, assetId);
    }
}
