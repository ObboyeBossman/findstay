package com.findstay.organization.internal;

import com.findstay.organization.internal.StaffDtos.CreateInvitationRequest;
import com.findstay.organization.internal.StaffDtos.InvitationCreatedResponse;
import com.findstay.organization.internal.StaffDtos.InvitationResponse;
import com.findstay.organization.internal.StaffDtos.MemberResponse;
import com.findstay.organization.internal.StaffDtos.UpdateMemberPermissionsRequest;
import com.findstay.shared.security.OrgMembership;
import com.findstay.shared.security.OrgScope;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * Owner-scoped staff invitation and per-property permission endpoints ({@code S1-07-T4}).
 */
@RestController
@RequestMapping("/api/v1/owner")
class StaffController {

    private final StaffManagementService staffService;
    private final OrgScope orgScope;

    StaffController(StaffManagementService staffService, OrgScope orgScope) {
        this.staffService = staffService;
        this.orgScope = orgScope;
    }

    @PostMapping("/invitations")
    ResponseEntity<InvitationCreatedResponse> createInvitation(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody CreateInvitationRequest request) {
        OrgMembership owner = orgScope.requireOwner(jwt);
        UUID actorId = OrgScope.requireUserId(jwt);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(staffService.createInvitation(owner, actorId, request));
    }

    @GetMapping("/invitations")
    ResponseEntity<List<InvitationResponse>> listInvitations(@AuthenticationPrincipal Jwt jwt) {
        OrgMembership owner = orgScope.requireOwner(jwt);
        return ResponseEntity.ok(staffService.listInvitations(owner));
    }

    @DeleteMapping("/invitations/{invitationId}")
    ResponseEntity<InvitationResponse> revokeInvitation(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID invitationId) {
        OrgMembership owner = orgScope.requireOwner(jwt);
        return ResponseEntity.ok(staffService.revokeInvitation(owner, invitationId));
    }

    @GetMapping("/members")
    ResponseEntity<List<MemberResponse>> listMembers(@AuthenticationPrincipal Jwt jwt) {
        OrgMembership active = orgScope.requireActive(jwt);
        return ResponseEntity.ok(staffService.listMembers(active));
    }

    @PatchMapping("/members/{userId}")
    ResponseEntity<MemberResponse> updateMemberPermissions(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateMemberPermissionsRequest request) {
        OrgMembership owner = orgScope.requireOwner(jwt);
        return ResponseEntity.ok(staffService.updateMemberPermissions(owner, userId, request));
    }
}
