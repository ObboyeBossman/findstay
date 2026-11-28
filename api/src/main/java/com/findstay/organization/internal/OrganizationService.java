package com.findstay.organization.internal;

import com.findstay.organization.api.OrganizationAccessApi;
import com.findstay.organization.api.OrganizationSummary;
import com.findstay.organization.internal.OrganizationDtos.OrganizationResponse;
import com.findstay.organization.internal.OrganizationDtos.OrganizationUpdateRequest;
import com.findstay.shared.error.AppException;
import com.findstay.shared.error.ErrorCode;
import com.findstay.shared.id.IdGenerator;
import com.findstay.shared.security.OrgMembership;
import com.findstay.shared.security.OrgMembershipResolver;
import com.findstay.shared.security.OrgRole;
import com.findstay.shared.security.OrgScope;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * Manages owner organisations, primary owner memberships, and {@link OrgScope} database resolution
 * ({@code S1-07-T3}, {@code S1-07-T5}).
 */
@Service
class OrganizationService implements OrganizationAccessApi, OrgMembershipResolver {

    private static final String DEFAULT_VERIFICATION_STATUS = "NOT_SUBMITTED";
    private static final Pattern GHANA_E164 = Pattern.compile("^\\+233\\d{9}$");

    private final OrganizationRepository organizations;
    private final MembershipRepository memberships;
    private final MembershipPermissionRepository permissions;
    private final IdGenerator idGenerator;
    private final Clock clock;

    OrganizationService(
            OrganizationRepository organizations,
            MembershipRepository memberships,
            MembershipPermissionRepository permissions,
            IdGenerator idGenerator,
            Clock clock) {
        this.organizations = organizations;
        this.memberships = memberships;
        this.permissions = permissions;
        this.idGenerator = idGenerator;
        this.clock = clock;
    }

    @Override
    @Transactional
    public OrganizationSummary ensureOwnerOrganization(
            UUID userId,
            String email,
            String fullName,
            String phone) {
        if (userId == null) {
            throw AppException.unauthenticated("Missing user identifier");
        }

        List<Membership> existingMemberships = memberships.findByUserIdOrderByJoinedAtAsc(userId);
        for (Membership m : existingMemberships) {
            if ("OWNER".equals(m.getRole())) {
                Organization existingOrg = organizations.findById(m.getOrganizationId())
                        .orElseThrow(() -> AppException.notFound("Organization", m.getOrganizationId()));
                return toSummary(existingOrg);
            }
        }

        String normalizedEmail = (email == null || email.isBlank())
                ? "owner-" + userId + "@findstay.local"
                : email.trim().toLowerCase(Locale.ROOT);
        String defaultName = resolveDefaultOrgName(fullName, normalizedEmail);
        String validPhone = (phone != null && GHANA_E164.matcher(phone.trim()).matches())
                ? phone.trim()
                : null;
        Instant now = clock.instant();

        Organization org = new Organization(
                idGenerator.newId(),
                defaultName,
                defaultName,
                normalizedEmail,
                validPhone,
                DEFAULT_VERIFICATION_STATUS,
                now);
        organizations.saveAndFlush(org);

        Membership primaryOwnerMembership = new Membership(
                idGenerator.newId(),
                org.getId(),
                userId,
                OrgRole.OWNER.name(),
                true,
                now);
        memberships.saveAndFlush(primaryOwnerMembership);

        return toSummary(org);
    }

    @Transactional
    OrganizationResponse onboardFromJwt(Jwt jwt) {
        UUID userId = OrgScope.requireUserId(jwt);
        String email = jwt.getClaimAsString("email");
        Map<String, Object> metadata = jwt.getClaimAsMap("user_metadata");
        String fullName = null;
        String phone = jwt.getClaimAsString("phone");
        if (metadata != null) {
            Object fn = metadata.get("full_name");
            if (fn instanceof String s && !s.isBlank()) {
                fullName = s.trim();
            } else if (metadata.get("name") instanceof String s2 && !s2.isBlank()) {
                fullName = s2.trim();
            }
            if (metadata.get("phone") instanceof String p && !p.isBlank()) {
                phone = p.trim();
            }
        }
        return toResponse(ensureOwnerOrganization(userId, email, fullName, phone));
    }

    @Transactional(readOnly = true)
    OrganizationResponse getOrganizationForMember(OrgMembership membership) {
        Organization org = organizations.findById(membership.organizationId())
                .orElseThrow(() -> AppException.notFound("Organization", membership.organizationId()));
        return toResponse(toSummary(org));
    }

    @Transactional
    OrganizationResponse updateOrganization(OrgMembership ownerMembership, OrganizationUpdateRequest request) {
        ownerMembership.requireOwner();
        Organization org = organizations.findById(ownerMembership.organizationId())
                .orElseThrow(() -> AppException.notFound("Organization", ownerMembership.organizationId()));

        if (request.name() != null) {
            String trimmed = request.name().trim();
            if (trimmed.isEmpty()) {
                throw new AppException(ErrorCode.VALIDATION_FAILED, "Company name cannot be blank");
            }
            org.setName(trimmed);
        }
        if (request.displayName() != null) {
            String trimmed = request.displayName().trim();
            if (trimmed.isEmpty()) {
                throw new AppException(ErrorCode.VALIDATION_FAILED, "Display name cannot be blank");
            }
            org.setDisplayName(trimmed);
        }
        if (request.contactEmail() != null) {
            String trimmed = request.contactEmail().trim().toLowerCase(Locale.ROOT);
            if (trimmed.isEmpty()) {
                throw new AppException(ErrorCode.VALIDATION_FAILED, "Contact email cannot be blank");
            }
            org.setContactEmail(trimmed);
        }
        if (request.contactPhone() != null) {
            String trimmed = request.contactPhone().trim();
            org.setContactPhone(trimmed.isEmpty() ? null : trimmed);
        }

        org.setUpdatedAt(clock.instant());
        organizations.saveAndFlush(org);
        return toResponse(toSummary(org));
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrgMembership> findMembershipsByUserId(UUID userId) {
        return findMembershipsForUser(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrgMembership> findMembershipsForUser(UUID userId) {
        if (userId == null) {
            return List.of();
        }
        List<Membership> rows = memberships.findByUserIdOrderByJoinedAtAsc(userId);
        if (rows.isEmpty()) {
            return List.of();
        }

        List<UUID> membershipIds = rows.stream().map(Membership::getId).toList();
        List<UUID> orgIds = rows.stream().map(Membership::getOrganizationId).distinct().toList();

        Map<UUID, Organization> orgsById = new HashMap<>();
        for (Organization org : organizations.findAllById(orgIds)) {
            orgsById.put(org.getId(), org);
        }

        Map<UUID, Set<UUID>> propertyIdsByMembership = new HashMap<>();
        for (MembershipPermission perm : permissions.findByMembershipIdIn(membershipIds)) {
            propertyIdsByMembership
                    .computeIfAbsent(perm.getMembershipId(), k -> new LinkedHashSet<>())
                    .add(perm.getPropertyId());
        }

        List<OrgMembership> result = new ArrayList<>(rows.size());
        for (Membership row : rows) {
            Organization org = orgsById.get(row.getOrganizationId());
            String orgName = org != null ? org.getDisplayName() : "Organization";
            OrgRole role = OrgRole.valueOf(row.getRole());
            Set<UUID> propIds = propertyIdsByMembership.getOrDefault(row.getId(), Set.of());
            result.add(new OrgMembership(
                    row.getOrganizationId(),
                    orgName,
                    role,
                    row.isPrimaryOwner(),
                    propIds));
        }
        return List.copyOf(result);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<OrganizationSummary> findOrganizationById(UUID organizationId) {
        return organizations.findById(organizationId).map(OrganizationService::toSummary);
    }

    @Override
    @Transactional
    public void updateVerificationStatus(UUID organizationId, String verificationStatus) {
        Organization org = organizations.findById(organizationId)
                .orElseThrow(() -> AppException.notFound("Organization", organizationId));
        org.setVerificationStatus(verificationStatus);
        org.setUpdatedAt(clock.instant());
        organizations.save(org);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UUID> findPrimaryOwnerUserId(UUID organizationId) {
        return memberships.findByOrganizationIdOrderByJoinedAtAsc(organizationId).stream()
                .filter(m -> "OWNER".equals(m.getRole()))
                .map(Membership::getUserId)
                .findFirst();
    }

    private static String resolveDefaultOrgName(String fullName, String email) {
        if (fullName != null && !fullName.isBlank()) {
            String trimmed = fullName.trim();
            return (trimmed.length() > 80 ? trimmed.substring(0, 80) : trimmed) + " Properties";
        }
        int at = email.indexOf('@');
        String prefix = at > 0 ? email.substring(0, at) : "Owner";
        return prefix + " Properties";
    }

    private static OrganizationSummary toSummary(Organization org) {
        return new OrganizationSummary(
                org.getId(),
                org.getName(),
                org.getDisplayName(),
                org.getContactEmail(),
                org.getContactPhone(),
                org.getVerificationStatus(),
                org.getCreatedAt());
    }

    private static OrganizationResponse toResponse(OrganizationSummary summary) {
        return new OrganizationResponse(
                summary.id(),
                summary.name(),
                summary.displayName(),
                summary.contactEmail(),
                summary.contactPhone(),
                summary.verificationStatus(),
                summary.createdAt());
    }
}
