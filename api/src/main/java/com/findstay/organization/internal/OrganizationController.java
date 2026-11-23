package com.findstay.organization.internal;

import com.findstay.organization.internal.OrganizationDtos.OrganizationResponse;
import com.findstay.organization.internal.OrganizationDtos.OrganizationUpdateRequest;
import com.findstay.shared.security.OrgMembership;
import com.findstay.shared.security.OrgScope;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Owner organisation onboarding and profile endpoints ({@code S1-07-T3}, {@code S1-07-T5}).
 */
@RestController
@RequestMapping("/api/v1/owner/org")
class OrganizationController {

    private final OrganizationService organizationService;
    private final OrgScope orgScope;

    OrganizationController(OrganizationService organizationService, OrgScope orgScope) {
        this.organizationService = organizationService;
        this.orgScope = orgScope;
    }

    /**
     * Idempotently auto-creates the owner's company space and primary OWNER membership on onboarding.
     */
    @PostMapping
    ResponseEntity<OrganizationResponse> onboardOrganization(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(organizationService.onboardFromJwt(jwt));
    }

    @GetMapping
    ResponseEntity<OrganizationResponse> getOrganization(@AuthenticationPrincipal Jwt jwt) {
        OrgMembership membership = orgScope.requireActive(jwt);
        return ResponseEntity.ok(organizationService.getOrganizationForMember(membership));
    }

    @PatchMapping
    ResponseEntity<OrganizationResponse> updateOrganization(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody OrganizationUpdateRequest request) {
        OrgMembership ownerMembership = orgScope.requireOwner(jwt);
        return ResponseEntity.ok(organizationService.updateOrganization(ownerMembership, request));
    }
}
