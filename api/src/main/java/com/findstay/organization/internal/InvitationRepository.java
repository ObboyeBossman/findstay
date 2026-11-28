package com.findstay.organization.internal;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

interface InvitationRepository extends JpaRepository<Invitation, UUID> {

    List<Invitation> findByOrganizationIdOrderByCreatedAtDesc(UUID organizationId);

    Optional<Invitation> findByIdAndOrganizationId(UUID id, UUID organizationId);

    Optional<Invitation> findByTokenHash(String tokenHash);

    Optional<Invitation> findByOrganizationIdAndEmailAndStatus(UUID organizationId, String email, String status);
}
