package com.findstay.listing.internal;

import com.findstay.listing.api.PropertyStatus;
import com.findstay.shared.validation.SafeText;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

final class ListingDtos {

    private ListingDtos() {
    }

    record ReferenceOption(UUID id, String code, String name) {
    }

    record AreaOption(UUID id, String name) {
    }

    record AmenityOption(UUID id, String code, String name, int displayOrder) {
    }

    record CatalogReferenceResponse(
            List<ReferenceOption> accommodationTypes,
            List<AreaOption> areas,
            List<AmenityOption> amenities,
            List<ReferenceOption> billingPeriods
    ) {
    }

    record CreatePropertyRequest(
            @NotBlank(message = "Property name is required")
            @Size(max = 150)
            @SafeText
            String name,

            @NotBlank(message = "Accommodation type code is required")
            @Size(max = 64)
            String accommodationTypeCode,

            @NotBlank(message = "Town is required")
            @Size(max = 100)
            @SafeText
            String town,

            UUID areaId,

            @Size(max = 300)
            @SafeText
            String address,

            @Size(max = 4000)
            @SafeText
            String description,

            @Size(max = 4000)
            @SafeText
            String houseRules,

            List<String> amenityCodes
    ) {
    }

    record UpdatePropertyRequest(
            @Size(max = 150)
            @SafeText
            String name,

            @Size(max = 64)
            String accommodationTypeCode,

            @Size(max = 100)
            @SafeText
            String town,

            UUID areaId,

            @Size(max = 300)
            @SafeText
            String address,

            @DecimalMin("-90.0") @DecimalMax("90.0")
            BigDecimal latitude,

            @DecimalMin("-180.0") @DecimalMax("180.0")
            BigDecimal longitude,

            @Size(max = 4000)
            @SafeText
            String description,

            @Size(max = 4000)
            @SafeText
            String houseRules,

            List<String> amenityCodes
    ) {
    }

    record CreateUnitRequest(
            @NotBlank(message = "Unit name is required")
            @Size(max = 120)
            @SafeText
            String name,

            @Size(max = 80)
            @SafeText
            String category,

            @Min(value = 1, message = "maxGuests must be at least 1")
            int maxGuests,

            @Min(value = 1, message = "quantity must be at least 1")
            int quantity,

            @Positive(message = "nightlyRatePesewas must be greater than zero")
            long nightlyRatePesewas
    ) {
    }

    record UpdateUnitRequest(
            @Size(max = 120)
            @SafeText
            String name,

            @Size(max = 80)
            @SafeText
            String category,

            @Min(value = 1, message = "maxGuests must be at least 1")
            Integer maxGuests,

            @Min(value = 1, message = "quantity must be at least 1")
            Integer quantity,

            @Positive(message = "nightlyRatePesewas must be greater than zero")
            Long nightlyRatePesewas
    ) {
    }

    record PhotoOrderItem(
            @NotNull(message = "documentId is required")
            UUID documentId,

            @Min(0)
            int position,

            boolean isCover
    ) {
    }

    record SyncPhotosRequest(
            @NotNull
            List<@Valid PhotoOrderItem> photos
    ) {
    }

    record UnitResponse(
            UUID id,
            UUID propertyId,
            String name,
            String category,
            int maxGuests,
            int quantity,
            long nightlyRatePesewas,
            String currency
    ) {
    }

    record PropertyPhotoResponse(
            UUID documentId,
            UUID assetId,
            String publicUrl,
            int position,
            boolean isCover
    ) {
    }

    record StatusHistoryItem(
            String fromStatus,
            String toStatus,
            String reason,
            Instant createdAt
    ) {
    }

    record PropertyDetailResponse(
            UUID id,
            UUID organizationId,
            String name,
            String description,
            String accommodationTypeCode,
            String accommodationTypeName,
            String town,
            UUID areaId,
            String areaName,
            String address,
            BigDecimal latitude,
            BigDecimal longitude,
            String houseRules,
            PropertyStatus status,
            List<String> amenityCodes,
            List<UnitResponse> units,
            List<PropertyPhotoResponse> photos,
            Long fromPricePesewas,
            String currency,
            List<String> missingForSubmission,
            List<StatusHistoryItem> statusHistory,
            Instant createdAt,
            Instant updatedAt
    ) {
    }

    record PropertyListItemResponse(
            UUID id,
            String name,
            String accommodationTypeCode,
            String accommodationTypeName,
            String town,
            String areaName,
            PropertyStatus status,
            int unitCount,
            Long fromPricePesewas,
            String currency,
            String coverPhotoUrl,
            boolean readyToSubmit,
            Instant updatedAt
    ) {
    }

    record PublicPropertyDetailResponse(
            UUID propertyId,
            String name,
            String description,
            String accommodationTypeCode,
            String accommodationTypeName,
            String town,
            String areaName,
            String address,
            BigDecimal latitude,
            BigDecimal longitude,
            List<String> amenityCodes,
            String houseRules,
            String coverPhotoUrl,
            Long fromPricePesewas,
            String currency,
            boolean ownerVerified,
            String status,
            List<UnitResponse> units,
            List<PropertyPhotoResponse> photos,
            Instant publishedAt
    ) {
    }
}
