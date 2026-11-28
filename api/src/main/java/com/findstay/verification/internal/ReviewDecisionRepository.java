package com.findstay.verification.internal;

import com.findstay.verification.api.ReviewEntityKind;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

interface ReviewDecisionRepository extends JpaRepository<ReviewDecision, UUID> {

    List<ReviewDecision> findByEntityKindAndEntityIdOrderByDecidedAtDesc(ReviewEntityKind entityKind, UUID entityId);
}
