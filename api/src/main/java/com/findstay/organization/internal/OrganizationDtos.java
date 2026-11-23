package com.findstay.organization.internal;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.UUID;

final class OrganizationDtos {

    private OrganizationDtos() {
    }

    record OrganizationResponse(
            UUID id,
            String name,
            String displayName,
            String contactEmail,
            String contactPhone,
            String verificationStatus,
            Instant createdAt
    ) {
    }

    record OrganizationUpdateRequest(
            @Size(min = 1, max = 120, message = "Company name must be between 1 and 120 characters")
            String name,
            @Size(min = 1, max = 80, message = "Display name must be between 1 and 80 characters")
            String displayName,
            @Email(message = "Please enter a valid contact email address")
            String contactEmail,
            @Pattern(regexp = "^\\+233\\d{9}$", message = "Contact phone must be a Ghana E.164 number (+233XXXXXXXXX)")
            String contactPhone
    ) {
    }
}
