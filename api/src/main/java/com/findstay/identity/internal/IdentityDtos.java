package com.findstay.identity.internal;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Request and response payloads for {@code /api/v1/auth/provision} and {@code /api/v1/me}. */
final class IdentityDtos {

    private IdentityDtos() {
    }

    record ProfileResponse(
            UUID id,
            String fullName,
            String email,
            String phone,
            String avatarUrl,
            String preferredLanguage,
            Instant createdAt
    ) {
    }

    record ProfileUpdateRequest(
            @Size(min = 1, max = 100, message = "Full name must be between 1 and 100 characters")
            String fullName,
            @Pattern(regexp = "^\\+233\\d{9}$", message = "Phone must be a Ghana E.164 number (+233XXXXXXXXX)")
            String phone,
            @Pattern(regexp = "^en$", message = "Only 'en' is supported in Release R1")
            String preferredLanguage,
            String avatarUrl
    ) {
    }

    record RoleMembershipResponse(
            String role,
            UUID organizationId,
            String organizationName,
            List<UUID> propertyIds
    ) {
    }

    record ConsentStateResponse(
            String policyVersion,
            String policyUrl,
            Instant acceptedAt
    ) {
    }

    record AccountLookupRequest(
            @NotBlank(message = "Email is required")
            @Email(message = "Please enter a valid email address")
            String email
    ) {
    }

    record AccountLookupResponse(
            boolean exists,
            String displayName
    ) {
    }

    record SessionContextResponse(
            ProfileResponse profile,
            List<RoleMembershipResponse> memberships,
            ConsentStateResponse consent,
            UUID activeOrganizationId
    ) {
    }
}
