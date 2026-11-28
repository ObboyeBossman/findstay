package com.findstay.media.api;

import java.util.List;
import java.util.UUID;

/**
 * Public entry point for the {@code media} module ({@code S1-09}).
 *
 * <p>Consumed by {@code verification} ({@code S1-12}) and {@code listing} ({@code S1-13}) so
 * cross-module code never accesses {@code media.internal} repositories or entities.
 */
public interface MediaServiceApi {

    long MAX_FILE_SIZE_BYTES = 5L * 1024L * 1024L;

    /**
     * Validates metadata, records a {@code PENDING_UPLOAD} asset + ownership link, and returns a
     * short-lived pre-signed PUT URL scoped to the caller's organisation path.
     */
    PresignedUploadResponse issuePresignedUpload(PresignedUploadRequest request);

    /**
     * Marks a {@code PENDING_UPLOAD} asset as {@code READY} once the browser finishes uploading
     * directly to Cloudflare R2. Enforces organisation ownership.
     */
    MediaAssetSummary confirmUpload(UUID organizationId, UUID assetId);

    /**
     * Promotes an approved WebP property photo into the public CDN namespace and returns its
     * immutable public URL. Enforces organisation ownership and {@code image/webp} MIME type.
     */
    MediaAssetSummary promoteToPublicWebp(UUID organizationId, UUID assetId);

    /**
     * Issues a short-lived signed GET URL for a {@code PRIVATE_DOCS} asset.
     *
     * <p>Allowed only for members of the owning organisation or platform administrators holding
     * {@code media.private.read}.
     */
    SignedDownloadResponse issuePrivateDownloadUrl(UUID assetId, UUID callerUserId, boolean hasPrivateReadPermission);

    /** Lists non-deleted assets linked to a given owner record within the caller's organisation. */
    List<MediaAssetSummary> listDocumentsForOrganization(UUID organizationId, MediaOwnerType ownerType, UUID ownerId);

    /** Lists non-deleted assets linked to a given owner record (for admin review or public listing reads). */
    List<MediaAssetSummary> listDocuments(MediaOwnerType ownerType, UUID ownerId);

    /**
     * Soft-deletes an asset ({@code status = DELETED}) so audit records retain referential history.
     */
    void softDeleteAsset(UUID organizationId, UUID assetId);
}
