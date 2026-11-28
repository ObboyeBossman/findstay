package com.findstay.verification.internal;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.findstay.testing.AbstractIntegrationTest;
import com.findstay.testing.Req;
import com.findstay.verification.api.ReviewDecisionType;
import com.findstay.verification.api.VerificationCaseStatus;
import com.findstay.verification.api.VerificationCaseView;
import com.findstay.verification.api.VerificationDocumentStatus;
import com.findstay.verification.api.VerificationDocumentType;
import com.findstay.verification.api.VerificationReviewApi;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Full-stack PostgreSQL verification for Story {@code S1-12} ({@code T2}, {@code T3}, {@code T4},
 * {@code T6}): AES-256-GCM encryption at rest, masked Ghana Card responses, submit/resubmit after
 * corrections, and strict owner/reviewer-only document access (blocking staff, guests, and other
 * organisations).
 */
@Req("FR-08")
@AutoConfigureMockMvc
class VerificationModuleIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private GhanaCardCryptoService cryptoService;

    @Autowired
    private VerificationReviewApi verificationReviewApi;

    private UUID ownerAId;
    private UUID orgAId;
    private UUID staffAId;
    private UUID ownerBId;
    private UUID orgBId;
    private UUID guestId;
    private UUID adminId;

    @BeforeEach
    void setUp() {
        ownerAId = UUID.randomUUID();
        orgAId = UUID.randomUUID();
        staffAId = UUID.randomUUID();
        ownerBId = UUID.randomUUID();
        orgBId = UUID.randomUUID();
        guestId = UUID.randomUUID();
        adminId = UUID.randomUUID();

        seedUser(ownerAId, "ver-owner-a-" + ownerAId + "@findstay.gh", "OWNER");
        seedOrg(orgAId, ownerAId, "Sekondi Harbour Homes");

        seedUser(staffAId, "ver-staff-a-" + staffAId + "@findstay.gh", "STAFF");
        seedStaffMembership(orgAId, staffAId);

        seedUser(ownerBId, "ver-owner-b-" + ownerBId + "@findstay.gh", "OWNER");
        seedOrg(orgBId, ownerBId, "Anaji Residences");

        seedUser(guestId, "ver-guest-" + guestId + "@findstay.gh", "GUEST");
        seedUser(adminId, "ver-admin-" + adminId + "@findstay.gh", "ADMIN");
    }

    @Test
    @Req("NFR-28")
    void submitEncryptsGhanaCardAtRestMasksApiResponseAndSupportsResubmitFlow() throws Exception {
        String rawGhanaCard = "GHA-123456789-5";

        // Initial status before submission
        mockMvc.perform(get("/api/v1/owner/verification")
                        .with(jwt().jwt(j -> j.subject(ownerAId.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.organizationVerificationStatus").value("NOT_SUBMITTED"))
                .andExpect(jsonPath("$.verificationCase").doesNotExist());

        // Presign all 3 required private documents
        PresignedSlot ghanaCardDoc = presignDoc(ownerAId, "GHANA_CARD", "ghana-card.pdf", "application/pdf", 320_000);
        PresignedSlot ownershipDoc = presignDoc(ownerAId, "OWNERSHIP_PROOF", "indenture.pdf", "application/pdf", 410_000);
        PresignedSlot gtaDoc = presignDoc(ownerAId, "GTA_LICENCE", "gta-licence.pdf", "application/pdf", 215_000);

        String submitBody = """
                {
                  "ghanaCardNumber": "%s",
                  "documents": [
                    {"documentType": "GHANA_CARD", "documentId": "%s", "assetId": "%s"},
                    {"documentType": "OWNERSHIP_PROOF", "documentId": "%s", "assetId": "%s"},
                    {"documentType": "GTA_LICENCE", "documentId": "%s", "assetId": "%s"}
                  ]
                }
                """.formatted(
                rawGhanaCard,
                ghanaCardDoc.documentId(), ghanaCardDoc.assetId(),
                ownershipDoc.documentId(), ownershipDoc.assetId(),
                gtaDoc.documentId(), gtaDoc.assetId()
        );

        MvcResult submitRes = mockMvc.perform(post("/api/v1/owner/verification/submit")
                        .with(jwt().jwt(j -> j.subject(ownerAId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(submitBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.maskedGhanaCardNumber").value("GHA-******789-5"))
                .andExpect(jsonPath("$.documents.length()").value(3))
                .andReturn();

        String rawResponseJson = submitRes.getResponse().getContentAsString();
        assertThat(rawResponseJson).doesNotContain(rawGhanaCard);

        UUID caseId = UUID.fromString(objectMapper.readTree(rawResponseJson).get("id").asText());

        // Inspect raw PostgreSQL bytea column: must be AES-256-GCM ciphertext, never plaintext
        byte[] encryptedInDb = jdbc.queryForObject(
                "SELECT ghana_card_number_encrypted FROM verification.verification_case WHERE id = ?",
                byte[].class,
                caseId
        );
        assertThat(encryptedInDb).isNotNull();
        assertThat(new String(encryptedInDb, StandardCharsets.UTF_8)).doesNotContain(rawGhanaCard);
        assertThat(cryptoService.decrypt(encryptedInDb)).isEqualTo(rawGhanaCard);

        // Organization denormalised status updated to PENDING
        String orgStatus = jdbc.queryForObject(
                "SELECT verification_status FROM organization.organization WHERE id = ?",
                String.class,
                orgAId
        );
        assertThat(orgStatus).isEqualTo("PENDING");

        // Duplicate submission while PENDING returns 409 CONFLICT
        mockMvc.perform(post("/api/v1/owner/verification/submit")
                        .with(jwt().jwt(j -> j.subject(ownerAId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(submitBody))
                .andExpect(status().isConflict());

        // Admin requests corrections on GTA_LICENCE only
        VerificationCaseView afterCorrectionReq = verificationReviewApi.decideVerificationCase(
                caseId,
                adminId,
                ReviewDecisionType.REQUEST_CORRECTIONS,
                "GTA licence scan is blurry",
                List.of("Re-upload a clear colour scan of your 2026 GTA licence"),
                List.of(VerificationDocumentType.GTA_LICENCE)
        );
        assertThat(afterCorrectionReq.status()).isEqualTo(VerificationCaseStatus.PARTIALLY_REJECTED);

        // Owner sees PARTIALLY_REJECTED status, masked Ghana Card, and fix note
        MvcResult statusRes = mockMvc.perform(get("/api/v1/owner/verification")
                        .with(jwt().jwt(j -> j.subject(ownerAId.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.organizationVerificationStatus").value("PARTIALLY_REJECTED"))
                .andExpect(jsonPath("$.verificationCase.maskedGhanaCardNumber").value("GHA-******789-5"))
                .andReturn();
        assertThat(statusRes.getResponse().getContentAsString()).doesNotContain(rawGhanaCard);

        // Owner presigns replacement GTA_LICENCE (reuses same document slot ID) and resubmits
        PresignedSlot newGtaDoc = presignDoc(ownerAId, "GTA_LICENCE", "gta-licence-clear.pdf", "application/pdf", 280_000);
        assertThat(newGtaDoc.documentId()).isEqualTo(gtaDoc.documentId());

        mockMvc.perform(post("/api/v1/owner/verification/resubmit")
                        .with(jwt().jwt(j -> j.subject(ownerAId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "documents": [
                                    {"documentType": "GTA_LICENCE", "documentId": "%s", "assetId": "%s"}
                                  ]
                                }
                                """.formatted(newGtaDoc.documentId(), newGtaDoc.assetId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING"));

        // Admin approves the resubmitted case
        VerificationCaseView approved = verificationReviewApi.decideVerificationCase(
                caseId,
                adminId,
                ReviewDecisionType.APPROVE,
                "All documents verified",
                List.of(),
                List.of()
        );
        assertThat(approved.status()).isEqualTo(VerificationCaseStatus.APPROVED);
        assertThat(approved.documents())
                .allMatch(doc -> doc.status() == VerificationDocumentStatus.APPROVED);
        assertThat(verificationReviewApi.isOrganizationApproved(orgAId)).isTrue();
    }

    @Test
    @Req("TA-09")
    void blocksStaffGuestsAndCrossOrgOwnersFromVerificationDocsWhileAllowingOwnerAndAdmin() throws Exception {
        PresignedSlot ghanaCardDoc = presignDoc(ownerAId, "GHANA_CARD", "ghana-card.pdf", "application/pdf", 300_000);
        PresignedSlot ownershipDoc = presignDoc(ownerAId, "OWNERSHIP_PROOF", "deed.pdf", "application/pdf", 300_000);
        PresignedSlot gtaDoc = presignDoc(ownerAId, "GTA_LICENCE", "gta.pdf", "application/pdf", 300_000);

        mockMvc.perform(post("/api/v1/owner/verification/submit")
                        .with(jwt().jwt(j -> j.subject(ownerAId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "ghanaCardNumber": "GHA-987654321-0",
                                  "documents": [
                                    {"documentType": "GHANA_CARD", "documentId": "%s", "assetId": "%s"},
                                    {"documentType": "OWNERSHIP_PROOF", "documentId": "%s", "assetId": "%s"},
                                    {"documentType": "GTA_LICENCE", "documentId": "%s", "assetId": "%s"}
                                  ]
                                }
                                """.formatted(
                                ghanaCardDoc.documentId(), ghanaCardDoc.assetId(),
                                ownershipDoc.documentId(), ownershipDoc.assetId(),
                                gtaDoc.documentId(), gtaDoc.assetId())))
                .andExpect(status().isCreated());

        // Owner A can view signed URL for their own Ghana Card
        mockMvc.perform(get("/api/v1/owner/verification/documents/{assetId}/signed-url", ghanaCardDoc.assetId())
                        .with(jwt().jwt(j -> j.subject(ownerAId.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.downloadUrl").isNotEmpty());

        // Admin reviewer can open Owner A's private document via /api/v1/media/{assetId}/signed-url
        mockMvc.perform(get("/api/v1/media/{assetId}/signed-url", ghanaCardDoc.assetId())
                        .with(jwt().jwt(j -> j.subject(adminId.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.downloadUrl").isNotEmpty());

        // STAFF in the SAME organisation is blocked (403) from verification endpoints AND private media signed URL
        mockMvc.perform(get("/api/v1/owner/verification")
                        .with(jwt().jwt(j -> j.subject(staffAId.toString()))))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/v1/owner/verification/documents/{assetId}/signed-url", ghanaCardDoc.assetId())
                        .with(jwt().jwt(j -> j.subject(staffAId.toString()))))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/v1/media/{assetId}/signed-url", ghanaCardDoc.assetId())
                        .with(jwt().jwt(j -> j.subject(staffAId.toString()))))
                .andExpect(status().isForbidden());

        // GUEST is blocked (403)
        mockMvc.perform(get("/api/v1/owner/verification")
                        .with(jwt().jwt(j -> j.subject(guestId.toString()))))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/v1/media/{assetId}/signed-url", ghanaCardDoc.assetId())
                        .with(jwt().jwt(j -> j.subject(guestId.toString()))))
                .andExpect(status().isForbidden());

        // Owner B (different org) receives 404 (no existence leak) trying to access Owner A's doc
        mockMvc.perform(get("/api/v1/owner/verification/documents/{assetId}/signed-url", ghanaCardDoc.assetId())
                        .with(jwt().jwt(j -> j.subject(ownerBId.toString()))))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/v1/media/{assetId}/signed-url", ghanaCardDoc.assetId())
                        .with(jwt().jwt(j -> j.subject(ownerBId.toString()))))
                .andExpect(status().isNotFound());
    }

    private PresignedSlot presignDoc(
            UUID userId,
            String docType,
            String filename,
            String contentType,
            long sizeBytes
    ) throws Exception {
        MvcResult res = mockMvc.perform(post("/api/v1/owner/verification/presign")
                        .with(jwt().jwt(j -> j.subject(userId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "documentType": "%s",
                                  "filename": "%s",
                                  "contentType": "%s",
                                  "sizeBytes": %d
                                }
                                """.formatted(docType, filename, contentType, sizeBytes)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode json = objectMapper.readTree(res.getResponse().getContentAsString());
        return new PresignedSlot(
                UUID.fromString(json.get("documentId").asText()),
                UUID.fromString(json.get("upload").get("assetId").asText())
        );
    }

    private record PresignedSlot(UUID documentId, UUID assetId) {
    }

    private void seedUser(UUID userId, String email, String roleCode) {
        UUID roleId = jdbc.queryForObject(
                "SELECT id FROM identity.role WHERE code = ?",
                UUID.class,
                roleCode
        );
        jdbc.update("""
                INSERT INTO identity.user_account (id, email, role_id, status, created_at, updated_at)
                VALUES (?, ?, ?, 'ACTIVE', now(), now())
                """, userId, email, roleId);
        jdbc.update("""
                INSERT INTO identity.user_profile (user_id, full_name, updated_at)
                VALUES (?, 'Verification Test User', now())
                """, userId);
    }

    private void seedOrg(UUID orgId, UUID ownerUserId, String name) {
        jdbc.update("""
                INSERT INTO organization.organization (id, name, display_name, contact_email, verification_status, created_at, updated_at)
                VALUES (?, ?, ?, ?, 'NOT_SUBMITTED', now(), now())
                """, orgId, name, name, "org-" + orgId + "@findstay.gh");
        jdbc.update("""
                INSERT INTO organization.membership (id, organization_id, user_id, role, is_primary_owner, joined_at)
                VALUES (?, ?, ?, 'OWNER', true, now())
                """, UUID.randomUUID(), orgId, ownerUserId);
    }

    private void seedStaffMembership(UUID orgId, UUID staffUserId) {
        jdbc.update("""
                INSERT INTO organization.membership (id, organization_id, user_id, role, is_primary_owner, joined_at)
                VALUES (?, ?, ?, 'STAFF', false, now())
                """, UUID.randomUUID(), orgId, staffUserId);
    }
}
