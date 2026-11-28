package com.findstay.organization.internal;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

interface MembershipRepository extends JpaRepository<Membership, UUID> {

    List<Membership> findByUserIdOrderByJoinedAtAsc(UUID userId);

    List<Membership> findByOrganizationIdOrderByJoinedAtAsc(UUID organizationId);

    Optional<Membership> findByOrganizationIdAndUserId(UUID organizationId, UUID userId);
}
