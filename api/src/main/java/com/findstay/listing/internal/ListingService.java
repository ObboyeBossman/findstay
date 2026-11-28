package com.findstay.listing.internal;

import com.findstay.listing.api.CatalogQuery;
import com.findstay.listing.api.ListingModerationApi;
import com.findstay.listing.api.ListingReviewItemView;
import com.findstay.listing.api.PropertyStatus;
import com.findstay.listing.api.PublicListingProjection;
import com.findstay.listing.api.UnitSummaryView;
import com.findstay.listing.internal.ListingDtos.AmenityOption;
import com.findstay.listing.internal.ListingDtos.AreaOption;
import com.findstay.listing.internal.ListingDtos.CatalogReferenceResponse;
import com.findstay.listing.internal.ListingDtos.CreatePropertyRequest;
import com.findstay.listing.internal.ListingDtos.CreateUnitRequest;
import com.findstay.listing.internal.ListingDtos.PhotoOrderItem;
import com.findstay.listing.internal.ListingDtos.PropertyDetailResponse;
import com.findstay.listing.internal.ListingDtos.PropertyListItemResponse;
import com.findstay.listing.internal.ListingDtos.PropertyPhotoResponse;
import com.findstay.listing.internal.ListingDtos.PublicPropertyDetailResponse;
import com.findstay.listing.internal.ListingDtos.ReferenceOption;
import com.findstay.listing.internal.ListingDtos.StatusHistoryItem;
import com.findstay.listing.internal.ListingDtos.SyncPhotosRequest;
import com.findstay.listing.internal.ListingDtos.UnitResponse;
import com.findstay.listing.internal.ListingDtos.UpdatePropertyRequest;
import com.findstay.listing.internal.ListingDtos.UpdateUnitRequest;
import com.findstay.media.api.MediaAssetSummary;
import com.findstay.media.api.MediaOwnerType;
import com.findstay.media.api.MediaServiceApi;
import com.findstay.notification.api.NotificationRequest;
import com.findstay.notification.api.NotificationSender;
import com.findstay.organization.api.OrganizationAccessApi;
import com.findstay.organization.api.OrganizationSummary;
import com.findstay.shared.error.ApiError;
import com.findstay.shared.error.AppException;
import com.findstay.shared.error.ErrorCode;
import com.findstay.shared.id.IdGenerator;
import com.findstay.shared.money.Money;
import com.findstay.shared.security.OrgMembership;
import com.findstay.shared.security.OrgRole;
import com.findstay.shared.security.OrgScope;
import com.findstay.verification.api.VerificationReviewApi;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
class ListingService implements CatalogQuery, ListingModerationApi {

    private static final int MAX_PROPERTY_PHOTOS = 10;
    private static final String NIGHTLY_CODE = "NIGHTLY";

    private final AccommodationTypeRepository accommodationTypeRepository;
    private final BillingPeriodRepository billingPeriodRepository;
    private final AreaRepository areaRepository;
    private final AmenityRepository amenityRepository;
    private final PropertyRepository propertyRepository;
    private final PropertyAmenityRepository propertyAmenityRepository;
    private final PropertyPhotoRepository propertyPhotoRepository;
    private final UnitRepository unitRepository;
    private final RatePlanRepository ratePlanRepository;
    private final PublicListingRepository publicListingRepository;
    private final ListingStatusHistoryRepository statusHistoryRepository;
    private final VerificationReviewApi verificationReviewApi;
    private final MediaServiceApi mediaServiceApi;
    private final OrganizationAccessApi organizationAccessApi;
    private final NotificationSender notificationSender;
    private final OrgScope orgScope;
    private final IdGenerator idGenerator;
    private final Clock clock;

    ListingService(
            AccommodationTypeRepository accommodationTypeRepository,
            BillingPeriodRepository billingPeriodRepository,
            AreaRepository areaRepository,
            AmenityRepository amenityRepository,
            PropertyRepository propertyRepository,
            PropertyAmenityRepository propertyAmenityRepository,
            PropertyPhotoRepository propertyPhotoRepository,
            UnitRepository unitRepository,
            RatePlanRepository ratePlanRepository,
            PublicListingRepository publicListingRepository,
            ListingStatusHistoryRepository statusHistoryRepository,
            VerificationReviewApi verificationReviewApi,
            MediaServiceApi mediaServiceApi,
            OrganizationAccessApi organizationAccessApi,
            NotificationSender notificationSender,
            OrgScope orgScope,
            IdGenerator idGenerator,
            Clock clock
    ) {
        this.accommodationTypeRepository = accommodationTypeRepository;
        this.billingPeriodRepository = billingPeriodRepository;
        this.areaRepository = areaRepository;
        this.amenityRepository = amenityRepository;
        this.propertyRepository = propertyRepository;
        this.propertyAmenityRepository = propertyAmenityRepository;
        this.propertyPhotoRepository = propertyPhotoRepository;
        this.unitRepository = unitRepository;
        this.ratePlanRepository = ratePlanRepository;
        this.publicListingRepository = publicListingRepository;
        this.statusHistoryRepository = statusHistoryRepository;
        this.verificationReviewApi = verificationReviewApi;
        this.mediaServiceApi = mediaServiceApi;
        this.organizationAccessApi = organizationAccessApi;
        this.notificationSender = notificationSender;
        this.orgScope = orgScope;
        this.idGenerator = idGenerator;
        this.clock = clock;
    }

    // -------------------------------------------------------------------------
    // Reference data
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    CatalogReferenceResponse getReferenceData() {
        List<ReferenceOption> types = accommodationTypeRepository.findByActiveTrueOrderByNameAsc().stream()
                .map(t -> new ReferenceOption(t.getId(), t.getCode(), t.getName()))
                .toList();
        List<AreaOption> areas = areaRepository.findByActiveTrueOrderByNameAsc().stream()
                .map(a -> new AreaOption(a.getId(), a.getName()))
                .toList();
        List<AmenityOption> amenities = amenityRepository.findByActiveTrueOrderByDisplayOrderAsc().stream()
                .map(a -> new AmenityOption(a.getId(), a.getCode(), a.getName(), a.getDisplayOrder()))
                .toList();
        List<ReferenceOption> periods = billingPeriodRepository.findByActiveTrueOrderByCodeAsc().stream()
                .map(p -> new ReferenceOption(p.getId(), p.getCode(), p.getName()))
                .toList();
        return new CatalogReferenceResponse(types, areas, amenities, periods);
    }

    // -------------------------------------------------------------------------
    // Owner Property CRUD, Units, Photos, Preview, Submit, Pause/Resume
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    List<PropertyListItemResponse> listOwnerProperties(UUID userId) {
        OrgMembership membership = orgScope.requireActive(userId);
        List<Property> properties = propertyRepository.findByOrganizationIdOrderByUpdatedAtDesc(membership.organizationId());
        if (membership.role() == OrgRole.STAFF) {
            properties = properties.stream()
                    .filter(p -> membership.canAccessProperty(p.getId()))
                    .toList();
        }
        return properties.stream().map(this::toListItem).toList();
    }

    @Transactional
    PropertyDetailResponse createProperty(UUID userId, CreatePropertyRequest request) {
        OrgMembership membership = orgScope.requireActive(userId);
        requireVerifiedOrganization(membership.organizationId());

        AccommodationType type = requireActiveAccommodationType(request.accommodationTypeCode());
        UUID areaId = request.areaId() != null ? requireActiveArea(request.areaId()).getId() : null;

        Instant now = clock.instant();
        Property property = new Property(
                idGenerator.newId(),
                membership.organizationId(),
                request.name().trim(),
                type.getId(),
                request.town().trim(),
                now
        );
        property.setAreaId(areaId);
        property.setAddress(trimToNull(request.address()));
        property.setDescription(trimToNull(request.description()));
        property.setHouseRules(trimToNull(request.houseRules()));
        propertyRepository.saveAndFlush(property);

        if (request.amenityCodes() != null) {
            syncAmenities(property.getId(), request.amenityCodes());
        }

        recordHistory(property.getId(), null, PropertyStatus.DRAFT, userId, "Property draft created", now);
        return toDetailResponse(property);
    }

    @Transactional(readOnly = true)
    PropertyDetailResponse getOwnerProperty(UUID userId, UUID propertyId) {
        Property property = requireAccessibleProperty(userId, propertyId);
        return toDetailResponse(property);
    }

    @Transactional(readOnly = true)
    PublicPropertyDetailResponse getOwnerPropertyPreview(UUID userId, UUID propertyId) {
        Property property = requireAccessibleProperty(userId, propertyId);
        AccommodationType type = accommodationTypeRepository.findById(property.getAccommodationTypeId()).orElse(null);
        Area area = property.getAreaId() != null ? areaRepository.findById(property.getAreaId()).orElse(null) : null;
        List<String> amenities = loadAmenityCodes(property.getId());
        List<UnitResponse> units = loadUnits(property.getId());
        List<PropertyPhotoResponse> photos = loadPropertyPhotos(property.getId());
        Long fromPrice = units.stream()
                .map(UnitResponse::nightlyRatePesewas)
                .filter(p -> p > 0)
                .min(Long::compareTo)
                .orElse(null);
        boolean ownerVerified = verificationReviewApi.isOrganizationApproved(property.getOrganizationId());
        Instant publishedAt = publicListingRepository.findByPropertyId(property.getId())
                .map(PublicListing::getPublishedAt)
                .orElse(null);

        return new PublicPropertyDetailResponse(
                property.getId(),
                property.getName(),
                property.getDescription(),
                type != null ? type.getCode() : null,
                type != null ? type.getName() : null,
                property.getTown(),
                area != null ? area.getName() : null,
                property.getAddress(),
                property.getLatitude(),
                property.getLongitude(),
                amenities,
                property.getHouseRules(),
                resolveCoverPhotoUrl(photos),
                fromPrice,
                "GHS",
                ownerVerified,
                property.getStatus().name(),
                units,
                photos,
                publishedAt
        );
    }

    @Transactional(readOnly = true)
    PublicPropertyDetailResponse getPublicPropertyDetail(UUID propertyId) {
        PublicListing listing = publicListingRepository.findByPropertyId(propertyId)
                .filter(l -> "ACTIVE".equals(l.getStatus()))
                .orElseThrow(() -> AppException.notFound("Property", propertyId));
        AccommodationType type = accommodationTypeRepository.findByCodeAndActiveTrue(listing.getAccommodationTypeCode())
                .orElse(null);
        List<UnitResponse> units = loadUnits(propertyId);
        List<PropertyPhotoResponse> photos = loadPropertyPhotos(propertyId);
        return new PublicPropertyDetailResponse(
                listing.getPropertyId(),
                listing.getName(),
                listing.getDescription(),
                listing.getAccommodationTypeCode(),
                type != null ? type.getName() : listing.getAccommodationTypeCode(),
                listing.getTown(),
                listing.getAreaName(),
                listing.getAddress(),
                listing.getLatitude(),
                listing.getLongitude(),
                listing.getAmenities() == null ? List.of() : List.copyOf(listing.getAmenities()),
                listing.getHouseRules(),
                listing.getCoverPhotoUrl(),
                listing.getFromPricePesewas(),
                listing.getCurrency(),
                listing.isOwnerVerified(),
                listing.getStatus(),
                units,
                photos,
                listing.getPublishedAt()
        );
    }

    @Transactional
    PropertyDetailResponse updateProperty(UUID userId, UUID propertyId, UpdatePropertyRequest request) {
        Property property = requireAccessibleProperty(userId, propertyId);
        requireVerifiedOrganization(property.getOrganizationId());
        requireEditable(property);

        if (request.name() != null && !request.name().isBlank()) {
            property.setName(request.name().trim());
        }
        if (request.accommodationTypeCode() != null && !request.accommodationTypeCode().isBlank()) {
            AccommodationType type = requireActiveAccommodationType(request.accommodationTypeCode());
            property.setAccommodationTypeId(type.getId());
        }
        if (request.town() != null && !request.town().isBlank()) {
            property.setTown(request.town().trim());
        }
        if (request.areaId() != null) {
            Area area = requireActiveArea(request.areaId());
            property.setAreaId(area.getId());
        }
        if (request.address() != null) {
            property.setAddress(trimToNull(request.address()));
        }
        if (request.latitude() != null) {
            property.setLatitude(request.latitude());
        }
        if (request.longitude() != null) {
            property.setLongitude(request.longitude());
        }
        if (request.description() != null) {
            property.setDescription(trimToNull(request.description()));
        }
        if (request.houseRules() != null) {
            property.setHouseRules(trimToNull(request.houseRules()));
        }

        Instant now = clock.instant();
        property.setUpdatedAt(now);
        propertyRepository.saveAndFlush(property);

        if (request.amenityCodes() != null) {
            syncAmenities(property.getId(), request.amenityCodes());
        }

        refreshPublicProjectionIfPresent(property, now);
        return toDetailResponse(property);
    }

    @Transactional
    UnitResponse addUnit(UUID userId, UUID propertyId, CreateUnitRequest request) {
        Property property = requireAccessibleProperty(userId, propertyId);
        requireVerifiedOrganization(property.getOrganizationId());
        requireEditable(property);

        Money nightlyMoney = Money.ofPesewas(request.nightlyRatePesewas());
        if (!nightlyMoney.isPositive()) {
            throw AppException.validation(
                    "Nightly rate must be greater than zero pesewas",
                    List.of(new ApiError.Detail("nightlyRatePesewas", "Must be positive"))
            );
        }

        BillingPeriod nightlyPeriod = requireActiveNightlyPeriod();
        Instant now = clock.instant();

        Unit unit = new Unit(
                idGenerator.newId(),
                property.getId(),
                request.name().trim(),
                trimToNull(request.category()),
                request.maxGuests(),
                request.quantity(),
                now
        );
        unitRepository.saveAndFlush(unit);

        RatePlan ratePlan = new RatePlan(
                idGenerator.newId(),
                unit.getId(),
                nightlyPeriod.getId(),
                nightlyMoney.pesewas(),
                now
        );
        ratePlanRepository.saveAndFlush(ratePlan);

        property.setUpdatedAt(now);
        propertyRepository.save(property);
        refreshPublicProjectionIfPresent(property, now);

        return new UnitResponse(
                unit.getId(),
                unit.getPropertyId(),
                unit.getName(),
                unit.getCategory(),
                unit.getMaxGuests(),
                unit.getQuantity(),
                ratePlan.getRatePesewas(),
                ratePlan.getCurrency()
        );
    }

    @Transactional
    UnitResponse updateUnit(UUID userId, UUID propertyId, UUID unitId, UpdateUnitRequest request) {
        Property property = requireAccessibleProperty(userId, propertyId);
        requireVerifiedOrganization(property.getOrganizationId());
        requireEditable(property);

        Unit unit = unitRepository.findById(unitId)
                .filter(u -> property.getId().equals(u.getPropertyId()))
                .orElseThrow(() -> AppException.notFound("Unit", unitId));

        Instant now = clock.instant();
        if (request.name() != null && !request.name().isBlank()) {
            unit.setName(request.name().trim());
        }
        if (request.category() != null) {
            unit.setCategory(trimToNull(request.category()));
        }
        if (request.maxGuests() != null) {
            unit.setMaxGuests(request.maxGuests());
        }
        if (request.quantity() != null) {
            unit.setQuantity(request.quantity());
        }
        unit.setUpdatedAt(now);
        unitRepository.saveAndFlush(unit);

        BillingPeriod nightlyPeriod = requireActiveNightlyPeriod();
        RatePlan ratePlan = ratePlanRepository.findByUnitIdAndBillingPeriodId(unit.getId(), nightlyPeriod.getId())
                .orElseGet(() -> new RatePlan(idGenerator.newId(), unit.getId(), nightlyPeriod.getId(), 0L, now));
        if (request.nightlyRatePesewas() != null) {
            Money nightlyMoney = Money.ofPesewas(request.nightlyRatePesewas());
            if (!nightlyMoney.isPositive()) {
                throw AppException.validation(
                        "Nightly rate must be greater than zero pesewas",
                        List.of(new ApiError.Detail("nightlyRatePesewas", "Must be positive"))
                );
            }
            ratePlan.updateRatePesewas(nightlyMoney.pesewas(), now);
            ratePlanRepository.saveAndFlush(ratePlan);
        }

        property.setUpdatedAt(now);
        propertyRepository.save(property);
        refreshPublicProjectionIfPresent(property, now);

        return new UnitResponse(
                unit.getId(),
                unit.getPropertyId(),
                unit.getName(),
                unit.getCategory(),
                unit.getMaxGuests(),
                unit.getQuantity(),
                ratePlan.getRatePesewas(),
                ratePlan.getCurrency()
        );
    }

    @Transactional
    void deleteUnit(UUID userId, UUID propertyId, UUID unitId) {
        Property property = requireAccessibleProperty(userId, propertyId);
        requireVerifiedOrganization(property.getOrganizationId());
        requireEditable(property);

        Unit unit = unitRepository.findById(unitId)
                .filter(u -> property.getId().equals(u.getPropertyId()))
                .orElseThrow(() -> AppException.notFound("Unit", unitId));

        ratePlanRepository.deleteByUnitId(unit.getId());
        unitRepository.delete(unit);
        unitRepository.flush();

        Instant now = clock.instant();
        property.setUpdatedAt(now);
        propertyRepository.save(property);
        refreshPublicProjectionIfPresent(property, now);
    }

    @Transactional
    List<PropertyPhotoResponse> syncPhotos(UUID userId, UUID propertyId, SyncPhotosRequest request) {
        Property property = requireAccessibleProperty(userId, propertyId);
        requireVerifiedOrganization(property.getOrganizationId());
        requireEditable(property);

        List<PhotoOrderItem> items = request.photos();
        if (items.size() > MAX_PROPERTY_PHOTOS) {
            throw AppException.businessRule("A property may have at most " + MAX_PROPERTY_PHOTOS + " photos");
        }

        Map<UUID, MediaAssetSummary> mediaByDocId = new HashMap<>();
        for (MediaAssetSummary asset : mediaServiceApi.listDocumentsForOrganization(
                property.getOrganizationId(),
                MediaOwnerType.PROPERTY_PHOTO,
                property.getId()
        )) {
            if (asset.documentId() != null) {
                mediaByDocId.put(asset.documentId(), asset);
            }
        }

        Set<UUID> seenDocs = new HashSet<>();
        for (PhotoOrderItem item : items) {
            if (!seenDocs.add(item.documentId())) {
                throw AppException.validation(
                        "Duplicate photo documentId in photo list",
                        List.of(new ApiError.Detail("photos", "Duplicate documentId " + item.documentId()))
                );
            }
            if (!mediaByDocId.containsKey(item.documentId())) {
                throw AppException.validation(
                        "Photo does not belong to this property or organisation",
                        List.of(new ApiError.Detail("documentId", "Unknown property photo " + item.documentId()))
                );
            }
        }

        propertyPhotoRepository.deleteByIdPropertyId(property.getId());
        propertyPhotoRepository.flush();

        Instant now = clock.instant();
        List<PhotoOrderItem> sorted = items.stream()
                .sorted(Comparator.comparingInt(PhotoOrderItem::position))
                .toList();

        int coverIndex = -1;
        for (int i = 0; i < sorted.size(); i++) {
            if (sorted.get(i).isCover()) {
                coverIndex = i;
                break;
            }
        }
        if (coverIndex < 0 && !sorted.isEmpty()) {
            coverIndex = 0;
        }
        for (int i = 0; i < sorted.size(); i++) {
            PhotoOrderItem item = sorted.get(i);
            boolean isCover = (i == coverIndex);
            propertyPhotoRepository.save(new PropertyPhoto(property.getId(), item.documentId(), i, isCover, now));
        }
        propertyPhotoRepository.flush();

        property.setUpdatedAt(now);
        propertyRepository.save(property);
        refreshPublicProjectionIfPresent(property, now);

        return loadPropertyPhotos(property.getId());
    }

    @Transactional
    void removePhoto(UUID userId, UUID propertyId, UUID documentId) {
        Property property = requireAccessibleProperty(userId, propertyId);
        requireVerifiedOrganization(property.getOrganizationId());
        requireEditable(property);

        List<PropertyPhoto> existing = propertyPhotoRepository.findByIdPropertyIdOrderByPositionAsc(property.getId());
        boolean found = existing.stream().anyMatch(p -> documentId.equals(p.getDocumentId()));
        if (!found) {
            throw AppException.notFound("PropertyPhoto", documentId);
        }

        List<PropertyPhoto> remaining = existing.stream()
                .filter(p -> !documentId.equals(p.getDocumentId()))
                .toList();

        propertyPhotoRepository.deleteByIdPropertyId(property.getId());
        propertyPhotoRepository.flush();

        Instant now = clock.instant();
        boolean anyCover = remaining.stream().anyMatch(PropertyPhoto::isCover);
        for (int i = 0; i < remaining.size(); i++) {
            PropertyPhoto p = remaining.get(i);
            boolean isCover = anyCover ? p.isCover() : (i == 0);
            propertyPhotoRepository.save(new PropertyPhoto(property.getId(), p.getDocumentId(), i, isCover, p.getCreatedAt()));
        }
        propertyPhotoRepository.flush();

        property.setUpdatedAt(now);
        propertyRepository.save(property);
        refreshPublicProjectionIfPresent(property, now);
    }

    @Transactional
    PropertyDetailResponse submitProperty(UUID userId, UUID propertyId) {
        Property property = requireAccessibleProperty(userId, propertyId);
        requireVerifiedOrganization(property.getOrganizationId());

        if (property.getStatus() != PropertyStatus.DRAFT
                && property.getStatus() != PropertyStatus.CORRECTIONS_REQUESTED) {
            throw AppException.conflict(
                    "Only DRAFT or CORRECTIONS_REQUESTED listings can be submitted for review"
            );
        }

        List<String> blockers = computeSubmissionBlockers(property);
        if (!blockers.isEmpty()) {
            List<ApiError.Detail> details = blockers.stream()
                    .map(reason -> new ApiError.Detail("property", reason))
                    .toList();
            throw new AppException(
                    ErrorCode.BUSINESS_RULE_VIOLATION,
                    "Listing is incomplete and cannot be submitted yet",
                    details
            );
        }

        Instant now = clock.instant();
        PropertyStatus previous = property.getStatus();
        property.setStatus(PropertyStatus.PENDING_REVIEW);
        property.setUpdatedAt(now);
        propertyRepository.saveAndFlush(property);

        recordHistory(property.getId(), previous, PropertyStatus.PENDING_REVIEW, userId, "Submitted for admin review", now);
        notifyOwner(property, "LISTING_SUBMITTED", Map.of("propertyName", property.getName()));

        return toDetailResponse(property);
    }

    @Transactional
    PropertyDetailResponse pauseProperty(UUID userId, UUID propertyId) {
        Property property = requireAccessibleProperty(userId, propertyId);
        requireVerifiedOrganization(property.getOrganizationId());

        if (property.getStatus() != PropertyStatus.ACTIVE) {
            throw AppException.conflict("Only ACTIVE listings can be paused");
        }

        Instant now = clock.instant();
        property.setStatus(PropertyStatus.PAUSED);
        property.setUpdatedAt(now);
        propertyRepository.saveAndFlush(property);

        publicListingRepository.findByPropertyId(property.getId()).ifPresent(pub -> {
            pub.updateStatus("PAUSED", now);
            publicListingRepository.saveAndFlush(pub);
        });

        recordHistory(property.getId(), PropertyStatus.ACTIVE, PropertyStatus.PAUSED, userId, "Paused by owner", now);
        return toDetailResponse(property);
    }

    @Transactional
    PropertyDetailResponse resumeProperty(UUID userId, UUID propertyId) {
        Property property = requireAccessibleProperty(userId, propertyId);
        requireVerifiedOrganization(property.getOrganizationId());

        if (property.getStatus() != PropertyStatus.PAUSED) {
            throw AppException.conflict("Only PAUSED listings can be resumed");
        }

        Instant now = clock.instant();
        property.setStatus(PropertyStatus.ACTIVE);
        property.setUpdatedAt(now);
        propertyRepository.saveAndFlush(property);

        publicListingRepository.findByPropertyId(property.getId()).ifPresent(pub -> {
            pub.updateStatus("ACTIVE", now);
            publicListingRepository.saveAndFlush(pub);
        });

        recordHistory(property.getId(), PropertyStatus.PAUSED, PropertyStatus.ACTIVE, userId, "Resumed by owner", now);
        return toDetailResponse(property);
    }

    // -------------------------------------------------------------------------
    // Extension Seam 2 — CatalogQuery implementation
    // -------------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public List<PublicListingProjection> listActiveListings(
            String town,
            String areaName,
            Long minPesewas,
            Long maxPesewas
    ) {
        return publicListingRepository.findByStatusOrderByPublishedAtDesc("ACTIVE").stream()
                .filter(l -> town == null || town.isBlank() || l.getTown().equalsIgnoreCase(town.trim()))
                .filter(l -> areaName == null || areaName.isBlank()
                        || (l.getAreaName() != null && l.getAreaName().equalsIgnoreCase(areaName.trim())))
                .filter(l -> minPesewas == null || l.getFromPricePesewas() >= minPesewas)
                .filter(l -> maxPesewas == null || l.getFromPricePesewas() <= maxPesewas)
                .map(ListingService::toPublicProjection)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<PublicListingProjection> findActiveListingByPropertyId(UUID propertyId) {
        return publicListingRepository.findByPropertyId(propertyId)
                .filter(l -> "ACTIVE".equals(l.getStatus()))
                .map(ListingService::toPublicProjection);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UnitSummaryView> findUnitById(UUID unitId) {
        return unitRepository.findById(unitId).flatMap(unit ->
                propertyRepository.findById(unit.getPropertyId()).map(property -> {
                    long nightly = resolveNightlyRate(unit.getId());
                    return new UnitSummaryView(
                            unit.getId(),
                            unit.getPropertyId(),
                            property.getOrganizationId(),
                            unit.getName(),
                            unit.getCategory(),
                            unit.getMaxGuests(),
                            unit.getQuantity(),
                            nightly,
                            "GHS"
                    );
                })
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<UnitSummaryView> listUnitsForProperty(UUID propertyId) {
        Optional<Property> propertyOpt = propertyRepository.findById(propertyId);
        if (propertyOpt.isEmpty()) {
            return List.of();
        }
        UUID orgId = propertyOpt.get().getOrganizationId();
        return loadUnits(propertyId).stream()
                .map(u -> new UnitSummaryView(
                        u.id(),
                        u.propertyId(),
                        orgId,
                        u.name(),
                        u.category(),
                        u.maxGuests(),
                        u.quantity(),
                        u.nightlyRatePesewas(),
                        u.currency()
                ))
                .toList();
    }

    // -------------------------------------------------------------------------
    // ListingModerationApi implementation (for S1-15 Admin Review Queue)
    // -------------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public List<ListingReviewItemView> listPropertiesForReview(PropertyStatus status) {
        List<Property> props = status != null
                ? propertyRepository.findByStatusOrderByUpdatedAtAsc(status)
                : propertyRepository.findAllByOrderByUpdatedAtDesc();
        return props.stream().map(this::toReviewItem).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ListingReviewItemView getPropertyForReview(UUID propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> AppException.notFound("Property", propertyId));
        return toReviewItem(property);
    }

    @Override
    @Transactional
    public ListingReviewItemView approveAndPublish(UUID propertyId, UUID adminUserId, String note) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> AppException.notFound("Property", propertyId));

        if (property.getStatus() != PropertyStatus.PENDING_REVIEW) {
            throw AppException.conflict("Only PENDING_REVIEW properties can be approved");
        }
        List<String> blockers = computeSubmissionBlockers(property);
        if (!blockers.isEmpty()) {
            throw AppException.businessRule("Cannot publish incomplete property: " + String.join("; ", blockers));
        }

        Instant now = clock.instant();
        property.setStatus(PropertyStatus.ACTIVE);
        property.setUpdatedAt(now);
        propertyRepository.saveAndFlush(property);

        upsertPublicProjection(property, "ACTIVE", now);
        recordHistory(property.getId(), PropertyStatus.PENDING_REVIEW, PropertyStatus.ACTIVE, adminUserId,
                note != null && !note.isBlank() ? note.trim() : "Approved and published", now);
        notifyOwner(property, "LISTING_APPROVED", Map.of("propertyName", property.getName()));

        return toReviewItem(property);
    }

    @Override
    @Transactional
    public ListingReviewItemView requestCorrections(UUID propertyId, UUID adminUserId, String reason) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> AppException.notFound("Property", propertyId));
        if (property.getStatus() != PropertyStatus.PENDING_REVIEW) {
            throw AppException.conflict("Only PENDING_REVIEW properties can have corrections requested");
        }
        Instant now = clock.instant();
        property.setStatus(PropertyStatus.CORRECTIONS_REQUESTED);
        property.setUpdatedAt(now);
        propertyRepository.saveAndFlush(property);

        String cleanReason = reason != null && !reason.isBlank() ? reason.trim() : "Corrections requested";
        recordHistory(property.getId(), PropertyStatus.PENDING_REVIEW, PropertyStatus.CORRECTIONS_REQUESTED,
                adminUserId, cleanReason, now);
        notifyOwner(property, "LISTING_CORRECTIONS_REQUESTED", Map.of(
                "propertyName", property.getName(),
                "notes", cleanReason
        ));
        return toReviewItem(property);
    }

    @Override
    @Transactional
    public ListingReviewItemView rejectListing(UUID propertyId, UUID adminUserId, String reason) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> AppException.notFound("Property", propertyId));
        if (property.getStatus() != PropertyStatus.PENDING_REVIEW) {
            throw AppException.conflict("Only PENDING_REVIEW properties can be rejected");
        }
        Instant now = clock.instant();
        property.setStatus(PropertyStatus.REJECTED);
        property.setUpdatedAt(now);
        propertyRepository.saveAndFlush(property);

        String cleanReason = reason != null && !reason.isBlank() ? reason.trim() : "Rejected during review";
        recordHistory(property.getId(), PropertyStatus.PENDING_REVIEW, PropertyStatus.REJECTED,
                adminUserId, cleanReason, now);
        notifyOwner(property, "LISTING_REJECTED", Map.of(
                "propertyName", property.getName(),
                "reason", cleanReason
        ));
        return toReviewItem(property);
    }

    @Override
    @Transactional
    public ListingReviewItemView suspendListing(UUID propertyId, UUID adminUserId, String reason) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> AppException.notFound("Property", propertyId));
        PropertyStatus previous = property.getStatus();
        if (previous != PropertyStatus.ACTIVE && previous != PropertyStatus.PAUSED) {
            throw AppException.conflict("Only ACTIVE or PAUSED listings can be suspended");
        }
        Instant now = clock.instant();
        property.setStatus(PropertyStatus.SUSPENDED);
        property.setUpdatedAt(now);
        propertyRepository.saveAndFlush(property);

        publicListingRepository.findByPropertyId(property.getId()).ifPresent(pub -> {
            pub.updateStatus("SUSPENDED", now);
            publicListingRepository.saveAndFlush(pub);
        });
        String cleanReason = reason != null && !reason.isBlank() ? reason.trim() : "Suspended by administrator";
        recordHistory(property.getId(), previous, PropertyStatus.SUSPENDED, adminUserId, cleanReason, now);
        notifyOwner(property, "LISTING_SUSPENDED", Map.of(
                "propertyName", property.getName(),
                "reason", cleanReason
        ));
        return toReviewItem(property);
    }

    @Override
    @Transactional
    public ListingReviewItemView restoreListing(UUID propertyId, UUID adminUserId, String reason) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> AppException.notFound("Property", propertyId));
        if (property.getStatus() != PropertyStatus.SUSPENDED) {
            throw AppException.conflict("Only SUSPENDED listings can be restored");
        }
        Instant now = clock.instant();
        property.setStatus(PropertyStatus.ACTIVE);
        property.setUpdatedAt(now);
        propertyRepository.saveAndFlush(property);

        upsertPublicProjection(property, "ACTIVE", now);
        String cleanReason = reason != null && !reason.isBlank() ? reason.trim() : "Restored by administrator";
        recordHistory(property.getId(), PropertyStatus.SUSPENDED, PropertyStatus.ACTIVE, adminUserId, cleanReason, now);
        notifyOwner(property, "LISTING_RESTORED", Map.of(
                "propertyName", property.getName(),
                "reason", cleanReason
        ));
        return toReviewItem(property);
    }

    // -------------------------------------------------------------------------
    // Internal helpers
    // -------------------------------------------------------------------------

    private Property requireAccessibleProperty(UUID userId, UUID propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> AppException.notFound("Property", propertyId));
        orgScope.requirePropertyAccess(userId, property.getOrganizationId(), property.getId(), "Property");
        return property;
    }

    private void requireVerifiedOrganization(UUID organizationId) {
        if (!verificationReviewApi.isOrganizationApproved(organizationId)) {
            throw AppException.forbidden(
                    "Only verified property owners can create or manage listings. Complete owner verification first."
            );
        }
    }

    private void requireEditable(Property property) {
        if (property.getStatus() == PropertyStatus.PENDING_REVIEW) {
            throw AppException.conflict("Property is locked while under admin review");
        }
    }

    private AccommodationType requireActiveAccommodationType(String code) {
        String normalized = code.trim().toUpperCase(Locale.ROOT);
        return accommodationTypeRepository.findByCodeAndActiveTrue(normalized)
                .orElseThrow(() -> AppException.validation(
                        "Invalid or inactive accommodation type",
                        List.of(new ApiError.Detail("accommodationTypeCode", "Unsupported accommodation type: " + normalized))
                ));
    }

    private Area requireActiveArea(UUID areaId) {
        return areaRepository.findByIdAndActiveTrue(areaId)
                .orElseThrow(() -> AppException.validation(
                        "Selected area is invalid or inactive",
                        List.of(new ApiError.Detail("areaId", "Unknown Takoradi area: " + areaId))
                ));
    }

    private BillingPeriod requireActiveNightlyPeriod() {
        return billingPeriodRepository.findByCodeAndActiveTrue(NIGHTLY_CODE)
                .orElseThrow(() -> new IllegalStateException("Active NIGHTLY billing period seed is missing"));
    }

    private void syncAmenities(UUID propertyId, List<String> amenityCodes) {
        propertyAmenityRepository.deleteByIdPropertyId(propertyId);
        propertyAmenityRepository.flush();
        if (amenityCodes == null || amenityCodes.isEmpty()) {
            return;
        }
        List<String> normalized = amenityCodes.stream()
                .filter(c -> c != null && !c.isBlank())
                .map(c -> c.trim().toUpperCase(Locale.ROOT))
                .distinct()
                .toList();
        List<Amenity> matched = amenityRepository.findByCodeInAndActiveTrue(normalized);
        if (matched.size() != normalized.size()) {
            throw AppException.validation(
                    "One or more amenity codes are invalid",
                    List.of(new ApiError.Detail("amenityCodes", "Select amenities from /api/v1/catalog/reference"))
            );
        }
        for (Amenity amenity : matched) {
            propertyAmenityRepository.save(new PropertyAmenity(propertyId, amenity.getId()));
        }
        propertyAmenityRepository.flush();
    }

    private List<String> computeSubmissionBlockers(Property property) {
        List<String> blockers = new ArrayList<>();
        if (property.getDescription() == null || property.getDescription().isBlank()) {
            blockers.add("Add a property description");
        }
        if (property.getAreaId() == null) {
            blockers.add("Select a Takoradi area");
        }
        if (property.getAddress() == null || property.getAddress().isBlank()) {
            blockers.add("Provide the street address or landmark");
        }
        if (property.getHouseRules() == null || property.getHouseRules().isBlank()) {
            blockers.add("Add house rules (check-in/out, cancellation, guest rules)");
        }

        List<UnitResponse> units = loadUnits(property.getId());
        if (units.isEmpty()) {
            blockers.add("Add at least one room or unit with capacity and nightly GHS price");
        } else {
            boolean anyInvalidRate = units.stream().anyMatch(u -> u.nightlyRatePesewas() <= 0 || u.maxGuests() <= 0);
            if (anyInvalidRate) {
                blockers.add("Every unit must have a positive nightly GHS price and guest capacity");
            }
        }

        List<PropertyPhotoResponse> photos = loadPropertyPhotos(property.getId());
        if (photos.isEmpty()) {
            blockers.add("Upload at least one property photo");
        }
        return blockers;
    }

    private void refreshPublicProjectionIfPresent(Property property, Instant now) {
        publicListingRepository.findByPropertyId(property.getId()).ifPresent(existing -> {
            if (computeSubmissionBlockers(property).isEmpty()) {
                upsertPublicProjection(property, existing.getStatus(), now);
            }
        });
    }

    private void upsertPublicProjection(Property property, String publicStatus, Instant now) {
        AccommodationType type = accommodationTypeRepository.findById(property.getAccommodationTypeId()).orElse(null);
        Area area = property.getAreaId() != null ? areaRepository.findById(property.getAreaId()).orElse(null) : null;
        List<String> amenityCodes = loadAmenityCodes(property.getId());
        List<UnitResponse> units = loadUnits(property.getId());
        long fromPrice = units.stream()
                .mapToLong(UnitResponse::nightlyRatePesewas)
                .filter(p -> p > 0)
                .min()
                .orElse(0L);
        String coverUrl = resolveCoverPhotoUrl(loadPropertyPhotos(property.getId()));
        boolean ownerVerified = verificationReviewApi.isOrganizationApproved(property.getOrganizationId());

        Optional<PublicListing> existingOpt = publicListingRepository.findByPropertyId(property.getId());
        if (existingOpt.isPresent()) {
            PublicListing existing = existingOpt.get();
            existing.refresh(
                    property.getName(),
                    property.getDescription(),
                    property.getTown(),
                    area != null ? area.getName() : null,
                    property.getAddress(),
                    property.getLatitude(),
                    property.getLongitude(),
                    type != null ? type.getCode() : "UNKNOWN",
                    amenityCodes,
                    property.getHouseRules(),
                    coverUrl,
                    fromPrice,
                    ownerVerified,
                    publicStatus,
                    now
            );
            publicListingRepository.saveAndFlush(existing);
        } else {
            PublicListing created = new PublicListing(
                    idGenerator.newId(),
                    property.getId(),
                    property.getName(),
                    property.getDescription(),
                    property.getTown(),
                    area != null ? area.getName() : null,
                    property.getAddress(),
                    property.getLatitude(),
                    property.getLongitude(),
                    type != null ? type.getCode() : "UNKNOWN",
                    amenityCodes,
                    property.getHouseRules(),
                    coverUrl,
                    fromPrice,
                    ownerVerified,
                    publicStatus,
                    now
            );
            publicListingRepository.saveAndFlush(created);
        }
    }

    private void recordHistory(
            UUID propertyId,
            PropertyStatus from,
            PropertyStatus to,
            UUID actorUserId,
            String reason,
            Instant now
    ) {
        statusHistoryRepository.save(new ListingStatusHistory(
                idGenerator.newId(),
                propertyId,
                from != null ? from.name() : null,
                to.name(),
                actorUserId,
                reason,
                now
        ));
    }

    private void notifyOwner(Property property, String eventType, Map<String, Object> extraVars) {
        OrganizationSummary org = organizationAccessApi.findOrganizationById(property.getOrganizationId()).orElse(null);
        organizationAccessApi.findPrimaryOwnerUserId(property.getOrganizationId()).ifPresent(ownerUserId -> {
            Map<String, Object> vars = new HashMap<>(extraVars);
            vars.put("propertyName", property.getName());
            notificationSender.send(new NotificationRequest(
                    ownerUserId,
                    eventType,
                    "Listing update — " + property.getName(),
                    "Status for " + property.getName() + " changed to " + property.getStatus(),
                    vars,
                    org != null ? org.contactEmail() : null,
                    org != null ? org.contactPhone() : null
            ));
        });
    }

    private List<String> loadAmenityCodes(UUID propertyId) {
        List<UUID> amenityIds = propertyAmenityRepository.findByIdPropertyId(propertyId).stream()
                .map(PropertyAmenity::getAmenityId)
                .toList();
        if (amenityIds.isEmpty()) return List.of();
        return amenityRepository.findAllById(amenityIds).stream()
                .sorted(Comparator.comparingInt(Amenity::getDisplayOrder))
                .map(Amenity::getCode)
                .toList();
    }

    private List<UnitResponse> loadUnits(UUID propertyId) {
        List<Unit> units = unitRepository.findByPropertyIdOrderByCreatedAtAsc(propertyId);
        if (units.isEmpty()) return List.of();

        List<UUID> unitIds = units.stream().map(Unit::getId).toList();
        Map<UUID, RatePlan> planByUnit = new HashMap<>();
        for (RatePlan plan : ratePlanRepository.findByUnitIdIn(unitIds)) {
            planByUnit.putIfAbsent(plan.getUnitId(), plan);
        }

        return units.stream().map(u -> {
            RatePlan plan = planByUnit.get(u.getId());
            return new UnitResponse(
                    u.getId(),
                    u.getPropertyId(),
                    u.getName(),
                    u.getCategory(),
                    u.getMaxGuests(),
                    u.getQuantity(),
                    plan != null ? plan.getRatePesewas() : 0L,
                    plan != null ? plan.getCurrency() : "GHS"
            );
        }).toList();
    }

    private long resolveNightlyRate(UUID unitId) {
        return ratePlanRepository.findByUnitIdIn(List.of(unitId)).stream()
                .mapToLong(RatePlan::getRatePesewas)
                .findFirst()
                .orElse(0L);
    }

    private List<PropertyPhotoResponse> loadPropertyPhotos(UUID propertyId) {
        List<PropertyPhoto> ordered = propertyPhotoRepository.findByIdPropertyIdOrderByPositionAsc(propertyId);
        if (ordered.isEmpty()) return List.of();

        Map<UUID, MediaAssetSummary> mediaByDocId = new HashMap<>();
        for (MediaAssetSummary asset : mediaServiceApi.listDocuments(MediaOwnerType.PROPERTY_PHOTO, propertyId)) {
            if (asset.documentId() != null) {
                mediaByDocId.put(asset.documentId(), asset);
            }
        }

        List<PropertyPhotoResponse> result = new ArrayList<>();
        for (PropertyPhoto photo : ordered) {
            MediaAssetSummary asset = mediaByDocId.get(photo.getDocumentId());
            if (asset != null) {
                result.add(new PropertyPhotoResponse(
                        photo.getDocumentId(),
                        asset.assetId(),
                        asset.publicUrl(),
                        photo.getPosition(),
                        photo.isCover()
                ));
            }
        }
        return result;
    }

    private static String resolveCoverPhotoUrl(List<PropertyPhotoResponse> photos) {
        return photos.stream()
                .filter(PropertyPhotoResponse::isCover)
                .map(PropertyPhotoResponse::publicUrl)
                .filter(url -> url != null && !url.isBlank())
                .findFirst()
                .orElseGet(() -> photos.stream()
                        .map(PropertyPhotoResponse::publicUrl)
                        .filter(url -> url != null && !url.isBlank())
                        .findFirst()
                        .orElse(null));
    }

    private PropertyDetailResponse toDetailResponse(Property property) {
        AccommodationType type = accommodationTypeRepository.findById(property.getAccommodationTypeId()).orElse(null);
        Area area = property.getAreaId() != null ? areaRepository.findById(property.getAreaId()).orElse(null) : null;
        List<String> amenities = loadAmenityCodes(property.getId());
        List<UnitResponse> units = loadUnits(property.getId());
        List<PropertyPhotoResponse> photos = loadPropertyPhotos(property.getId());
        Long fromPrice = units.stream()
                .map(UnitResponse::nightlyRatePesewas)
                .filter(p -> p > 0)
                .min(Long::compareTo)
                .orElse(null);
        List<String> blockers = computeSubmissionBlockers(property);
        List<StatusHistoryItem> history = statusHistoryRepository
                .findByPropertyIdOrderByCreatedAtDesc(property.getId()).stream()
                .map(h -> new StatusHistoryItem(h.getFromStatus(), h.getToStatus(), h.getReason(), h.getCreatedAt()))
                .toList();

        return new PropertyDetailResponse(
                property.getId(),
                property.getOrganizationId(),
                property.getName(),
                property.getDescription(),
                type != null ? type.getCode() : null,
                type != null ? type.getName() : null,
                property.getTown(),
                property.getAreaId(),
                area != null ? area.getName() : null,
                property.getAddress(),
                property.getLatitude(),
                property.getLongitude(),
                property.getHouseRules(),
                property.getStatus(),
                amenities,
                units,
                photos,
                fromPrice,
                "GHS",
                blockers,
                history,
                property.getCreatedAt(),
                property.getUpdatedAt()
        );
    }

    private PropertyListItemResponse toListItem(Property property) {
        AccommodationType type = accommodationTypeRepository.findById(property.getAccommodationTypeId()).orElse(null);
        Area area = property.getAreaId() != null ? areaRepository.findById(property.getAreaId()).orElse(null) : null;
        List<UnitResponse> units = loadUnits(property.getId());
        List<PropertyPhotoResponse> photos = loadPropertyPhotos(property.getId());
        Long fromPrice = units.stream()
                .map(UnitResponse::nightlyRatePesewas)
                .filter(p -> p > 0)
                .min(Long::compareTo)
                .orElse(null);

        return new PropertyListItemResponse(
                property.getId(),
                property.getName(),
                type != null ? type.getCode() : null,
                type != null ? type.getName() : null,
                property.getTown(),
                area != null ? area.getName() : null,
                property.getStatus(),
                units.size(),
                fromPrice,
                "GHS",
                resolveCoverPhotoUrl(photos),
                computeSubmissionBlockers(property).isEmpty(),
                property.getUpdatedAt()
        );
    }

    private ListingReviewItemView toReviewItem(Property property) {
        AccommodationType type = accommodationTypeRepository.findById(property.getAccommodationTypeId()).orElse(null);
        Area area = property.getAreaId() != null ? areaRepository.findById(property.getAreaId()).orElse(null) : null;
        List<UnitResponse> units = loadUnits(property.getId());
        List<PropertyPhotoResponse> photos = loadPropertyPhotos(property.getId());
        Long fromPrice = units.stream()
                .map(UnitResponse::nightlyRatePesewas)
                .filter(p -> p > 0)
                .min(Long::compareTo)
                .orElse(null);

        return new ListingReviewItemView(
                property.getId(),
                property.getOrganizationId(),
                property.getName(),
                property.getDescription(),
                property.getTown(),
                area != null ? area.getName() : null,
                property.getAddress(),
                type != null ? type.getCode() : null,
                property.getHouseRules(),
                property.getStatus(),
                units.size(),
                fromPrice,
                photos.size(),
                resolveCoverPhotoUrl(photos),
                property.getUpdatedAt()
        );
    }

    private static PublicListingProjection toPublicProjection(PublicListing l) {
        return new PublicListingProjection(
                l.getId(),
                l.getPropertyId(),
                l.getName(),
                l.getDescription(),
                l.getTown(),
                l.getAreaName(),
                l.getAddress(),
                l.getLatitude(),
                l.getLongitude(),
                l.getAccommodationTypeCode(),
                l.getAmenities() == null ? List.of() : List.copyOf(l.getAmenities()),
                l.getHouseRules(),
                l.getCoverPhotoUrl(),
                l.getFromPricePesewas(),
                l.getCurrency(),
                l.isOwnerVerified(),
                l.getStatus(),
                l.getPublishedAt()
        );
    }

    private static String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
