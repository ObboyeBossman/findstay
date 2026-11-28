package com.findstay.admin.internal;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.findstay.testing.AbstractIntegrationTest;
import com.findstay.testing.Req;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Full-stack PostgreSQL verification for Story {@code S1-15} ({@code T2}, {@code T3}, {@code T5}):
 * unified Admin Approval Queue, unapproved-publish protection, mandatory written reasons on
 * reject/corrections/suspend/restore, {@code audit.audit_log} recording, {@code review_decision} &amp;
 * {@code listing_status_history} tracking, and owner notifications.
 */
@Req("FR-21")
@AutoConfigureMockMvc
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class AdminReviewIntegrationTest extends AbstractIntegrationTest {

    private static final UUID BEACH_ROAD_AREA_ID = UUID.fromString("01a1e6cd-a818-7001-bf00-000000000001");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private ObjectMapper objectMapper;

    private UUID adminId;
    private UUID ownerId;
    private UUID orgId;
    private UUID staffId;
    private UUID guestId;

    @BeforeEach
    void setUp() {
        adminId = UUID.randomUUID();
        ownerId = UUID.randomUUID();
        orgId = UUID.randomUUID();
        staffId = UUID.randomUUID();
        guestId = UUID.randomUUID();

        seedUser(adminId, "rev-admin-" + adminId + "@findstay.gh", "ADMIN", "Nana Admin");
        seedUser(ownerId, "rev-owner-" + ownerId + "@findstay.gh", "OWNER", "Abena Owner");
        seedOrg(orgId, ownerId, "Takoradi Palm Suites");
        seedUser(staffId, "rev-staff-" + staffId + "@findstay.gh", "STAFF", "Yaw Staff");
        seedStaffMembership(orgId, staffId);
        seedUser(guestId, "rev-guest-" + guestId + "@findstay.gh", "GUEST", "Akosua Guest");
    }

    @Test
    @Req("FR-88")
    void endToEndVerificationAndListingReviewEnforcesReasonsAuditLogsAndNotifications() throws Exception {
        // 1. Owner submits verification case (3 private docs + Ghana Card)
        UUID caseId = submitVerificationCase(ownerId);

        // Queue shows the pending verification case
        mockMvc.perform(get("/api/v1/admin/reviews")
                        .param("kind", "VERIFICATION")
                        .param("status", "PENDING")
                        .with(jwt().jwt(j -> j.subject(adminId.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.id=='" + caseId + "')].status").value("PENDING"));

        // Admin inspects detail (masked Ghana Card, 3 documents)
        mockMvc.perform(get("/api/v1/admin/reviews/VERIFICATION/{caseId}", caseId)
                        .with(jwt().jwt(j -> j.subject(adminId.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.verificationCase.maskedGhanaCardNumber").value("GHA-******789-5"))
                .andExpect(jsonPath("$.verificationCase.documents.length()").value(3));

        // Rejecting without reason fails with 422 BUSINESS_RULE_VIOLATION
        mockMvc.perform(post("/api/v1/admin/reviews/VERIFICATION/{caseId}/decision", caseId)
                        .with(jwt().jwt(j -> j.subject(adminId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"decision": "REJECT", "reason": "   "}
                                """))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.code").value("BUSINESS_RULE_VIOLATION"));

        // Admin approves verification case -> APPROVED + audit log + owner alert
        mockMvc.perform(post("/api/v1/admin/reviews/VERIFICATION/{caseId}/decision", caseId)
                        .with(jwt().jwt(j -> j.subject(adminId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"decision": "APPROVE", "reason": "All 3 Takoradi verification docs verified"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));

        assertAuditCount(adminId, "verification.approved", caseId.toString(), 1);
        assertNotificationCount(ownerId, "VERIFICATION_APPROVED", 1);

        // 2. Verified owner creates, completes, and submits a property listing
        UUID propertyId = createAndSubmitListing(ownerId);

        // Unapproved (PENDING_REVIEW) listing MUST NOT be publicly visible (404)
        mockMvc.perform(get("/api/v1/properties/{propertyId}", propertyId))
                .andExpect(status().isNotFound());

        // Requesting corrections without reason or fix items fails with 422
        mockMvc.perform(post("/api/v1/admin/reviews/LISTING/{propertyId}/decision", propertyId)
                        .with(jwt().jwt(j -> j.subject(adminId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"decision": "REQUEST_CORRECTIONS", "reason": ""}
                                """))
                .andExpect(status().isUnprocessableEntity());

        // Admin requests corrections with written reason -> CORRECTIONS_REQUESTED, still NOT public
        mockMvc.perform(post("/api/v1/admin/reviews/LISTING/{propertyId}/decision", propertyId)
                        .with(jwt().jwt(j -> j.subject(adminId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "decision": "REQUEST_CORRECTIONS",
                                  "reason": "Clarify check-in hours and add exterior landmark",
                                  "corrections": ["Update house rules with exact check-in time"]
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CORRECTIONS_REQUESTED"))
                .andExpect(jsonPath("$.decisions.length()").value(1));

        mockMvc.perform(get("/api/v1/properties/{propertyId}", propertyId))
                .andExpect(status().isNotFound());
        assertAuditCount(adminId, "listing.corrections_requested", propertyId.toString(), 1);
        assertNotificationCount(ownerId, "LISTING_CORRECTIONS_REQUESTED", 1);

        // 3. Owner resubmits -> Admin approves -> Listing publishes to public API!
        mockMvc.perform(post("/api/v1/owner/properties/{propertyId}/submit", propertyId)
                        .with(jwt().jwt(j -> j.subject(ownerId.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING_REVIEW"));

        mockMvc.perform(post("/api/v1/admin/reviews/LISTING/{propertyId}/decision", propertyId)
                        .with(jwt().jwt(j -> j.subject(adminId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"decision": "APPROVE", "reason": "Verified photos, pricing, and house rules"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.decisions.length()").value(2));

        // Now published on public endpoint!
        mockMvc.perform(get("/api/v1/properties/{propertyId}", propertyId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.ownerVerified").value(true));

        assertAuditCount(adminId, "listing.approved", propertyId.toString(), 1);
        assertNotificationCount(ownerId, "LISTING_APPROVED", 1);

        // 4. Suspend without reason fails (422); suspend with reason hides from public + audits + notifies
        mockMvc.perform(post("/api/v1/admin/listings/{propertyId}/suspend", propertyId)
                        .with(jwt().jwt(j -> j.subject(adminId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"reason": ""}
                                """))
                .andExpect(status().isUnprocessableEntity());

        mockMvc.perform(post("/api/v1/admin/listings/{propertyId}/suspend", propertyId)
                        .with(jwt().jwt(j -> j.subject(adminId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"reason": "Temporary safety inspection requested"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUSPENDED"));

        mockMvc.perform(get("/api/v1/properties/{propertyId}", propertyId))
                .andExpect(status().isNotFound());
        assertAuditCount(adminId, "listing.suspended", propertyId.toString(), 1);
        assertNotificationCount(ownerId, "LISTING_SUSPENDED", 1);

        // 5. Restore with written reason returns listing to ACTIVE + audits + notifies
        mockMvc.perform(post("/api/v1/admin/listings/{propertyId}/restore", propertyId)
                        .with(jwt().jwt(j -> j.subject(adminId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"reason": "Safety inspection passed"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"));

        mockMvc.perform(get("/api/v1/properties/{propertyId}", propertyId))
                .andExpect(status().isOk());
        assertAuditCount(adminId, "listing.restored", propertyId.toString(), 1);
        assertNotificationCount(ownerId, "LISTING_RESTORED", 1);

        // listing_status_history recorded every transition (DRAFT -> PENDING -> CORRECTIONS -> PENDING -> ACTIVE -> SUSPENDED -> ACTIVE)
        Integer historyCount = jdbc.queryForObject(
                "SELECT count(*) FROM listing.listing_status_history WHERE property_id = ?",
                Integer.class,
                propertyId
        );
        assertThat(historyCount).isEqualTo(7);
    }

    @Test
    @Req("UR-A02")
    void blocksNonAdminUsersFromReviewQueueAndModerationEndpoints() throws Exception {
        UUID fakeId = UUID.randomUUID();
        for (UUID nonAdmin : new UUID[]{ownerId, staffId, guestId}) {
            mockMvc.perform(get("/api/v1/admin/reviews")
                            .with(jwt().jwt(j -> j.subject(nonAdmin.toString()))))
                    .andExpect(status().isForbidden());

            mockMvc.perform(post("/api/v1/admin/listings/{id}/suspend", fakeId)
                            .with(jwt().jwt(j -> j.subject(nonAdmin.toString())))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"reason": "Attempted bypass"}
                                    """))
                    .andExpect(status().isForbidden());
        }
    }

    private UUID submitVerificationCase(UUID userId) throws Exception {
        JsonNode gc = presignVerDoc(userId, "GHANA_CARD", "gc.pdf");
        JsonNode own = presignVerDoc(userId, "OWNERSHIP_PROOF", "deed.pdf");
        JsonNode gta = presignVerDoc(userId, "GTA_LICENCE", "gta.pdf");

        MvcResult res = mockMvc.perform(post("/api/v1/owner/verification/submit")
                        .with(jwt().jwt(j -> j.subject(userId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "ghanaCardNumber": "GHA-123456789-5",
                                  "documents": [
                                    {"documentType": "GHANA_CARD", "documentId": "%s", "assetId": "%s"},
                                    {"documentType": "OWNERSHIP_PROOF", "documentId": "%s", "assetId": "%s"},
                                    {"documentType": "GTA_LICENCE", "documentId": "%s", "assetId": "%s"}
                                  ]
                                }
                                """.formatted(
                                gc.get("documentId").asText(), gc.get("upload").get("assetId").asText(),
                                own.get("documentId").asText(), own.get("upload").get("assetId").asText(),
                                gta.get("documentId").asText(), gta.get("upload").get("assetId").asText()
                        )))
                .andExpect(status().isCreated())
                .andReturn();
        return UUID.fromString(objectMapper.readTree(res.getResponse().getContentAsString()).get("id").asText());
    }

    private JsonNode presignVerDoc(UUID userId, String docType, String filename) throws Exception {
        MvcResult res = mockMvc.perform(post("/api/v1/owner/verification/presign")
                        .with(jwt().jwt(j -> j.subject(userId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "documentType": "%s",
                                  "filename": "%s",
                                  "contentType": "application/pdf",
                                  "sizeBytes": 120000
                                }
                                """.formatted(docType, filename)))
                .andExpect(status().isCreated())
                .andReturn();
        return objectMapper.readTree(res.getResponse().getContentAsString());
    }

    private UUID createAndSubmitListing(UUID userId) throws Exception {
        MvcResult createRes = mockMvc.perform(post("/api/v1/owner/properties")
                        .with(jwt().jwt(j -> j.subject(userId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Palm Breeze Suites",
                                  "accommodationTypeCode": "SUITE",
                                  "town": "Takoradi",
                                  "areaId": "%s",
                                  "address": "22 Beach Road, Takoradi",
                                  "description": "Bright coastal suites with generator backup and Wi-Fi.",
                                  "houseRules": "Check-in 14:00, check-out 11:00. Quiet after 22:00.",
                                  "amenityCodes": ["WIFI", "BACKUP_POWER"]
                                }
                                """.formatted(BEACH_ROAD_AREA_ID)))
                .andExpect(status().isCreated())
                .andReturn();
        UUID propertyId = UUID.fromString(
                objectMapper.readTree(createRes.getResponse().getContentAsString()).get("id").asText()
        );

        mockMvc.perform(post("/api/v1/owner/properties/{propertyId}/units", propertyId)
                        .with(jwt().jwt(j -> j.subject(userId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Palm Deluxe",
                                  "maxGuests": 2,
                                  "quantity": 2,
                                  "nightlyRatePesewas": 55000
                                }
                                """))
                .andExpect(status().isCreated());

        MvcResult presignRes = mockMvc.perform(post("/api/v1/owner/media/presign")
                        .with(jwt().jwt(j -> j.subject(userId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "ownerType": "PROPERTY_PHOTO",
                                  "ownerId": "%s",
                                  "filename": "exterior.webp",
                                  "contentType": "image/webp",
                                  "sizeBytes": 140000
                                }
                                """.formatted(propertyId)))
                .andExpect(status().isCreated())
                .andReturn();
        JsonNode mediaJson = objectMapper.readTree(presignRes.getResponse().getContentAsString());
        UUID assetId = UUID.fromString(mediaJson.get("assetId").asText());
        UUID docId = UUID.fromString(mediaJson.get("documentId").asText());

        mockMvc.perform(post("/api/v1/owner/media/{assetId}/confirm", assetId)
                        .with(jwt().jwt(j -> j.subject(userId.toString()))))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/v1/owner/media/{assetId}/promote-webp", assetId)
                        .with(jwt().jwt(j -> j.subject(userId.toString()))))
                .andExpect(status().isOk());

        mockMvc.perform(put("/api/v1/owner/properties/{propertyId}/photos", propertyId)
                        .with(jwt().jwt(j -> j.subject(userId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"photos": [{"documentId": "%s", "position": 0, "isCover": true}]}
                                """.formatted(docId)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/owner/properties/{propertyId}/submit", propertyId)
                        .with(jwt().jwt(j -> j.subject(userId.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING_REVIEW"));

        return propertyId;
    }

    private void assertAuditCount(UUID actorId, String action, String entityId, int expected) {
        Integer count = jdbc.queryForObject(
                "SELECT count(*) FROM audit.audit_log WHERE actor_id = ? AND action = ? AND entity_id = ?",
                Integer.class,
                actorId, action, entityId
        );
        assertThat(count).isEqualTo(expected);
    }

    private void assertNotificationCount(UUID recipientUserId, String eventType, int minExpected) {
        Integer count = jdbc.queryForObject(
                "SELECT count(*) FROM notification.notification WHERE user_id = ? AND event_type = ?",
                Integer.class,
                recipientUserId, eventType
        );
        assertThat(count).isGreaterThanOrEqualTo(minExpected);
    }

    private void seedUser(UUID userId, String email, String roleCode, String fullName) {
        UUID roleId = jdbc.queryForObject(
                "SELECT id FROM identity.role WHERE code = ?",
                UUID.class,
                roleCode
        );
        jdbc.update(
                """
                INSERT INTO identity.user_account (id, email, role_id, status, created_at, updated_at)
                VALUES (?, ?, ?, 'ACTIVE', now(), now())
                """,
                userId, email, roleId
        );
        jdbc.update(
                """
                INSERT INTO identity.user_profile (user_id, full_name, updated_at)
                VALUES (?, ?, now())
                """,
                userId, fullName
        );
    }

    private void seedOrg(UUID orgId, UUID ownerUserId, String name) {
        jdbc.update(
                """
                INSERT INTO organization.organization
                    (id, name, display_name, contact_email, verification_status, created_at, updated_at)
                VALUES (?, ?, ?, ?, 'NOT_SUBMITTED', now(), now())
                """,
                orgId, name, name, "org-" + orgId + "@findstay.gh"
        );
        jdbc.update(
                """
                INSERT INTO organization.membership
                    (id, organization_id, user_id, role, is_primary_owner, joined_at)
                VALUES (?, ?, ?, 'OWNER', true, now())
                """,
                UUID.randomUUID(), orgId, ownerUserId
        );
    }

    private void seedStaffMembership(UUID orgId, UUID staffUserId) {
        jdbc.update(
                """
                INSERT INTO organization.membership
                    (id, organization_id, user_id, role, is_primary_owner, joined_at)
                VALUES (?, ?, ?, 'STAFF', false, now())
                """,
                UUID.randomUUID(), orgId, staffUserId
        );
    }
}
