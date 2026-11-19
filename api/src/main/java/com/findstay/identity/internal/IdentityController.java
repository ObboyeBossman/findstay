package com.findstay.identity.internal;

import com.findstay.identity.internal.IdentityDtos.AccountLookupRequest;
import com.findstay.identity.internal.IdentityDtos.AccountLookupResponse;
import com.findstay.identity.internal.IdentityDtos.ProfileResponse;
import com.findstay.identity.internal.IdentityDtos.ProfileUpdateRequest;
import com.findstay.identity.internal.IdentityDtos.SessionContextResponse;
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
 * Identity bootstrap and profile endpoints ({@code S1-04-T5}, {@code DEC-S1-01/A}).
 */
@RestController
@RequestMapping("/api/v1")
class IdentityController {

    private final IdentityProvisioningService provisioningService;

    IdentityController(IdentityProvisioningService provisioningService) {
        this.provisioningService = provisioningService;
    }

    @PostMapping("/auth/lookup")
    ResponseEntity<AccountLookupResponse> lookup(@Valid @RequestBody AccountLookupRequest request) {
        return ResponseEntity.ok(provisioningService.lookupAccount(request.email()));
    }

    @PostMapping("/auth/provision")
    ResponseEntity<SessionContextResponse> provision(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(provisioningService.provisionOrGet(jwt));
    }

    @GetMapping("/me")
    ResponseEntity<SessionContextResponse> me(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(provisioningService.provisionOrGet(jwt));
    }

    @PatchMapping("/me")
    ResponseEntity<ProfileResponse> updateMe(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody ProfileUpdateRequest request) {
        return ResponseEntity.ok(provisioningService.updateProfile(jwt, request));
    }
}
