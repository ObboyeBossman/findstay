package com.findstay.verification.internal;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

interface VerificationDocumentRepository extends JpaRepository<VerificationDocument, UUID> {

    List<VerificationDocument> findByVerificationCaseIdOrderByDocumentTypeAsc(UUID verificationCaseId);
}
