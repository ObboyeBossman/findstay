package com.findstay.organization.internal;

import com.findstay.organization.internal.StaffDtos.InvitationResponse;
import com.findstay.organization.internal.StaffDtos.MemberResponse;
import com.findstay.shared.security.OrgScope;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

/**
 * Staff invitation preview (public, token-authorised) and acceptance (authenticated) endpoints
 * ({@code S1-07-T4}, {@code SCR-08B}).
 */
@RestController
@RequestMapping("/api/v1/invitations")
class InvitationPublicController {

    private final StaffManagementService staffService;

    InvitationPublicController(StaffManagementService staffService) {
        this.staffService = staffService;
    }

    @GetMapping("/{token}")
    ResponseEntity<InvitationResponse> previewInvitation(@PathVariable String token) {
        return ResponseEntity.ok(staffService.previewInvitation(token));
    }

    @PostMapping("/{token}/accept")
    ResponseEntity<MemberResponse> acceptInvitation(
            @PathVariable String token,
            @AuthenticationPrincipal Jwt jwt) {
        UUID callerId = OrgScope.requireUserId(jwt);
        String callerEmail = jwt.getClaimAsString("email");
        return ResponseEntity.ok(staffService.acceptInvitation(token, callerId, callerEmail));
    }
}
