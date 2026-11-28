package com.findstay.listing.internal;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.findstay.listing.api.CatalogQuery;
import com.findstay.listing.api.ListingModerationApi;
import com.findstay.listing.api.PropertyStatus;
import com.findstay.listing.api.PublicListingProjection;
import com.findstay.listing.api.UnitSummaryView;
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

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Full-stack PostgreSQL verification for Story {@code S1-13} ({@code T2}, {@code T3}, {@code T4},
 * {@code T6}): Takoradi reference lookup, verified-owner gate, incomplete-draft submission guard,
 * exact integer GHS pesewa storage, photo ordering/cover, review lock, pause/resume,
 * {@link CatalogQuery} seam, and cross-org / staff isolation.
 */
@Req("FR-11")
@AutoConfigureMockMvc
class ListingModuleIntegrationTest extends AbstractIntegrationTest {

    private static final UUID BEACH_ROAD_AREA_ID = UUID.fromString("01a1e6cd-a818-7001-bf00-000000000001");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CatalogQuery catalogQuery;

    @Autowired
    private ListingModerationApi listingModerationApi;

    private UUID verifiedOwnerAId;
    private UUID orgAId;
    private UUID staffAId;
    private UUID unverifiedOwnerId;
    private UUID unverifiedOrgId;
    private UUID verifiedOwnerBId;
    private UUID orgBId;
    private UUID guestId;
    private UUID adminId;

    @BeforeEach
    void setUp() {
        verifiedOwnerAId = UUID.randomUUID();
        orgAId = UUID.randomUUID();
        staffAId = UUID.randomUUID();
        unverifiedOwnerId = UUID.randomUUID();
        unverifiedOrgId = UUID.randomUUID();
        verifiedOwnerBId = UUID.randomUUID();
        orgBId = UUID.randomUUID();
        guestId = UUID.randomUUID();
        adminId = UUID.randomUUID();

        seedUser(verifiedOwnerAId, "list-owner-a-" + verifiedOwnerAId + "@findstay.gh", "OWNER");
        seedOrg(orgAId, verifiedOwnerAId, "Takoradi Coastal Suites", "APPROVED");

        seedUser(staffAId, "list-staff-a-" + staffAId + "@findstay.gh", "STAFF");
        seedStaffMembership(orgAId, staffAId);

        seedUser(unverifiedOwnerId, "list-unverified-" + unverifiedOwnerId + "@findstay.gh", "OWNER");
        seedOrg(unverifiedOrgId, unverifiedOwnerId, "Pending Guest Lodge", "NOT_SUBMITTED");

        seedUser(verifiedOwnerBId, "list-owner-b-" + verifiedOwnerBId + "@findstay.gh", "OWNER");
        seedOrg(orgBId, verifiedOwnerBId, "Chapel Hill Villas", "APPROVED");

        seedUser(guestId, "list-guest-" + guestId + "@findstay.gh", "GUEST");
        seedUser(adminId, "list-admin-" + adminId + "@findstay.gh", "ADMIN");
    }

    @Test
    @Req("FR-11")
    void catalogReferenceEndpointReturnsSeededActiveTakoradiOptionsAnonymously() throws Exception {
        mockMvc.perform(get("/api/v1/catalog/reference"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accommodationTypes.length()").value(7))
                .andExpect(jsonPath("$.areas.length()").value(12))
                .andExpect(jsonPath("$.amenities.length()").value(13))
                .andExpect(jsonPath("$.amenities[0].code").value("WIFI"))
                .andExpect(jsonPath("$.billingPeriods.length()").value(1))
                .andExpect(jsonPath("$.billingPeriods[0].code").value("NIGHTLY"));
    }

    @Test
    @Req("BR-02")
    void unverifiedOwnerAndGuestCannotCreateProperties() throws Exception {
        String createBody = """
                {
                  "name": "Unverified Beach House",
                  "accommodationTypeCode": "ENTIRE_HOUSE",
                  "town": "Takoradi"
                }
                """;

        // Unverified owner blocked by BR-02 gate
        mockMvc.perform(post("/api/v1/owner/properties")
                        .with(jwt().jwt(j -> j.subject(unverifiedOwnerId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createBody))
                .andExpect(status().isForbidden());

        // Guest blocked by listing.write permission
        mockMvc.perform(post("/api/v1/owner/properties")
                        .with(jwt().jwt(j -> j.subject(guestId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createBody))
                .andExpect(status().isForbidden());
    }

    @Test
    @Req("FR-16")
    void fullPropertyLifecycleEnforcesValidationPesewasReviewLockPauseResumeAndCatalogQuery() throws Exception {
        // 1. Create minimal DRAFT property as verified Owner A
        String createBody = """
                {
                  "name": "Atlantic Breeze Residence",
                  "accommodationTypeCode": "SUITE",
                  "town": "Takoradi"
                }
                """;
        MvcResult createRes = mockMvc.perform(post("/api/v1/owner/properties")
                        .with(jwt().jwt(j -> j.subject(verifiedOwnerAId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andExpect(jsonPath("$.missingForSubmission.length()").value(6))
                .andReturn();

        UUID propertyId = UUID.fromString(
                objectMapper.readTree(createRes.getResponse().getContentAsString()).get("id").asText()
        );

        // 2. Attempting to submit incomplete draft is blocked (422 BUSINESS_RULE_VIOLATION)
        mockMvc.perform(post("/api/v1/owner/properties/{propertyId}/submit", propertyId)
                        .with(jwt().jwt(j -> j.subject(verifiedOwnerAId.toString()))))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.code").value("BUSINESS_RULE_VIOLATION"))
                .andExpect(jsonPath("$.details.length()").value(6));

        // 3. Complete property details, Takoradi area, amenities, and house rules
        String updateBody = """
                {
                  "areaId": "%s",
                  "address": "14 Beach Road, opposite Atlantic Hotel",
                  "latitude": 4.888420,
                  "longitude": -1.755360,
                  "description": "Calm ocean-view suites with reliable solar backup and fast fibre Wi-Fi.",
                  "houseRules": "Check-in from 14:00, check-out by 11:00. No indoor smoking.",
                  "amenityCodes": ["WIFI", "AIR_CONDITIONING", "BACKUP_POWER"]
                }
                """.formatted(BEACH_ROAD_AREA_ID);

        mockMvc.perform(patch("/api/v1/owner/properties/{propertyId}", propertyId)
                        .with(jwt().jwt(j -> j.subject(verifiedOwnerAId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.areaName").value("Beach Road"))
                .andExpect(jsonPath("$.amenityCodes.length()").value(3))
                .andExpect(jsonPath("$.missingForSubmission.length()").value(2));

        // 4. Add two units with exact integer GHS pesewas (450.50 GHS = 45050, 825.00 GHS = 82500)
        MvcResult unit1Res = mockMvc.perform(post("/api/v1/owner/properties/{propertyId}/units", propertyId)
                        .with(jwt().jwt(j -> j.subject(verifiedOwnerAId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Ocean View Room",
                                  "category": "Deluxe",
                                  "maxGuests": 2,
                                  "quantity": 3,
                                  "nightlyRatePesewas": 45050
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nightlyRatePesewas").value(45050))
                .andExpect(jsonPath("$.currency").value("GHS"))
                .andReturn();
        UUID unit1Id = UUID.fromString(
                objectMapper.readTree(unit1Res.getResponse().getContentAsString()).get("id").asText()
        );

        MvcResult unit2Res = mockMvc.perform(post("/api/v1/owner/properties/{propertyId}/units", propertyId)
                        .with(jwt().jwt(j -> j.subject(verifiedOwnerAId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Harbour Family Suite",
                                  "category": "Suite",
                                  "maxGuests": 4,
                                  "quantity": 1,
                                  "nightlyRatePesewas": 82500
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nightlyRatePesewas").value(82500))
                .andReturn();
        UUID unit2Id = UUID.fromString(
                objectMapper.readTree(unit2Res.getResponse().getContentAsString()).get("id").asText()
        );

        // Verify exact BIGINT pesewa storage in PostgreSQL listing.rate_plan
        Long storedUnit1Pesewas = jdbc.queryForObject(
                "SELECT rate_pesewas FROM listing.rate_plan WHERE unit_id = ?",
                Long.class,
                unit1Id
        );
        String storedCurrency = jdbc.queryForObject(
                "SELECT trim(currency) FROM listing.rate_plan WHERE unit_id = ?",
                String.class,
                unit1Id
        );
        assertThat(storedUnit1Pesewas).isEqualTo(45050L);
        assertThat(storedCurrency).isEqualTo("GHS");

        // Update unit 1 rate to 420.75 GHS (42075 pesewas)
        mockMvc.perform(patch("/api/v1/owner/properties/{propertyId}/units/{unitId}", propertyId, unit1Id)
                        .with(jwt().jwt(j -> j.subject(verifiedOwnerAId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "nightlyRatePesewas": 42075
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nightlyRatePesewas").value(42075));

        Long updatedPesewas = jdbc.queryForObject(
                "SELECT rate_pesewas FROM listing.rate_plan WHERE unit_id = ?",
                Long.class,
                unit1Id
        );
        assertThat(updatedPesewas).isEqualTo(42075L);

        // 5. Upload and attach 2 WebP photos via media API, then reorder & pick cover
        UploadedPhoto photo1 = uploadAndPromotePhoto(verifiedOwnerAId, propertyId, "lobby.webp");
        UploadedPhoto photo2 = uploadAndPromotePhoto(verifiedOwnerAId, propertyId, "terrace.webp");

        mockMvc.perform(put("/api/v1/owner/properties/{propertyId}/photos", propertyId)
                        .with(jwt().jwt(j -> j.subject(verifiedOwnerAId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "photos": [
                                    {"documentId": "%s", "position": 1, "isCover": false},
                                    {"documentId": "%s", "position": 0, "isCover": true}
                                  ]
                                }
                                """.formatted(photo1.documentId(), photo2.documentId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].documentId").value(photo2.documentId().toString()))
                .andExpect(jsonPath("$[0].isCover").value(true))
                .andExpect(jsonPath("$[1].isCover").value(false));

        // 6. Owner preview shows lowest nightly price (42075), Verified Owner badge, units & photos
        mockMvc.perform(get("/api/v1/owner/properties/{propertyId}/preview", propertyId)
                        .with(jwt().jwt(j -> j.subject(verifiedOwnerAId.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fromPricePesewas").value(42075))
                .andExpect(jsonPath("$.ownerVerified").value(true))
                .andExpect(jsonPath("$.units.length()").value(2))
                .andExpect(jsonPath("$.photos.length()").value(2));

        // 7. Submit complete listing -> PENDING_REVIEW
        mockMvc.perform(post("/api/v1/owner/properties/{propertyId}/submit", propertyId)
                        .with(jwt().jwt(j -> j.subject(verifiedOwnerAId.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PENDING_REVIEW"))
                .andExpect(jsonPath("$.missingForSubmission.length()").value(0));

        // Editing while PENDING_REVIEW is locked (409 CONFLICT)
        mockMvc.perform(patch("/api/v1/owner/properties/{propertyId}", propertyId)
                        .with(jwt().jwt(j -> j.subject(verifiedOwnerAId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name": "Sneaky Edit While Under Review"}
                                """))
                .andExpect(status().isConflict());

        // Not yet visible on public endpoint before approval
        mockMvc.perform(get("/api/v1/properties/{propertyId}", propertyId))
                .andExpect(status().isNotFound());

        // 8. Admin approves via ListingModerationApi -> ACTIVE + public projection populated
        listingModerationApi.approveAndPublish(propertyId, adminId, "Photos and pricing verified");

        List<PublicListingProjection> activeListings = catalogQuery.listActiveListings(
                "Takoradi", "Beach Road", 40000L, 50000L
        );
        assertThat(activeListings).hasSize(1);
        assertThat(activeListings.getFirst().propertyId()).isEqualTo(propertyId);
        assertThat(activeListings.getFirst().fromPricePesewas()).isEqualTo(42075L);
        assertThat(activeListings.getFirst().ownerVerified()).isTrue();

        UnitSummaryView unitSummary = catalogQuery.findUnitById(unit2Id).orElseThrow();
        assertThat(unitSummary.organizationId()).isEqualTo(orgAId);
        assertThat(unitSummary.nightlyRatePesewas()).isEqualTo(82500L);

        // Public anonymous endpoints return published listing
        mockMvc.perform(get("/api/v1/properties/{propertyId}", propertyId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Atlantic Breeze Residence"))
                .andExpect(jsonPath("$.fromPricePesewas").value(42075))
                .andExpect(jsonPath("$.ownerVerified").value(true));

        // 9. Pause listing -> hidden from CatalogQuery & public API
        mockMvc.perform(post("/api/v1/owner/properties/{propertyId}/pause", propertyId)
                        .with(jwt().jwt(j -> j.subject(verifiedOwnerAId.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PAUSED"));

        assertThat(catalogQuery.findActiveListingByPropertyId(propertyId)).isEmpty();
        mockMvc.perform(get("/api/v1/properties/{propertyId}", propertyId))
                .andExpect(status().isNotFound());

        // 10. Resume listing -> visible again
        mockMvc.perform(post("/api/v1/owner/properties/{propertyId}/resume", propertyId)
                        .with(jwt().jwt(j -> j.subject(verifiedOwnerAId.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"));

        assertThat(catalogQuery.findActiveListingByPropertyId(propertyId)).isPresent();

        // 11. Remove one photo and one unit cleanly
        mockMvc.perform(delete("/api/v1/owner/properties/{propertyId}/photos/{docId}", propertyId, photo2.documentId())
                        .with(jwt().jwt(j -> j.subject(verifiedOwnerAId.toString()))))
                .andExpect(status().isNoContent());

        mockMvc.perform(delete("/api/v1/owner/properties/{propertyId}/units/{unitId}", propertyId, unit2Id)
                        .with(jwt().jwt(j -> j.subject(verifiedOwnerAId.toString()))))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/owner/properties/{propertyId}", propertyId)
                        .with(jwt().jwt(j -> j.subject(verifiedOwnerAId.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.units.length()").value(1))
                .andExpect(jsonPath("$.photos.length()").value(1))
                .andExpect(jsonPath("$.photos[0].isCover").value(true));
    }

    @Test
    @Req("BRL-04")
    void enforcesCrossOrgIsolationAndStaffPerPropertyAccess() throws Exception {
        // Owner A creates a property
        MvcResult createRes = mockMvc.perform(post("/api/v1/owner/properties")
                        .with(jwt().jwt(j -> j.subject(verifiedOwnerAId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Sekondi Harbour Villa",
                                  "accommodationTypeCode": "ENTIRE_HOUSE",
                                  "town": "Takoradi"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn();
        UUID propertyAId = UUID.fromString(
                objectMapper.readTree(createRes.getResponse().getContentAsString()).get("id").asText()
        );

        // Verified Owner B gets 404 on Owner A's property (no cross-tenant leakage)
        mockMvc.perform(get("/api/v1/owner/properties/{propertyId}", propertyAId)
                        .with(jwt().jwt(j -> j.subject(verifiedOwnerBId.toString()))))
                .andExpect(status().isNotFound());

        mockMvc.perform(patch("/api/v1/owner/properties/{propertyId}", propertyAId)
                        .with(jwt().jwt(j -> j.subject(verifiedOwnerBId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name": "Hijacked Name"}
                                """))
                .andExpect(status().isNotFound());

        // Staff A without property grant cannot see or edit Property A
        mockMvc.perform(get("/api/v1/owner/properties")
                        .with(jwt().jwt(j -> j.subject(staffAId.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        mockMvc.perform(get("/api/v1/owner/properties/{propertyId}", propertyAId)
                        .with(jwt().jwt(j -> j.subject(staffAId.toString()))))
                .andExpect(status().isForbidden());

        // Grant Staff A access to Property A -> now readable and editable
        UUID membershipId = jdbc.queryForObject(
                "SELECT id FROM organization.membership WHERE organization_id = ? AND user_id = ?",
                UUID.class,
                orgAId,
                staffAId
        );
        jdbc.update(
                "INSERT INTO organization.membership_permission (membership_id, property_id) VALUES (?, ?)",
                membershipId,
                propertyAId
        );

        mockMvc.perform(get("/api/v1/owner/properties")
                        .with(jwt().jwt(j -> j.subject(staffAId.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(propertyAId.toString()));

        mockMvc.perform(patch("/api/v1/owner/properties/{propertyId}", propertyAId)
                        .with(jwt().jwt(j -> j.subject(staffAId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"description": "Updated by authorised property staff."}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("Updated by authorised property staff."));
    }

    private UploadedPhoto uploadAndPromotePhoto(UUID ownerUserId, UUID propertyId, String filename) throws Exception {
        MvcResult presignRes = mockMvc.perform(post("/api/v1/owner/media/presign")
                        .with(jwt().jwt(j -> j.subject(ownerUserId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "ownerType": "PROPERTY_PHOTO",
                                  "ownerId": "%s",
                                  "filename": "%s",
                                  "contentType": "image/webp",
                                  "sizeBytes": 185000
                                }
                                """.formatted(propertyId, filename)))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode json = objectMapper.readTree(presignRes.getResponse().getContentAsString());
        UUID assetId = UUID.fromString(json.get("assetId").asText());
        UUID documentId = UUID.fromString(json.get("documentId").asText());

        mockMvc.perform(post("/api/v1/owner/media/{assetId}/confirm", assetId)
                        .with(jwt().jwt(j -> j.subject(ownerUserId.toString()))))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/owner/media/{assetId}/promote-webp", assetId)
                        .with(jwt().jwt(j -> j.subject(ownerUserId.toString()))))
                .andExpect(status().isOk());

        return new UploadedPhoto(assetId, documentId);
    }

    private void seedUser(UUID userId, String email, String roleCode) {
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
                userId, "Test " + roleCode
        );
    }

    private void seedOrg(UUID orgId, UUID ownerUserId, String name, String verificationStatus) {
        jdbc.update(
                """
                INSERT INTO organization.organization
                    (id, name, display_name, contact_email, verification_status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, now(), now())
                """,
                orgId, name, name, "org-" + orgId + "@findstay.gh", verificationStatus
        );
        jdbc.update(
                """
                INSERT INTO organization.membership
                    (id, organization_id, user_id, role, is_primary_owner, joined_at)
                VALUES (?, ?, ?, 'OWNER', true, now())
                """,
                UUID.randomUUID(), orgId, ownerUserId
        );
        if ("APPROVED".equals(verificationStatus)) {
            jdbc.update(
                    """
                    INSERT INTO verification.verification_case
                        (id, organization_id, status, ghana_card_number_encrypted, submitted_at, decided_at, created_at, updated_at)
                    VALUES (?, ?, 'APPROVED', ?, now(), now(), now(), now())
                    """,
                    UUID.randomUUID(), orgId, new byte[]{1, 2, 3, 4}
            );
        }
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

    private record UploadedPhoto(UUID assetId, UUID documentId) {
    }
}
