package com.findstay.listing.internal;

import com.findstay.listing.api.PublicListingProjection;
import com.findstay.listing.internal.ListingDtos.CatalogReferenceResponse;
import com.findstay.listing.internal.ListingDtos.CreatePropertyRequest;
import com.findstay.listing.internal.ListingDtos.CreateUnitRequest;
import com.findstay.listing.internal.ListingDtos.PropertyDetailResponse;
import com.findstay.listing.internal.ListingDtos.PropertyListItemResponse;
import com.findstay.listing.internal.ListingDtos.PropertyPhotoResponse;
import com.findstay.listing.internal.ListingDtos.PublicPropertyDetailResponse;
import com.findstay.listing.internal.ListingDtos.SyncPhotosRequest;
import com.findstay.listing.internal.ListingDtos.UnitResponse;
import com.findstay.listing.internal.ListingDtos.UpdatePropertyRequest;
import com.findstay.listing.internal.ListingDtos.UpdateUnitRequest;
import com.findstay.shared.security.OrgScope;
import com.findstay.shared.security.RequiresPermission;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * REST endpoints for Story {@code S1-13} (Create Properties, Rooms &amp; Prices):
 * reference lookup data, owner property/unit/photo CRUD, preview, submission, pause/resume,
 * and anonymous published listing reads via {@code CatalogQuery}.
 */
@RestController
@RequestMapping("/api/v1")
class ListingController {

    private final ListingService listingService;

    ListingController(ListingService listingService) {
        this.listingService = listingService;
    }

    // -------------------------------------------------------------------------
    // Public catalog reference & published listing reads
    // -------------------------------------------------------------------------

    @GetMapping("/catalog/reference")
    CatalogReferenceResponse getCatalogReference() {
        return listingService.getReferenceData();
    }

    @GetMapping("/properties")
    List<PublicListingProjection> listPublicProperties(
            @RequestParam(required = false) String town,
            @RequestParam(required = false) String area,
            @RequestParam(required = false) Long minPesewas,
            @RequestParam(required = false) Long maxPesewas
    ) {
        return listingService.listActiveListings(town, area, minPesewas, maxPesewas);
    }

    @GetMapping("/properties/featured")
    List<PublicListingProjection> listFeaturedProperties() {
        return listingService.listActiveListings(null, null, null, null);
    }

    @GetMapping("/properties/{propertyId}")
    PublicPropertyDetailResponse getPublicProperty(@PathVariable UUID propertyId) {
        return listingService.getPublicPropertyDetail(propertyId);
    }

    // -------------------------------------------------------------------------
    // Owner property CRUD, units, photos, preview, submit, pause/resume
    // -------------------------------------------------------------------------

    @GetMapping("/owner/properties")
    @RequiresPermission("listing.read")
    List<PropertyListItemResponse> listOwnerProperties(@AuthenticationPrincipal Jwt jwt) {
        return listingService.listOwnerProperties(OrgScope.requireUserId(jwt));
    }

    @PostMapping("/owner/properties")
    @ResponseStatus(HttpStatus.CREATED)
    @RequiresPermission("listing.write")
    PropertyDetailResponse createProperty(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CreatePropertyRequest request
    ) {
        return listingService.createProperty(OrgScope.requireUserId(jwt), request);
    }

    @GetMapping("/owner/properties/{propertyId}")
    @RequiresPermission("listing.read")
    PropertyDetailResponse getOwnerProperty(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID propertyId
    ) {
        return listingService.getOwnerProperty(OrgScope.requireUserId(jwt), propertyId);
    }

    @GetMapping("/owner/properties/{propertyId}/preview")
    @RequiresPermission("listing.read")
    PublicPropertyDetailResponse previewOwnerProperty(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID propertyId
    ) {
        return listingService.getOwnerPropertyPreview(OrgScope.requireUserId(jwt), propertyId);
    }

    @PatchMapping("/owner/properties/{propertyId}")
    @RequiresPermission("listing.write")
    PropertyDetailResponse updateProperty(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID propertyId,
            @Valid @RequestBody UpdatePropertyRequest request
    ) {
        return listingService.updateProperty(OrgScope.requireUserId(jwt), propertyId, request);
    }

    @PostMapping("/owner/properties/{propertyId}/units")
    @ResponseStatus(HttpStatus.CREATED)
    @RequiresPermission("listing.write")
    UnitResponse addUnit(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID propertyId,
            @Valid @RequestBody CreateUnitRequest request
    ) {
        return listingService.addUnit(OrgScope.requireUserId(jwt), propertyId, request);
    }

    @PatchMapping("/owner/properties/{propertyId}/units/{unitId}")
    @RequiresPermission("listing.write")
    UnitResponse updateUnit(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID propertyId,
            @PathVariable UUID unitId,
            @Valid @RequestBody UpdateUnitRequest request
    ) {
        return listingService.updateUnit(OrgScope.requireUserId(jwt), propertyId, unitId, request);
    }

    @DeleteMapping("/owner/properties/{propertyId}/units/{unitId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @RequiresPermission("listing.write")
    void deleteUnit(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID propertyId,
            @PathVariable UUID unitId
    ) {
        listingService.deleteUnit(OrgScope.requireUserId(jwt), propertyId, unitId);
    }

    @PutMapping("/owner/properties/{propertyId}/photos")
    @RequiresPermission("listing.write")
    List<PropertyPhotoResponse> syncPhotos(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID propertyId,
            @Valid @RequestBody SyncPhotosRequest request
    ) {
        return listingService.syncPhotos(OrgScope.requireUserId(jwt), propertyId, request);
    }

    @DeleteMapping("/owner/properties/{propertyId}/photos/{documentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @RequiresPermission("listing.write")
    void removePhoto(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID propertyId,
            @PathVariable UUID documentId
    ) {
        listingService.removePhoto(OrgScope.requireUserId(jwt), propertyId, documentId);
    }

    @PostMapping("/owner/properties/{propertyId}/submit")
    @RequiresPermission("listing.submit")
    PropertyDetailResponse submitProperty(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID propertyId
    ) {
        return listingService.submitProperty(OrgScope.requireUserId(jwt), propertyId);
    }

    @PostMapping("/owner/properties/{propertyId}/pause")
    @RequiresPermission("listing.write")
    PropertyDetailResponse pauseProperty(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID propertyId
    ) {
        return listingService.pauseProperty(OrgScope.requireUserId(jwt), propertyId);
    }

    @PostMapping("/owner/properties/{propertyId}/resume")
    @RequiresPermission("listing.write")
    PropertyDetailResponse resumeProperty(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID propertyId
    ) {
        return listingService.resumeProperty(OrgScope.requireUserId(jwt), propertyId);
    }
}
