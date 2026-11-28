package com.findstay.listing.internal;

import com.findstay.listing.api.PropertyStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

interface AccommodationTypeRepository extends JpaRepository<AccommodationType, UUID> {
    List<AccommodationType> findByActiveTrueOrderByNameAsc();
    Optional<AccommodationType> findByCodeAndActiveTrue(String code);
}

interface BillingPeriodRepository extends JpaRepository<BillingPeriod, UUID> {
    List<BillingPeriod> findByActiveTrueOrderByCodeAsc();
    Optional<BillingPeriod> findByCodeAndActiveTrue(String code);
}

interface AreaRepository extends JpaRepository<Area, UUID> {
    List<Area> findByActiveTrueOrderByNameAsc();
    Optional<Area> findByIdAndActiveTrue(UUID id);
}

interface AmenityRepository extends JpaRepository<Amenity, UUID> {
    List<Amenity> findByActiveTrueOrderByDisplayOrderAsc();
    List<Amenity> findByCodeInAndActiveTrue(List<String> codes);
}

interface PropertyRepository extends JpaRepository<Property, UUID> {
    List<Property> findByOrganizationIdOrderByUpdatedAtDesc(UUID organizationId);
    List<Property> findByStatusOrderByUpdatedAtAsc(PropertyStatus status);
    List<Property> findAllByOrderByUpdatedAtDesc();
}

interface PropertyAmenityRepository extends JpaRepository<PropertyAmenity, PropertyAmenity.PropertyAmenityId> {
    List<PropertyAmenity> findByIdPropertyId(UUID propertyId);
    void deleteByIdPropertyId(UUID propertyId);
}

interface PropertyPhotoRepository extends JpaRepository<PropertyPhoto, PropertyPhoto.PropertyPhotoId> {
    List<PropertyPhoto> findByIdPropertyIdOrderByPositionAsc(UUID propertyId);
    void deleteByIdPropertyId(UUID propertyId);
}

interface UnitRepository extends JpaRepository<Unit, UUID> {
    List<Unit> findByPropertyIdOrderByCreatedAtAsc(UUID propertyId);
}

interface RatePlanRepository extends JpaRepository<RatePlan, UUID> {
    List<RatePlan> findByUnitIdIn(List<UUID> unitIds);
    Optional<RatePlan> findByUnitIdAndBillingPeriodId(UUID unitId, UUID billingPeriodId);
    void deleteByUnitId(UUID unitId);
}

interface PublicListingRepository extends JpaRepository<PublicListing, UUID> {
    Optional<PublicListing> findByPropertyId(UUID propertyId);
    List<PublicListing> findByStatusOrderByPublishedAtDesc(String status);
}

interface ListingStatusHistoryRepository extends JpaRepository<ListingStatusHistory, UUID> {
    List<ListingStatusHistory> findByPropertyIdOrderByCreatedAtDesc(UUID propertyId);
}
