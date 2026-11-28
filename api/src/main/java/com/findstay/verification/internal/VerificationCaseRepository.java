package com.findstay.verification.internal;

import com.findstay.verification.api.VerificationCaseStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

interface VerificationCaseRepository extends JpaRepository<VerificationCase, UUID> {

    Optional<VerificationCase> findFirstByOrganizationIdOrderByCreatedAtDesc(UUID organizationId);

    boolean existsByOrganizationIdAndStatus(UUID organizationId, VerificationCaseStatus status);

    List<VerificationCase> findByStatusOrderBySubmittedAtAsc(VerificationCaseStatus status);

    List<VerificationCase> findAllByOrderBySubmittedAtDesc();
}
