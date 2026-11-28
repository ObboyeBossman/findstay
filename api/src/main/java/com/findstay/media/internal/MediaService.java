package com.findstay.media.internal;

import com.findstay.media.api.MediaAssetStatus;
import com.findstay.media.api.MediaAssetSummary;
import com.findstay.media.api.MediaBucket;
import com.findstay.media.api.MediaOwnerType;
import com.findstay.media.api.MediaServiceApi;
import com.findstay.media.api.PresignedUploadRequest;
import com.findstay.media.api.PresignedUploadResponse;
import com.findstay.media.api.SignedDownloadResponse;
import com.findstay.shared.error.ApiError;
import com.findstay.shared.error.AppException;
import com.findstay.shared.id.IdGenerator;
import com.findstay.shared.security.OrgScope;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
class MediaService implements MediaServiceApi {

    static final int MAX_PHOTOS_PER_PROPERTY = 10;

    private static final Set<String> ALLOWED_IMAGE_MIME_TYPES = Set.of(
            "image/webp",
            "image/jpeg",
            "image/png"
    );

    private static final Set<String> ALLOWED_DOCUMENT_MIME_TYPES = Set.of(
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/webp"
    );

    private static final Map<String, String> EXTENSION_BY_MIME = Map.of(
            "image/webp", "webp",
            "image/jpeg", "jpg",
            "image/png", "png",
            "application/pdf", "pdf"
    );

    private final MediaAssetRepository assetRepository;
    private final MediaDocumentRepository documentRepository;
    private final StorageUrlSigner urlSigner;
    private final R2Properties r2Properties;
    private final OrgScope orgScope;
    private final IdGenerator idGenerator;
    private final Clock clock;

    MediaService(
            MediaAssetRepository assetRepository,
            MediaDocumentRepository documentRepository,
            StorageUrlSigner urlSigner,
            R2Properties r2Properties,
            OrgScope orgScope,
            IdGenerator idGenerator,
            Clock clock
    ) {
        this.assetRepository = assetRepository;
        this.documentRepository = documentRepository;
        this.urlSigner = urlSigner;
        this.r2Properties = r2Properties;
        this.orgScope = orgScope;
        this.idGenerator = idGenerator;
        this.clock = clock;
    }

    @Override
    @Transactional
    public PresignedUploadResponse issuePresignedUpload(PresignedUploadRequest request) {
        validatePresignRequest(request);

        String normalizedMime = request.contentType().trim().toLowerCase(Locale.ROOT);
        if (request.ownerType() == MediaOwnerType.PROPERTY_PHOTO) {
            long activeCount = countActiveAssets(MediaOwnerType.PROPERTY_PHOTO, request.ownerId());
            if (activeCount >= MAX_PHOTOS_PER_PROPERTY) {
                throw AppException.businessRule(
                        "A property may have at most " + MAX_PHOTOS_PER_PROPERTY + " photos"
                );
            }
        }

        UUID assetId = idGenerator.newId();
        UUID documentId = idGenerator.newId();
        Instant now = clock.instant();

        MediaBucket bucket = bucketFor(request.ownerType());
        String extension = EXTENSION_BY_MIME.get(normalizedMime);
        String storageKey = buildStorageKey(
                request.organizationId(),
                request.ownerType(),
                request.ownerId(),
                assetId,
                extension
        );

        MediaAsset asset = new MediaAsset(
                assetId,
                request.organizationId(),
                bucket,
                storageKey,
                normalizedMime,
                request.sizeBytes(),
                MediaAssetStatus.PENDING_UPLOAD,
                now
        );
        assetRepository.save(asset);

        MediaDocument document = new MediaDocument(
                documentId,
                request.ownerType(),
                request.ownerId(),
                assetId,
                storageKey,
                now
        );
        documentRepository.save(document);

        Duration ttl = Duration.ofSeconds(Math.max(60, r2Properties.getPresignUploadTtlSeconds()));
        StorageUrlSigner.SignedPut signed = urlSigner.presignPut(
                bucket,
                storageKey,
                normalizedMime,
                request.sizeBytes(),
                now,
                ttl
        );

        String publicUrl = bucket == MediaBucket.PUBLIC_IMAGES
                ? urlSigner.resolvePublicUrl(storageKey)
                : null;

        return new PresignedUploadResponse(
                assetId,
                documentId,
                bucket,
                storageKey,
                signed.url(),
                signed.requiredHeaders(),
                signed.expiresAt(),
                publicUrl
        );
    }

    @Override
    @Transactional
    public MediaAssetSummary confirmUpload(UUID organizationId, UUID assetId) {
        MediaAsset asset = requireOwnedAsset(organizationId, assetId);
        if (asset.getStatus() == MediaAssetStatus.DELETED) {
            throw AppException.notFound("MediaAsset", assetId);
        }
        asset.markReady(clock.instant());
        assetRepository.save(asset);

        MediaDocument document = documentRepository.findFirstByMediaAssetId(assetId).orElse(null);
        return toSummary(asset, document);
    }

    @Override
    @Transactional
    public MediaAssetSummary promoteToPublicWebp(UUID organizationId, UUID assetId) {
        MediaAsset asset = requireOwnedAsset(organizationId, assetId);
        if (asset.getStatus() == MediaAssetStatus.DELETED) {
            throw AppException.notFound("MediaAsset", assetId);
        }
        if (asset.getBucket() != MediaBucket.PUBLIC_IMAGES) {
            throw AppException.businessRule("Private documents cannot be promoted to the public image bucket");
        }
        if (!"image/webp".equalsIgnoreCase(asset.getContentType())) {
            throw AppException.validation(
                    "Only optimised WebP images (image/webp) may be promoted to public property storage",
                    List.of(new ApiError.Detail("contentType", "Expected image/webp"))
            );
        }

        MediaDocument document = documentRepository.findFirstByMediaAssetId(assetId)
                .orElseThrow(() -> AppException.notFound("MediaDocument", assetId));

        String publicKey = String.format(
                "orgs/%s/public/properties/%s/%s.webp",
                asset.getOrganizationId(),
                document.getOwnerId(),
                asset.getId()
        );

        urlSigner.promoteObjectToPublic(asset.getStorageKey(), publicKey, asset.getContentType());
        asset.promoteKey(publicKey, clock.instant());
        document.updateStorageKey(publicKey);

        assetRepository.save(asset);
        documentRepository.save(document);
        return toSummary(asset, document);
    }

    @Override
    @Transactional(readOnly = true)
    public SignedDownloadResponse issuePrivateDownloadUrl(
            UUID assetId,
            UUID callerUserId,
            boolean hasPrivateReadPermission
    ) {
        MediaAsset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> AppException.notFound("MediaAsset", assetId));

        if (!hasPrivateReadPermission) {
            // Throws 403 if caller has no org membership, or 404 if caller belongs to a different org
            orgScope.requireOrganization(callerUserId, asset.getOrganizationId());
        }

        if (asset.getStatus() == MediaAssetStatus.DELETED) {
            throw AppException.notFound("MediaAsset", assetId);
        }
        if (asset.getStatus() != MediaAssetStatus.READY) {
            throw AppException.businessRule("File upload has not been confirmed yet");
        }
        if (asset.getBucket() != MediaBucket.PRIVATE_DOCS) {
            throw AppException.businessRule("Signed private download URLs are only issued for private documents");
        }

        Instant now = clock.instant();
        Duration ttl = Duration.ofSeconds(Math.max(30, r2Properties.getPresignDownloadTtlSeconds()));
        StorageUrlSigner.SignedGet signed = urlSigner.presignGet(
                asset.getBucket(),
                asset.getStorageKey(),
                now,
                ttl
        );

        return new SignedDownloadResponse(
                asset.getId(),
                asset.getStorageKey(),
                signed.url(),
                signed.expiresAt(),
                asset.getContentType(),
                asset.getSizeBytes()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<MediaAssetSummary> listDocumentsForOrganization(
            UUID organizationId,
            MediaOwnerType ownerType,
            UUID ownerId
    ) {
        return listDocuments(ownerType, ownerId).stream()
                .filter(item -> organizationId.equals(item.organizationId()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MediaAssetSummary> listDocuments(MediaOwnerType ownerType, UUID ownerId) {
        List<MediaDocument> docs = documentRepository.findByOwnerTypeAndOwnerIdOrderByCreatedAtAsc(ownerType, ownerId);
        List<MediaAssetSummary> result = new ArrayList<>();
        for (MediaDocument doc : docs) {
            assetRepository.findById(doc.getMediaAssetId())
                    .filter(asset -> asset.getStatus() != MediaAssetStatus.DELETED)
                    .map(asset -> toSummary(asset, doc))
                    .ifPresent(result::add);
        }
        return result;
    }

    @Override
    @Transactional
    public void softDeleteAsset(UUID organizationId, UUID assetId) {
        MediaAsset asset = requireOwnedAsset(organizationId, assetId);
        if (asset.getStatus() == MediaAssetStatus.DELETED) {
            return;
        }
        asset.markDeleted();
        assetRepository.saveAndFlush(asset);
    }

    boolean isSignedUrlValidAt(Instant expiresAt, Instant at) {
        return urlSigner.verifyUrlNotExpired(expiresAt, at);
    }

    private MediaAsset requireOwnedAsset(UUID organizationId, UUID assetId) {
        MediaAsset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> AppException.notFound("MediaAsset", assetId));
        if (!organizationId.equals(asset.getOrganizationId())) {
            throw AppException.notFound("MediaAsset", assetId);
        }
        return asset;
    }

    private long countActiveAssets(MediaOwnerType ownerType, UUID ownerId) {
        return documentRepository.findByOwnerTypeAndOwnerIdOrderByCreatedAtAsc(ownerType, ownerId).stream()
                .map(doc -> assetRepository.findById(doc.getMediaAssetId()).orElse(null))
                .filter(asset -> asset != null && asset.getStatus() != MediaAssetStatus.DELETED)
                .count();
    }

    private void validatePresignRequest(PresignedUploadRequest request) {
        List<ApiError.Detail> errors = new ArrayList<>();
        if (request == null) {
            throw AppException.validation("Upload request is required", List.of());
        }
        if (request.organizationId() == null) {
            errors.add(new ApiError.Detail("organizationId", "Organization is required"));
        }
        if (request.ownerType() == null) {
            errors.add(new ApiError.Detail("ownerType", "Owner type is required"));
        }
        if (request.ownerId() == null) {
            errors.add(new ApiError.Detail("ownerId", "Owner id is required"));
        }
        if (request.sizeBytes() < 1 || request.sizeBytes() > MAX_FILE_SIZE_BYTES) {
            errors.add(new ApiError.Detail(
                    "sizeBytes",
                    "File size must be between 1 byte and 5 MB (" + MAX_FILE_SIZE_BYTES + " bytes)"
            ));
        }

        String mime = request.contentType() == null ? "" : request.contentType().trim().toLowerCase(Locale.ROOT);
        if (request.ownerType() != null) {
            Set<String> allowed = request.ownerType() == MediaOwnerType.VERIFICATION_DOCUMENT
                    ? ALLOWED_DOCUMENT_MIME_TYPES
                    : ALLOWED_IMAGE_MIME_TYPES;
            if (!allowed.contains(mime)) {
                errors.add(new ApiError.Detail(
                        "contentType",
                        "Unsupported file type '" + mime + "'. Allowed: " + String.join(", ", allowed)
                ));
            }
        }

        if (request.filename() != null && (request.filename().contains("..") || request.filename().contains("/") || request.filename().contains("\\"))) {
            errors.add(new ApiError.Detail("filename", "Filename must not contain path separators or traversal segments"));
        }

        if (!errors.isEmpty()) {
            throw AppException.validation("Upload metadata validation failed", errors);
        }
    }

    private static MediaBucket bucketFor(MediaOwnerType ownerType) {
        return ownerType == MediaOwnerType.VERIFICATION_DOCUMENT
                ? MediaBucket.PRIVATE_DOCS
                : MediaBucket.PUBLIC_IMAGES;
    }

    private static String buildStorageKey(
            UUID organizationId,
            MediaOwnerType ownerType,
            UUID ownerId,
            UUID assetId,
            String extension
    ) {
        String prefix = switch (ownerType) {
            case PROPERTY_PHOTO -> "photos";
            case VERIFICATION_DOCUMENT -> "verification";
            case AVATAR -> "avatars";
        };
        return String.format("orgs/%s/%s/%s/%s.%s", organizationId, prefix, ownerId, assetId, extension);
    }

    private MediaAssetSummary toSummary(MediaAsset asset, MediaDocument document) {
        String publicUrl = asset.getBucket() == MediaBucket.PUBLIC_IMAGES
                && asset.getStatus() == MediaAssetStatus.READY
                ? urlSigner.resolvePublicUrl(asset.getStorageKey())
                : null;
        return new MediaAssetSummary(
                asset.getId(),
                document != null ? document.getId() : null,
                asset.getOrganizationId(),
                document != null ? document.getOwnerType() : null,
                document != null ? document.getOwnerId() : null,
                asset.getBucket(),
                asset.getStorageKey(),
                asset.getContentType(),
                asset.getSizeBytes(),
                asset.getStatus(),
                publicUrl,
                asset.getCreatedAt(),
                asset.getUploadedAt()
        );
    }
}
