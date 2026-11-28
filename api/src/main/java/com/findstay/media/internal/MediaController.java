package com.findstay.media.internal;

import com.findstay.media.api.MediaAssetSummary;
import com.findstay.media.api.MediaOwnerType;
import com.findstay.media.api.PresignedUploadRequest;
import com.findstay.media.api.PresignedUploadResponse;
import com.findstay.media.api.SignedDownloadResponse;
import com.findstay.shared.security.CurrentUser;
import com.findstay.shared.security.OrgMembership;
import com.findstay.shared.security.OrgScope;
import com.findstay.shared.security.RequiresPermission;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * REST endpoints for direct-to-R2 pre-signed uploads, public WebP promotion, and expiring signed
 * private document download URLs ({@code S1-09-T4}, {@code S1-09-T5}).
 */
@RestController
@RequestMapping("/api/v1")
class MediaController {

    private final MediaService mediaService;
    private final OrgScope orgScope;

    MediaController(MediaService mediaService, OrgScope orgScope) {
        this.mediaService = mediaService;
        this.orgScope = orgScope;
    }

    @PostMapping("/owner/media/presign")
    @ResponseStatus(HttpStatus.CREATED)
    @RequiresPermission("media.upload")
    PresignedUploadResponse presignUpload(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody MediaDtos.PresignUploadHttpRequest body
    ) {
        OrgMembership membership = orgScope.requireActive(jwt);
        return mediaService.issuePresignedUpload(new PresignedUploadRequest(
                membership.organizationId(),
                body.ownerType(),
                body.ownerId(),
                body.filename(),
                body.contentType(),
                body.sizeBytes()
        ));
    }

    @PostMapping("/owner/media/{assetId}/confirm")
    @RequiresPermission("media.upload")
    MediaAssetSummary confirmUpload(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID assetId
    ) {
        OrgMembership membership = orgScope.requireActive(jwt);
        return mediaService.confirmUpload(membership.organizationId(), assetId);
    }

    @PostMapping("/owner/media/{assetId}/promote-webp")
    @RequiresPermission("media.upload")
    MediaAssetSummary promoteWebp(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID assetId
    ) {
        OrgMembership membership = orgScope.requireActive(jwt);
        return mediaService.promoteToPublicWebp(membership.organizationId(), assetId);
    }

    @GetMapping("/owner/media")
    @RequiresPermission("media.upload")
    List<MediaAssetSummary> listOwnerMedia(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam MediaOwnerType ownerType,
            @RequestParam UUID ownerId
    ) {
        OrgMembership membership = orgScope.requireActive(jwt);
        return mediaService.listDocumentsForOrganization(membership.organizationId(), ownerType, ownerId);
    }

    @DeleteMapping("/owner/media/{assetId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @RequiresPermission("media.upload")
    void deleteMedia(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID assetId
    ) {
        OrgMembership membership = orgScope.requireActive(jwt);
        mediaService.softDeleteAsset(membership.organizationId(), assetId);
    }

    /**
     * Issues a temporary expiring signed download URL for a private document ({@code S1-09-T5}).
     * Access is restricted to the owning organisation or administrators with
     * {@code media.private.read}.
     */
    @GetMapping("/media/{assetId}/signed-url")
    SignedDownloadResponse getPrivateSignedUrl(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID assetId
    ) {
        UUID callerUserId = OrgScope.requireUserId(jwt);
        boolean hasPrivateRead = CurrentUser.access()
                .map(access -> access.has("media.private.read"))
                .orElse(false);
        return mediaService.issuePrivateDownloadUrl(assetId, callerUserId, hasPrivateRead);
    }
}
