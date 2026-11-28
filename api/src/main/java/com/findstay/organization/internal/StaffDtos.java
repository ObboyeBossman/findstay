package com.findstay.organization.internal;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Request and response payloads for staff invitation and per-property permission APIs ({@code S1-07-T4}). */
final class StaffDtos {

    private StaffDtos() {
    }

    record CreateInvitationRequest(
            @NotBlank(message = "Staff email is required")
            @Email(message = "Enter a valid staff email address")
            String email,
            List<UUID> propertyIds
    ) {
    }

    record InvitationResponse(
            UUID id,
            UUID organizationId,
            String organizationDisplayName,
            String email,
            String role,
            String status,
            List<UUID> propertyIds,
            Instant expiresAt,
            Instant acceptedAt,
            Instant createdAt
    ) {
    }

    record InvitationCreatedResponse(
            UUID id,
            UUID organizationId,
            String organizationDisplayName,
            String email,
            String role,
            String status,
            List<UUID> propertyIds,
            Instant expiresAt,
            Instant createdAt,
            String acceptToken
    ) {
    }

    record MemberResponse(
            UUID membershipId,
            UUID userId,
            String role,
            boolean isPrimaryOwner,
            List<UUID> propertyIds,
            Instant joinedAt
    ) {
    }

    record UpdateMemberPermissionsRequest(
            @NotNull(message = "propertyIds list is required")
            List<UUID> propertyIds
    ) {
    }
}
