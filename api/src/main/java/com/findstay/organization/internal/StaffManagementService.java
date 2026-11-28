package com.findstay.organization.internal;

import com.findstay.organization.api.StaffInviteAcceptedEvent;
import com.findstay.organization.internal.StaffDtos.CreateInvitationRequest;
import com.findstay.organization.internal.StaffDtos.InvitationCreatedResponse;
import com.findstay.organization.internal.StaffDtos.InvitationResponse;
import com.findstay.organization.internal.StaffDtos.MemberResponse;
import com.findstay.organization.internal.StaffDtos.UpdateMemberPermissionsRequest;
import com.findstay.shared.error.AppException;
import com.findstay.shared.error.ErrorCode;
import com.findstay.shared.event.DomainEventPublisher;
import com.findstay.shared.id.IdGenerator;
import com.findstay.shared.security.OrgMembership;
import com.findstay.shared.security.OrgRole;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

/**
 * Staff invitation lifecycle and per-property permission management ({@code S1-07-T4}).
 * Every owner-facing method is strictly scoped to {@link OrgMembership#organizationId()}.
 */
@Service
class StaffManagementService {

    private static final Duration INVITE_TTL = Duration.ofDays(7);
    private static final SecureRandom RANDOM = new SecureRandom();

    private final OrganizationRepository organizations;
    private final MembershipRepository memberships;
    private final MembershipPermissionRepository membershipPermissions;
    private final InvitationRepository invitations;
    private final InvitationPropertyRepository invitationProperties;
    private final DomainEventPublisher events;
    private final IdGenerator idGenerator;
    private final Clock clock;

    StaffManagementService(
            OrganizationRepository organizations,
            MembershipRepository memberships,
            MembershipPermissionRepository membershipPermissions,
            InvitationRepository invitations,
            InvitationPropertyRepository invitationProperties,
            DomainEventPublisher events,
            IdGenerator idGenerator,
            Clock clock) {
        this.organizations = organizations;
        this.memberships = memberships;
        this.membershipPermissions = membershipPermissions;
        this.invitations = invitations;
        this.invitationProperties = invitationProperties;
        this.events = events;
        this.idGenerator = idGenerator;
        this.clock = clock;
    }

    @Transactional
    InvitationCreatedResponse createInvitation(
            OrgMembership ownerMembership,
            UUID actorUserId,
            CreateInvitationRequest request) {
        ownerMembership.requireOwner();

        Organization org = organizations.findById(ownerMembership.organizationId())
                .orElseThrow(() -> AppException.notFound("Organization", ownerMembership.organizationId()));

        String normalizedEmail = request.email().trim().toLowerCase(Locale.ROOT);
        Instant now = clock.instant();

        // Check if a pending invite already exists for this (org, email); expire stale ones cleanly.
        invitations.findByOrganizationIdAndEmailAndStatus(org.getId(), normalizedEmail, Invitation.STATUS_PENDING)
                .ifPresent(existing -> {
                    if (!now.isAfter(existing.getExpiresAt())) {
                        throw new AppException(
                                ErrorCode.CONFLICT,
                                "An active invitation already exists for this email");
                    }
                    existing.markExpired();
                    invitations.saveAndFlush(existing);
                });

        String rawToken = generateRawToken();
        String tokenHash = sha256Hex(rawToken);
        UUID invitationId = idGenerator.newId();
        Instant expiresAt = now.plus(INVITE_TTL);

        Invitation invitation = new Invitation(
                invitationId,
                org.getId(),
                normalizedEmail,
                tokenHash,
                actorUserId,
                expiresAt,
                now);
        invitations.saveAndFlush(invitation);

        List<UUID> distinctProperties = deduplicate(request.propertyIds());
        for (UUID propertyId : distinctProperties) {
            invitationProperties.save(new InvitationProperty(invitationId, propertyId));
        }
        invitationProperties.flush();

        return new InvitationCreatedResponse(
                invitation.getId(),
                org.getId(),
                org.getDisplayName(),
                invitation.getEmail(),
                invitation.getRole(),
                invitation.getStatus(),
                distinctProperties,
                invitation.getExpiresAt(),
                invitation.getCreatedAt(),
                rawToken);
    }

    @Transactional
    List<InvitationResponse> listInvitations(OrgMembership ownerMembership) {
        ownerMembership.requireOwner();

        Organization org = organizations.findById(ownerMembership.organizationId())
                .orElseThrow(() -> AppException.notFound("Organization", ownerMembership.organizationId()));

        List<Invitation> rows = invitations.findByOrganizationIdOrderByCreatedAtDesc(org.getId());
        if (rows.isEmpty()) {
            return List.of();
        }

        Instant now = clock.instant();
        List<UUID> ids = new ArrayList<>(rows.size());
        for (Invitation inv : rows) {
            if (inv.isPending() && now.isAfter(inv.getExpiresAt())) {
                inv.markExpired();
                invitations.save(inv);
            }
            ids.add(inv.getId());
        }
        invitations.flush();

        Map<UUID, List<UUID>> propertiesByInvite = new HashMap<>();
        for (InvitationProperty ip : invitationProperties.findByInvitationIdIn(ids)) {
            propertiesByInvite.computeIfAbsent(ip.getInvitationId(), k -> new ArrayList<>())
                    .add(ip.getPropertyId());
        }

        return rows.stream()
                .map(inv -> toInvitationResponse(
                        inv,
                        org.getDisplayName(),
                        propertiesByInvite.getOrDefault(inv.getId(), List.of())))
                .toList();
    }

    @Transactional
    InvitationResponse revokeInvitation(OrgMembership ownerMembership, UUID invitationId) {
        ownerMembership.requireOwner();

        Invitation invitation = invitations.findByIdAndOrganizationId(invitationId, ownerMembership.organizationId())
                .orElseThrow(() -> AppException.notFound("Invitation", invitationId));

        if (!invitation.isPending()) {
            throw new AppException(
                    ErrorCode.CONFLICT,
                    "Only pending invitations can be revoked (current status: " + invitation.getStatus() + ")");
        }

        invitation.markRevoked();
        invitations.saveAndFlush(invitation);

        String orgName = organizations.findById(invitation.getOrganizationId())
                .map(Organization::getDisplayName)
                .orElse("Organization");
        List<UUID> props = invitationProperties.findByInvitationId(invitationId).stream()
                .map(InvitationProperty::getPropertyId)
                .toList();

        return toInvitationResponse(invitation, orgName, props);
    }

    @Transactional
    InvitationResponse previewInvitation(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw AppException.notFound("Invitation", "token");
        }
        String tokenHash = sha256Hex(rawToken.trim());
        Invitation invitation = invitations.findByTokenHash(tokenHash)
                .orElseThrow(() -> AppException.notFound("Invitation", "token"));

        Instant now = clock.instant();
        if (invitation.isPending() && now.isAfter(invitation.getExpiresAt())) {
            invitation.markExpired();
            invitations.saveAndFlush(invitation);
        }

        String orgName = organizations.findById(invitation.getOrganizationId())
                .map(Organization::getDisplayName)
                .orElse("Organization");
        List<UUID> props = invitationProperties.findByInvitationId(invitation.getId()).stream()
                .map(InvitationProperty::getPropertyId)
                .toList();

        return toInvitationResponse(invitation, orgName, props);
    }

    @Transactional
    MemberResponse acceptInvitation(String rawToken, UUID callerUserId, String callerEmail) {
        if (rawToken == null || rawToken.isBlank()) {
            throw AppException.notFound("Invitation", "token");
        }
        String tokenHash = sha256Hex(rawToken.trim());
        Invitation invitation = invitations.findByTokenHash(tokenHash)
                .orElseThrow(() -> AppException.notFound("Invitation", "token"));

        Instant now = clock.instant();

        if (Invitation.STATUS_REVOKED.equals(invitation.getStatus())) {
            throw new AppException(ErrorCode.CONFLICT, "This invitation has been revoked");
        }
        if (Invitation.STATUS_ACCEPTED.equals(invitation.getStatus())) {
            throw new AppException(ErrorCode.CONFLICT, "This invitation has already been accepted");
        }
        if (Invitation.STATUS_EXPIRED.equals(invitation.getStatus()) || now.isAfter(invitation.getExpiresAt())) {
            if (invitation.isPending()) {
                invitation.markExpired();
                invitations.saveAndFlush(invitation);
            }
            throw new AppException(ErrorCode.BUSINESS_RULE_VIOLATION, "This invitation has expired");
        }

        String normalizedCaller = callerEmail == null ? "" : callerEmail.trim().toLowerCase(Locale.ROOT);
        if (!invitation.getEmail().equalsIgnoreCase(normalizedCaller)) {
            throw AppException.forbidden("This invitation was sent to a different email address");
        }

        if (memberships.findByOrganizationIdAndUserId(invitation.getOrganizationId(), callerUserId).isPresent()) {
            throw new AppException(ErrorCode.CONFLICT, "You are already a member of this organisation");
        }

        UUID membershipId = idGenerator.newId();
        Membership membership = new Membership(
                membershipId,
                invitation.getOrganizationId(),
                callerUserId,
                OrgRole.STAFF.name(),
                false,
                now);
        memberships.saveAndFlush(membership);

        List<UUID> propertyIds = invitationProperties.findByInvitationId(invitation.getId()).stream()
                .map(InvitationProperty::getPropertyId)
                .toList();
        for (UUID propertyId : propertyIds) {
            membershipPermissions.save(new MembershipPermission(membershipId, propertyId));
        }
        membershipPermissions.flush();

        invitation.markAccepted(callerUserId, now);
        invitations.saveAndFlush(invitation);

        events.publish(new StaffInviteAcceptedEvent(
                events.newMeta(),
                callerUserId,
                invitation.getOrganizationId(),
                Set.copyOf(propertyIds)));

        return new MemberResponse(
                membership.getId(),
                membership.getUserId(),
                membership.getRole(),
                membership.isPrimaryOwner(),
                propertyIds,
                membership.getJoinedAt());
    }

    @Transactional(readOnly = true)
    List<MemberResponse> listMembers(OrgMembership activeMembership) {
        List<Membership> rows = memberships.findByOrganizationIdOrderByJoinedAtAsc(activeMembership.organizationId());
        if (rows.isEmpty()) {
            return List.of();
        }
        List<UUID> membershipIds = rows.stream().map(Membership::getId).toList();
        Map<UUID, List<UUID>> permsByMembership = new HashMap<>();
        for (MembershipPermission perm : membershipPermissions.findByMembershipIdIn(membershipIds)) {
            permsByMembership.computeIfAbsent(perm.getMembershipId(), k -> new ArrayList<>())
                    .add(perm.getPropertyId());
        }

        return rows.stream()
                .map(m -> new MemberResponse(
                        m.getId(),
                        m.getUserId(),
                        m.getRole(),
                        m.isPrimaryOwner(),
                        List.copyOf(permsByMembership.getOrDefault(m.getId(), List.of())),
                        m.getJoinedAt()))
                .toList();
    }

    @Transactional
    MemberResponse updateMemberPermissions(
            OrgMembership ownerMembership,
            UUID targetUserId,
            UpdateMemberPermissionsRequest request) {
        ownerMembership.requireOwner();

        Membership target = memberships
                .findByOrganizationIdAndUserId(ownerMembership.organizationId(), targetUserId)
                .orElseThrow(() -> AppException.notFound("Member", targetUserId));

        if (target.isPrimaryOwner() || OrgRole.OWNER.name().equals(target.getRole())) {
            throw new AppException(
                    ErrorCode.BUSINESS_RULE_VIOLATION,
                    "Cannot modify per-property permissions for an owner membership");
        }

        membershipPermissions.deleteByMembershipId(target.getId());
        membershipPermissions.flush();

        List<UUID> updatedProperties = deduplicate(request.propertyIds());
        for (UUID propertyId : updatedProperties) {
            membershipPermissions.save(new MembershipPermission(target.getId(), propertyId));
        }
        membershipPermissions.flush();

        return new MemberResponse(
                target.getId(),
                target.getUserId(),
                target.getRole(),
                target.isPrimaryOwner(),
                updatedProperties,
                target.getJoinedAt());
    }

    private static InvitationResponse toInvitationResponse(
            Invitation inv,
            String orgDisplayName,
            List<UUID> propertyIds) {
        return new InvitationResponse(
                inv.getId(),
                inv.getOrganizationId(),
                orgDisplayName,
                inv.getEmail(),
                inv.getRole(),
                inv.getStatus(),
                List.copyOf(propertyIds),
                inv.getExpiresAt(),
                inv.getAcceptedAt(),
                inv.getCreatedAt());
    }

    private static List<UUID> deduplicate(List<UUID> propertyIds) {
        if (propertyIds == null || propertyIds.isEmpty()) {
            return List.of();
        }
        Set<UUID> unique = new LinkedHashSet<>();
        for (UUID id : propertyIds) {
            if (id != null) {
                unique.add(id);
            }
        }
        return List.copyOf(unique);
    }

    private static String generateRawToken() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    static String sha256Hex(String rawToken) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }
}
