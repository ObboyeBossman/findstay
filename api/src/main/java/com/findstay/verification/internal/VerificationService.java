package com.findstay.verification.internal;

import com.findstay.media.api.MediaAssetSummary;
import com.findstay.media.api.MediaOwnerType;
import com.findstay.media.api.MediaServiceApi;
import com.findstay.media.api.PresignedUploadRequest;
import com.findstay.media.api.PresignedUploadResponse;
import com.findstay.media.api.SignedDownloadResponse;
import com.findstay.notification.api.NotificationRequest;
import com.findstay.notification.api.NotificationSender;
import com.findstay.organization.api.OrganizationAccessApi;
import com.findstay.organization.api.OrganizationSummary;
import com.findstay.shared.error.ApiError;
import com.findstay.shared.error.AppException;
import com.findstay.shared.id.IdGenerator;
import com.findstay.verification.api.ReviewDecisionType;
import com.findstay.verification.api.ReviewDecisionView;
import com.findstay.verification.api.ReviewEntityKind;
import com.findstay.verification.api.VerificationCaseStatus;
import com.findstay.verification.api.VerificationCaseView;
import com.findstay.verification.api.VerificationDocumentStatus;
import com.findstay.verification.api.VerificationDocumentType;
import com.findstay.verification.api.VerificationDocumentView;
import com.findstay.verification.api.VerificationReviewApi;
import com.findstay.verification.internal.VerificationDtos.OwnerVerificationStatusResponse;
import com.findstay.verification.internal.VerificationDtos.PresignVerificationDocRequest;
import com.findstay.verification.internal.VerificationDtos.ResubmitVerificationRequest;
import com.findstay.verification.internal.VerificationDtos.SubmitVerificationRequest;
import com.findstay.verification.internal.VerificationDtos.SubmittedDocumentInput;
import com.findstay.verification.internal.VerificationDtos.VerificationPresignResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
class VerificationService implements VerificationReviewApi {

    private static final Set<VerificationDocumentType> REQUIRED_DOCUMENT_TYPES =
            EnumSet.of(
                    VerificationDocumentType.GHANA_CARD,
                    VerificationDocumentType.OWNERSHIP_PROOF,
                    VerificationDocumentType.GTA_LICENCE
            );

    private final VerificationCaseRepository caseRepository;
    private final VerificationDocumentRepository documentRepository;
    private final ReviewDecisionRepository decisionRepository;
    private final GhanaCardCryptoService cryptoService;
    private final MediaServiceApi mediaService;
    private final OrganizationAccessApi organizationAccess;
    private final NotificationSender notificationSender;
    private final IdGenerator idGenerator;
    private final Clock clock;

    VerificationService(
            VerificationCaseRepository caseRepository,
            VerificationDocumentRepository documentRepository,
            ReviewDecisionRepository decisionRepository,
            GhanaCardCryptoService cryptoService,
            MediaServiceApi mediaService,
            OrganizationAccessApi organizationAccess,
            NotificationSender notificationSender,
            IdGenerator idGenerator,
            Clock clock
    ) {
        this.caseRepository = caseRepository;
        this.documentRepository = documentRepository;
        this.decisionRepository = decisionRepository;
        this.cryptoService = cryptoService;
        this.mediaService = mediaService;
        this.organizationAccess = organizationAccess;
        this.notificationSender = notificationSender;
        this.idGenerator = idGenerator;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    OwnerVerificationStatusResponse getOwnerStatus(UUID organizationId) {
        String orgStatus = organizationAccess.findOrganizationById(organizationId)
                .map(OrganizationSummary::verificationStatus)
                .orElse("NOT_SUBMITTED");
        VerificationCaseView latestCase = caseRepository
                .findFirstByOrganizationIdOrderByCreatedAtDesc(organizationId)
                .map(this::toCaseView)
                .orElse(null);
        return new OwnerVerificationStatusResponse(organizationId, orgStatus, latestCase);
    }

    @Transactional
    VerificationPresignResponse presignDocument(UUID organizationId, PresignVerificationDocRequest request) {
        UUID documentSlotId = resolveDocumentSlotId(organizationId, request.documentType());
        PresignedUploadResponse upload = mediaService.issuePresignedUpload(new PresignedUploadRequest(
                organizationId,
                MediaOwnerType.VERIFICATION_DOCUMENT,
                documentSlotId,
                request.filename(),
                request.contentType(),
                request.sizeBytes()
        ));
        return new VerificationPresignResponse(request.documentType(), documentSlotId, upload);
    }

    @Transactional
    VerificationCaseView submitCase(UUID organizationId, UUID actorUserId, SubmitVerificationRequest request) {
        Optional<VerificationCase> existing = caseRepository.findFirstByOrganizationIdOrderByCreatedAtDesc(organizationId);
        if (existing.isPresent()) {
            VerificationCaseStatus existingStatus = existing.get().getStatus();
            if (existingStatus == VerificationCaseStatus.PENDING) {
                throw AppException.conflict("A verification submission is already pending review");
            }
            if (existingStatus == VerificationCaseStatus.APPROVED) {
                throw AppException.conflict("This organisation is already verified");
            }
            throw AppException.conflict(
                    "An existing verification case requires resubmission; please use the resubmit endpoint"
            );
        }

        byte[] encryptedCard = cryptoService.encrypt(request.ghanaCardNumber());
        Map<VerificationDocumentType, SubmittedDocumentInput> docsByType = validateAllRequiredDocuments(
                organizationId,
                request.documents()
        );

        Instant now = clock.instant();
        UUID caseId = idGenerator.newId();
        VerificationCase verificationCase = new VerificationCase(
                caseId,
                organizationId,
                VerificationCaseStatus.PENDING,
                encryptedCard,
                now
        );
        caseRepository.saveAndFlush(verificationCase);

        for (VerificationDocumentType type : REQUIRED_DOCUMENT_TYPES) {
            SubmittedDocumentInput input = docsByType.get(type);
            VerificationDocument doc = new VerificationDocument(
                    input.documentId(),
                    caseId,
                    type,
                    VerificationDocumentStatus.PENDING,
                    now
            );
            documentRepository.save(doc);
        }
        documentRepository.flush();

        organizationAccess.updateVerificationStatus(organizationId, VerificationCaseStatus.PENDING.name());
        sendVerificationNotification(actorUserId, "VERIFICATION_SUBMITTED", organizationId, Map.of());

        return toCaseView(verificationCase);
    }

    @Transactional
    VerificationCaseView resubmitCase(UUID organizationId, UUID actorUserId, ResubmitVerificationRequest request) {
        VerificationCase verificationCase = caseRepository
                .findFirstByOrganizationIdOrderByCreatedAtDesc(organizationId)
                .orElseThrow(() -> AppException.notFound("VerificationCase", organizationId));

        if (verificationCase.getStatus() != VerificationCaseStatus.PARTIALLY_REJECTED
                && verificationCase.getStatus() != VerificationCaseStatus.REJECTED) {
            throw AppException.conflict(
                    "Only verification cases with requested corrections or rejections can be resubmitted"
            );
        }

        byte[] updatedEncryptedCard = (request.ghanaCardNumber() != null && !request.ghanaCardNumber().isBlank())
                ? cryptoService.encrypt(request.ghanaCardNumber())
                : null;

        List<VerificationDocument> existingDocs = documentRepository
                .findByVerificationCaseIdOrderByDocumentTypeAsc(verificationCase.getId());
        Map<VerificationDocumentType, VerificationDocument> existingByType = new EnumMap<>(VerificationDocumentType.class);
        for (VerificationDocument doc : existingDocs) {
            existingByType.put(doc.getDocumentType(), doc);
        }

        Map<VerificationDocumentType, SubmittedDocumentInput> updatesByType = new EnumMap<>(VerificationDocumentType.class);
        for (SubmittedDocumentInput input : request.documents()) {
            if (updatesByType.put(input.documentType(), input) != null) {
                throw AppException.validation(
                        "Duplicate document type in resubmission",
                        List.of(new ApiError.Detail("documents", "Duplicate entry for " + input.documentType()))
                );
            }
            VerificationDocument targetDoc = existingByType.get(input.documentType());
            if (targetDoc == null) {
                throw AppException.notFound("VerificationDocument", input.documentType());
            }
            if (!targetDoc.getId().equals(input.documentId())) {
                throw AppException.validation(
                        "Resubmitted document must reference the existing verification document slot",
                        List.of(new ApiError.Detail("documentId", "Expected " + targetDoc.getId()))
                );
            }
            verifyAndConfirmAssetForDocument(organizationId, input);
        }

        // Ensure every REJECTED document type was replaced
        List<ApiError.Detail> missingRejected = new ArrayList<>();
        for (VerificationDocument doc : existingDocs) {
            if (doc.getStatus() == VerificationDocumentStatus.REJECTED
                    && !updatesByType.containsKey(doc.getDocumentType())) {
                missingRejected.add(new ApiError.Detail(
                        "documents",
                        "Please upload an updated " + doc.getDocumentType() + " document before resubmitting"
                ));
            }
        }
        if (!missingRejected.isEmpty()) {
            throw AppException.validation("Rejected documents must be replaced before resubmitting", missingRejected);
        }

        Instant now = clock.instant();
        for (VerificationDocumentType updatedType : updatesByType.keySet()) {
            VerificationDocument doc = existingByType.get(updatedType);
            doc.markResubmitted(now);
            documentRepository.save(doc);
        }
        verificationCase.resubmit(updatedEncryptedCard, now);
        caseRepository.saveAndFlush(verificationCase);

        organizationAccess.updateVerificationStatus(organizationId, VerificationCaseStatus.PENDING.name());
        sendVerificationNotification(actorUserId, "VERIFICATION_SUBMITTED", organizationId, Map.of());

        return toCaseView(verificationCase);
    }

    @Transactional(readOnly = true)
    SignedDownloadResponse issueOwnerDocumentSignedUrl(UUID callerUserId, UUID assetId) {
        return mediaService.issuePrivateDownloadUrl(assetId, callerUserId, false);
    }

    // -------------------------------------------------------------------------
    // VerificationReviewApi implementation (public seam for S1-15 & S1-13)
    // -------------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public boolean isOrganizationApproved(UUID organizationId) {
        return caseRepository.existsByOrganizationIdAndStatus(organizationId, VerificationCaseStatus.APPROVED);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VerificationCaseView> listCasesForReview(VerificationCaseStatus status) {
        List<VerificationCase> cases = status != null
                ? caseRepository.findByStatusOrderBySubmittedAtAsc(status)
                : caseRepository.findAllByOrderBySubmittedAtDesc();
        return cases.stream().map(this::toCaseView).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public VerificationCaseView getCaseForReview(UUID caseId) {
        VerificationCase verificationCase = caseRepository.findById(caseId)
                .orElseThrow(() -> AppException.notFound("VerificationCase", caseId));
        return toCaseView(verificationCase);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<VerificationCaseView> findLatestCaseForOrganization(UUID organizationId) {
        return caseRepository.findFirstByOrganizationIdOrderByCreatedAtDesc(organizationId)
                .map(this::toCaseView);
    }

    @Override
    @Transactional
    public VerificationCaseView decideVerificationCase(
            UUID caseId,
            UUID adminUserId,
            ReviewDecisionType decision,
            String reason,
            List<String> corrections,
            List<VerificationDocumentType> rejectedDocumentTypes
    ) {
        VerificationCase verificationCase = caseRepository.findById(caseId)
                .orElseThrow(() -> AppException.notFound("VerificationCase", caseId));

        if (verificationCase.getStatus() != VerificationCaseStatus.PENDING) {
            throw AppException.conflict("Only PENDING verification cases can be decided");
        }

        List<String> safeCorrections = corrections == null ? List.of() : List.copyOf(corrections);
        List<VerificationDocumentType> safeRejectedTypes = rejectedDocumentTypes == null
                ? List.of()
                : List.copyOf(rejectedDocumentTypes);

        validateDecisionPayload(decision, reason, safeCorrections, safeRejectedTypes);

        List<VerificationDocument> docs = documentRepository
                .findByVerificationCaseIdOrderByDocumentTypeAsc(caseId);
        Instant now = clock.instant();

        VerificationCaseStatus newStatus;
        String eventType;
        switch (decision) {
            case APPROVE -> {
                newStatus = VerificationCaseStatus.APPROVED;
                eventType = "VERIFICATION_APPROVED";
                for (VerificationDocument doc : docs) {
                    doc.markApproved();
                    documentRepository.save(doc);
                }
            }
            case REQUEST_CORRECTIONS -> {
                newStatus = VerificationCaseStatus.PARTIALLY_REJECTED;
                eventType = "VERIFICATION_CHANGES_REQUESTED";
                Set<VerificationDocumentType> rejectedSet = safeRejectedTypes.isEmpty()
                        ? EnumSet.allOf(VerificationDocumentType.class)
                        : EnumSet.copyOf(safeRejectedTypes);
                String note = !safeCorrections.isEmpty()
                        ? String.join("; ", safeCorrections)
                        : (reason != null ? reason.trim() : "Please re-upload a clearer document");
                for (VerificationDocument doc : docs) {
                    if (rejectedSet.contains(doc.getDocumentType())) {
                        doc.markRejected(note);
                    } else {
                        doc.markApproved();
                    }
                    documentRepository.save(doc);
                }
            }
            case REJECT -> {
                newStatus = VerificationCaseStatus.REJECTED;
                eventType = "VERIFICATION_REJECTED";
                String note = reason.trim();
                for (VerificationDocument doc : docs) {
                    doc.markRejected(note);
                    documentRepository.save(doc);
                }
            }
            default -> throw new IllegalStateException("Unsupported decision: " + decision);
        }

        verificationCase.markDecided(newStatus, now);
        caseRepository.saveAndFlush(verificationCase);

        ReviewDecision decisionRow = new ReviewDecision(
                idGenerator.newId(),
                ReviewEntityKind.VERIFICATION,
                caseId,
                decision,
                reason != null && !reason.isBlank() ? reason.trim() : null,
                safeCorrections.isEmpty() ? null : safeCorrections,
                safeRejectedTypes.isEmpty() ? null : safeRejectedTypes.stream().map(Enum::name).toList(),
                adminUserId,
                now
        );
        decisionRepository.saveAndFlush(decisionRow);

        organizationAccess.updateVerificationStatus(verificationCase.getOrganizationId(), newStatus.name());

        organizationAccess.findPrimaryOwnerUserId(verificationCase.getOrganizationId())
                .ifPresent(ownerUserId -> sendVerificationNotification(
                        ownerUserId,
                        eventType,
                        verificationCase.getOrganizationId(),
                        Map.of(
                                "reason", reason != null ? reason.trim() : "",
                                "notes", safeCorrections.isEmpty() ? (reason != null ? reason.trim() : "") : String.join("; ", safeCorrections)
                        )
                ));

        return toCaseView(verificationCase);
    }

    @Override
    @Transactional
    public ReviewDecisionView recordListingReviewDecision(
            UUID propertyId,
            UUID adminUserId,
            ReviewDecisionType decision,
            String reason,
            List<String> corrections
    ) {
        List<String> safeCorrections = corrections == null ? List.of() : List.copyOf(corrections);
        if (decision == ReviewDecisionType.REJECT && (reason == null || reason.isBlank())) {
            throw AppException.validation(
                    "Rejection reason is required",
                    List.of(new ApiError.Detail("reason", "A clear reason is required when rejecting a listing"))
            );
        }
        if (decision == ReviewDecisionType.REQUEST_CORRECTIONS
                && safeCorrections.isEmpty()
                && (reason == null || reason.isBlank())) {
            throw AppException.validation(
                    "Correction notes are required",
                    List.of(new ApiError.Detail("corrections", "Provide at least one correction item or reason"))
            );
        }

        Instant now = clock.instant();
        ReviewDecision row = new ReviewDecision(
                idGenerator.newId(),
                ReviewEntityKind.LISTING,
                propertyId,
                decision,
                reason != null && !reason.isBlank() ? reason.trim() : null,
                safeCorrections.isEmpty() ? null : safeCorrections,
                null,
                adminUserId,
                now
        );
        decisionRepository.saveAndFlush(row);
        return toDecisionView(row);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewDecisionView> listDecisions(ReviewEntityKind entityKind, UUID entityId) {
        return decisionRepository
                .findByEntityKindAndEntityIdOrderByDecidedAtDesc(entityKind, entityId)
                .stream()
                .map(this::toDecisionView)
                .toList();
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private UUID resolveDocumentSlotId(UUID organizationId, VerificationDocumentType documentType) {
        Optional<VerificationCase> latestCase = caseRepository.findFirstByOrganizationIdOrderByCreatedAtDesc(organizationId);
        if (latestCase.isPresent()
                && (latestCase.get().getStatus() == VerificationCaseStatus.PARTIALLY_REJECTED
                        || latestCase.get().getStatus() == VerificationCaseStatus.REJECTED)) {
            return documentRepository.findByVerificationCaseIdOrderByDocumentTypeAsc(latestCase.get().getId())
                    .stream()
                    .filter(doc -> doc.getDocumentType() == documentType)
                    .map(VerificationDocument::getId)
                    .findFirst()
                    .orElseGet(idGenerator::newId);
        }
        return idGenerator.newId();
    }

    private Map<VerificationDocumentType, SubmittedDocumentInput> validateAllRequiredDocuments(
            UUID organizationId,
            List<SubmittedDocumentInput> inputs
    ) {
        Map<VerificationDocumentType, SubmittedDocumentInput> byType = new EnumMap<>(VerificationDocumentType.class);
        for (SubmittedDocumentInput input : inputs) {
            if (byType.put(input.documentType(), input) != null) {
                throw AppException.validation(
                        "Duplicate document type in submission",
                        List.of(new ApiError.Detail("documents", "Duplicate entry for " + input.documentType()))
                );
            }
        }

        List<ApiError.Detail> missing = new ArrayList<>();
        for (VerificationDocumentType required : REQUIRED_DOCUMENT_TYPES) {
            if (!byType.containsKey(required)) {
                missing.add(new ApiError.Detail("documents", "Missing required document: " + required));
            }
        }
        if (!missing.isEmpty()) {
            throw AppException.validation(
                    "All three verification documents (Ghana Card, Ownership Proof, GTA Licence) are required",
                    missing
            );
        }

        for (SubmittedDocumentInput input : byType.values()) {
            verifyAndConfirmAssetForDocument(organizationId, input);
        }
        return byType;
    }

    private void verifyAndConfirmAssetForDocument(UUID organizationId, SubmittedDocumentInput input) {
        // Confirms ownership (404 if another org's asset) and ensures asset is READY
        mediaService.confirmUpload(organizationId, input.assetId());

        List<MediaAssetSummary> linked = mediaService.listDocumentsForOrganization(
                organizationId,
                MediaOwnerType.VERIFICATION_DOCUMENT,
                input.documentId()
        );
        boolean matchesSlot = linked.stream().anyMatch(asset -> asset.assetId().equals(input.assetId()));
        if (!matchesSlot) {
            throw AppException.validation(
                    "Uploaded media asset does not match the verification document slot",
                    List.of(new ApiError.Detail("assetId", "Asset " + input.assetId() + " is not linked to document " + input.documentId()))
            );
        }
    }

    private static void validateDecisionPayload(
            ReviewDecisionType decision,
            String reason,
            List<String> corrections,
            List<VerificationDocumentType> rejectedDocumentTypes
    ) {
        if (decision == ReviewDecisionType.REJECT && (reason == null || reason.isBlank())) {
            throw AppException.validation(
                    "Rejection reason is required",
                    List.of(new ApiError.Detail("reason", "Provide a clear reason when rejecting verification"))
            );
        }
        if (decision == ReviewDecisionType.REQUEST_CORRECTIONS
                && rejectedDocumentTypes.isEmpty()
                && corrections.isEmpty()
                && (reason == null || reason.isBlank())) {
            throw AppException.validation(
                    "Specify which document(s) need correction or provide reviewer notes",
                    List.of(new ApiError.Detail("rejectedDocumentTypes", "At least one rejected document type or correction note is required"))
            );
        }
    }

    private void sendVerificationNotification(
            UUID recipientUserId,
            String eventType,
            UUID organizationId,
            Map<String, Object> extraVars
    ) {
        if (recipientUserId == null) return;
        OrganizationSummary org = organizationAccess.findOrganizationById(organizationId).orElse(null);
        String orgName = org != null ? org.displayName() : "Your organisation";
        String contactEmail = org != null ? org.contactEmail() : null;
        String contactPhone = org != null ? org.contactPhone() : null;
        Map<String, Object> vars = new java.util.HashMap<>(extraVars);
        vars.put("organizationName", orgName);
        notificationSender.send(new NotificationRequest(
                recipientUserId,
                eventType,
                "Verification update — " + orgName,
                "Your verification status for " + orgName + " has been updated.",
                vars,
                contactEmail,
                contactPhone
        ));
    }

    private VerificationCaseView toCaseView(VerificationCase verificationCase) {
        String rawCard = cryptoService.decrypt(verificationCase.getGhanaCardNumberEncrypted());
        String maskedCard = cryptoService.mask(rawCard);

        List<VerificationDocumentView> docViews = documentRepository
                .findByVerificationCaseIdOrderByDocumentTypeAsc(verificationCase.getId())
                .stream()
                .map(this::toDocumentView)
                .toList();

        List<ReviewDecisionView> decisionViews = decisionRepository
                .findByEntityKindAndEntityIdOrderByDecidedAtDesc(ReviewEntityKind.VERIFICATION, verificationCase.getId())
                .stream()
                .map(this::toDecisionView)
                .toList();

        return new VerificationCaseView(
                verificationCase.getId(),
                verificationCase.getOrganizationId(),
                verificationCase.getStatus(),
                maskedCard,
                verificationCase.getSubmittedAt(),
                verificationCase.getDecidedAt(),
                docViews,
                decisionViews
        );
    }

    private VerificationDocumentView toDocumentView(VerificationDocument doc) {
        List<MediaAssetSummary> assets = mediaService.listDocuments(MediaOwnerType.VERIFICATION_DOCUMENT, doc.getId());
        UUID latestAssetId = assets.isEmpty() ? null : assets.getLast().assetId();
        return new VerificationDocumentView(
                doc.getId(),
                doc.getDocumentType(),
                doc.getStatus(),
                doc.getFixNote(),
                latestAssetId,
                doc.getSubmittedAt()
        );
    }

    private ReviewDecisionView toDecisionView(ReviewDecision row) {
        List<VerificationDocumentType> rejectedTypes = row.getRejectedDocumentTypes() == null
                ? List.of()
                : row.getRejectedDocumentTypes().stream().map(VerificationDocumentType::valueOf).toList();
        return new ReviewDecisionView(
                row.getId(),
                row.getEntityKind(),
                row.getEntityId(),
                row.getDecision(),
                row.getReason(),
                row.getCorrections() == null ? List.of() : List.copyOf(row.getCorrections()),
                rejectedTypes,
                row.getDecidedByUserId(),
                row.getDecidedAt()
        );
    }
}
