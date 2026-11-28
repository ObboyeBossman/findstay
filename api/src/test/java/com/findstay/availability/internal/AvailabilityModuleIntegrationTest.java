package com.findstay.availability.internal;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.findstay.availability.api.AvailabilityGate;
import com.findstay.shared.time.GhanaTime;
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

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Full-stack PostgreSQL verification for Story {@code S1-14} ({@code T2}, {@code T3}, {@code T5}):
 * month calendar read, owner block/unblock lifecycle, adjacent half-open ranges, concurrent
 * overlapping block exclusion via PostgreSQL {@code btree_gist}, {@link AvailabilityGate} seam,
 * and cross-org / staff per-property isolation.
 */
@Req("FR-18")
@AutoConfigureMockMvc
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class AvailabilityModuleIntegrationTest extends AbstractIntegrationTest {

    private static final UUID SUITE_TYPE_ID = UUID.fromString("01a1e6cd-a800-7004-bf00-000000000004");
    private static final UUID NIGHTLY_PERIOD_ID = UUID.fromString("01a1e6cd-a800-7015-bf00-000000000015");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AvailabilityGate availabilityGate;

    private UUID ownerAId;
    private UUID orgAId;
    private UUID staffAId;
    private UUID ownerBId;
    private UUID orgBId;
    private UUID guestId;
    private UUID propertyAId;
    private UUID unitA1Id;
    private UUID unitA2Id;

    @BeforeEach
    void setUp() {
        ownerAId = UUID.randomUUID();
        orgAId = UUID.randomUUID();
        staffAId = UUID.randomUUID();
        ownerBId = UUID.randomUUID();
        orgBId = UUID.randomUUID();
        guestId = UUID.randomUUID();
        propertyAId = UUID.randomUUID();
        unitA1Id = UUID.randomUUID();
        unitA2Id = UUID.randomUUID();

        seedUser(ownerAId, "avail-owner-a-" + ownerAId + "@findstay.gh", "OWNER");
        seedOrg(orgAId, ownerAId, "Beach Road Suites");

        seedUser(staffAId, "avail-staff-a-" + staffAId + "@findstay.gh", "STAFF");
        seedStaffMembership(orgAId, staffAId);

        seedUser(ownerBId, "avail-owner-b-" + ownerBId + "@findstay.gh", "OWNER");
        seedOrg(orgBId, ownerBId, "Chapel Hill Lodge");

        seedUser(guestId, "avail-guest-" + guestId + "@findstay.gh", "GUEST");

        seedPropertyAndUnit(propertyAId, orgAId, unitA1Id, "Ocean Deluxe Room", 45000L);
        seedUnitOnly(propertyAId, unitA2Id, "Garden Studio", 32000L);
    }

    @Test
    @Req("FR-18")
    void ownerCanReadMonthCalendarBlockAdjacentRangesCheckGateAndUnblock() throws Exception {
        // 1. Initial month calendar for 2026-12 has 31 AVAILABLE days
        mockMvc.perform(get("/api/v1/owner/units/{unitId}/availability", unitA1Id)
                        .param("month", "2026-12")
                        .with(jwt().jwt(j -> j.subject(ownerAId.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.unitId").value(unitA1Id.toString()))
                .andExpect(jsonPath("$.month").value("2026-12"))
                .andExpect(jsonPath("$.days.length()").value(31))
                .andExpect(jsonPath("$.days[0].state").value("AVAILABLE"))
                .andExpect(jsonPath("$.blocks.length()").value(0));

        // 2. Create block [2026-12-05, 2026-12-10)
        MvcResult create1 = mockMvc.perform(post("/api/v1/owner/units/{unitId}/blocks", unitA1Id)
                        .with(jwt().jwt(j -> j.subject(ownerAId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "startDate": "2026-12-05",
                                  "endDate": "2026-12-10",
                                  "reason": "OWNER_BLOCK"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.startDate").value("2026-12-05"))
                .andExpect(jsonPath("$.endDate").value("2026-12-10"))
                .andExpect(jsonPath("$.reason").value("OWNER_BLOCK"))
                .andReturn();
        UUID block1Id = UUID.fromString(
                objectMapper.readTree(create1.getResponse().getContentAsString()).get("id").asText()
        );

        // 3. Adjacent back-to-back block [2026-12-10, 2026-12-12) succeeds (half-open tstzrange)
        mockMvc.perform(post("/api/v1/owner/units/{unitId}/blocks", unitA1Id)
                        .with(jwt().jwt(j -> j.subject(ownerAId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "startDate": "2026-12-10",
                                  "endDate": "2026-12-12"
                                }
                                """))
                .andExpect(status().isCreated());

        // 4. Overlapping block [2026-12-08, 2026-12-11) rejected by PostgreSQL btree_gist as 409 CONFLICT
        mockMvc.perform(post("/api/v1/owner/units/{unitId}/blocks", unitA1Id)
                        .with(jwt().jwt(j -> j.subject(ownerAId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "startDate": "2026-12-08",
                                  "endDate": "2026-12-11"
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("CONFLICT"));

        // 5. Same dates on a DIFFERENT unit (unitA2Id) are allowed
        mockMvc.perform(post("/api/v1/owner/units/{unitId}/blocks", unitA2Id)
                        .with(jwt().jwt(j -> j.subject(ownerAId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "startDate": "2026-12-05",
                                  "endDate": "2026-12-10"
                                }
                                """))
                .andExpect(status().isCreated());

        // 6. Calendar read reflects Dec 5..11 blocked and Dec 12 available (also test /calendar alias)
        mockMvc.perform(get("/api/v1/owner/units/{unitId}/calendar", unitA1Id)
                        .param("month", "2026-12")
                        .with(jwt().jwt(j -> j.subject(ownerAId.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.blocks.length()").value(2))
                .andExpect(jsonPath("$.days[3].state").value("AVAILABLE"))      // Dec 4
                .andExpect(jsonPath("$.days[4].state").value("OWNER_BLOCKED"))  // Dec 5
                .andExpect(jsonPath("$.days[9].state").value("OWNER_BLOCKED"))  // Dec 10
                .andExpect(jsonPath("$.days[11].state").value("AVAILABLE"));    // Dec 12

        // 7. AvailabilityGate public seam reflects blocked vs open windows
        Instant dec6 = GhanaTime.startOfDay(LocalDate.of(2026, 12, 6));
        Instant dec8 = GhanaTime.startOfDay(LocalDate.of(2026, 12, 8));
        Instant dec20 = GhanaTime.startOfDay(LocalDate.of(2026, 12, 20));
        Instant dec22 = GhanaTime.startOfDay(LocalDate.of(2026, 12, 22));

        assertThat(availabilityGate.isUnitAvailable(unitA1Id, dec6, dec8)).isFalse();
        assertThat(availabilityGate.isUnitAvailable(unitA1Id, dec20, dec22)).isTrue();
        Set<UUID> blockedIds = availabilityGate.findBlockedUnitIds(List.of(unitA1Id, unitA2Id), dec6, dec8);
        assertThat(blockedIds).containsExactlyInAnyOrder(unitA1Id, unitA2Id);

        // 8. Delete block 1 -> Dec 5..9 becomes AVAILABLE again
        mockMvc.perform(delete("/api/v1/owner/units/{unitId}/blocks/{blockId}", unitA1Id, block1Id)
                        .with(jwt().jwt(j -> j.subject(ownerAId.toString()))))
                .andExpect(status().isNoContent());

        assertThat(availabilityGate.isUnitAvailable(unitA1Id, dec6, dec8)).isTrue();
    }

    @Test
    @Req("FR-39")
    void rejectsInvalidRangesAndUnsupportedReasons() throws Exception {
        // startDate == endDate -> 400 VALIDATION_FAILED
        mockMvc.perform(post("/api/v1/owner/units/{unitId}/blocks", unitA1Id)
                        .with(jwt().jwt(j -> j.subject(ownerAId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "startDate": "2026-12-15",
                                  "endDate": "2026-12-15"
                                }
                                """))
                .andExpect(status().isBadRequest());

        // endDate before startDate -> 400 VALIDATION_FAILED
        mockMvc.perform(post("/api/v1/owner/units/{unitId}/blocks", unitA1Id)
                        .with(jwt().jwt(j -> j.subject(ownerAId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "startDate": "2026-12-20",
                                  "endDate": "2026-12-18"
                                }
                                """))
                .andExpect(status().isBadRequest());

        // Sprint 2 reason BOOKING not allowed in Sprint 1 -> 400 VALIDATION_FAILED
        mockMvc.perform(post("/api/v1/owner/units/{unitId}/blocks", unitA1Id)
                        .with(jwt().jwt(j -> j.subject(ownerAId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "startDate": "2026-12-15",
                                  "endDate": "2026-12-18",
                                  "reason": "BOOKING"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    @Req("FR-39")
    void concurrentOverlappingBlockRequestsYieldExactlyOneSuccessAndOneConflict() throws Exception {
        ExecutorService executor = Executors.newFixedThreadPool(2);
        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch startGate = new CountDownLatch(1);

        try {
            Future<Integer> call1 = executor.submit(() -> {
                ready.countDown();
                startGate.await(5, TimeUnit.SECONDS);
                return mockMvc.perform(post("/api/v1/owner/units/{unitId}/blocks", unitA1Id)
                                .with(jwt().jwt(j -> j.subject(ownerAId.toString())))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {
                                          "startDate": "2027-01-10",
                                          "endDate": "2027-01-15"
                                        }
                                        """))
                        .andReturn()
                        .getResponse()
                        .getStatus();
            });

            Future<Integer> call2 = executor.submit(() -> {
                ready.countDown();
                startGate.await(5, TimeUnit.SECONDS);
                return mockMvc.perform(post("/api/v1/owner/units/{unitId}/blocks", unitA1Id)
                                .with(jwt().jwt(j -> j.subject(ownerAId.toString())))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {
                                          "startDate": "2027-01-12",
                                          "endDate": "2027-01-18"
                                        }
                                        """))
                        .andReturn()
                        .getResponse()
                        .getStatus();
            });

            assertThat(ready.await(5, TimeUnit.SECONDS)).isTrue();
            startGate.countDown();

            List<Integer> statuses = List.of(
                    call1.get(15, TimeUnit.SECONDS),
                    call2.get(15, TimeUnit.SECONDS)
            );
            assertThat(statuses).containsExactlyInAnyOrder(201, 409);

            Integer persistedCount = jdbc.queryForObject(
                    "SELECT count(*) FROM availability.availability_block WHERE unit_id = ?",
                    Integer.class,
                    unitA1Id
            );
            assertThat(persistedCount).isEqualTo(1);
        } finally {
            executor.shutdownNow();
        }
    }

    @Test
    @Req("UR-O03")
    void enforcesCrossOrgIsolationGuestBlockingAndStaffPerPropertyAccess() throws Exception {
        // Owner B receives 404 NOT_FOUND on Owner A's unit
        mockMvc.perform(get("/api/v1/owner/units/{unitId}/availability", unitA1Id)
                        .param("month", "2026-12")
                        .with(jwt().jwt(j -> j.subject(ownerBId.toString()))))
                .andExpect(status().isNotFound());

        mockMvc.perform(post("/api/v1/owner/units/{unitId}/blocks", unitA1Id)
                        .with(jwt().jwt(j -> j.subject(ownerBId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"startDate": "2026-12-01", "endDate": "2026-12-03"}
                                """))
                .andExpect(status().isNotFound());

        // Guest blocked by availability.read permission (403)
        mockMvc.perform(get("/api/v1/owner/units/{unitId}/availability", unitA1Id)
                        .param("month", "2026-12")
                        .with(jwt().jwt(j -> j.subject(guestId.toString()))))
                .andExpect(status().isForbidden());

        // Staff A without property grant receives 403
        mockMvc.perform(get("/api/v1/owner/units/{unitId}/availability", unitA1Id)
                        .param("month", "2026-12")
                        .with(jwt().jwt(j -> j.subject(staffAId.toString()))))
                .andExpect(status().isForbidden());

        // Grant Staff A access to Property A -> can view calendar & create/delete blocks
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

        MvcResult staffBlock = mockMvc.perform(post("/api/v1/owner/units/{unitId}/blocks", unitA1Id)
                        .with(jwt().jwt(j -> j.subject(staffAId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"startDate": "2026-12-22", "endDate": "2026-12-25"}
                                """))
                .andExpect(status().isCreated())
                .andReturn();
        UUID staffBlockId = UUID.fromString(
                objectMapper.readTree(staffBlock.getResponse().getContentAsString()).get("id").asText()
        );

        mockMvc.perform(delete("/api/v1/owner/units/{unitId}/blocks/{blockId}", unitA1Id, staffBlockId)
                        .with(jwt().jwt(j -> j.subject(staffAId.toString()))))
                .andExpect(status().isNoContent());
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
                userId, "Availability Test " + roleCode
        );
    }

    private void seedOrg(UUID orgId, UUID ownerUserId, String name) {
        jdbc.update(
                """
                INSERT INTO organization.organization
                    (id, name, display_name, contact_email, verification_status, created_at, updated_at)
                VALUES (?, ?, ?, ?, 'APPROVED', now(), now())
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

    private void seedPropertyAndUnit(UUID propertyId, UUID orgId, UUID unitId, String unitName, long ratePesewas) {
        jdbc.update(
                """
                INSERT INTO listing.property
                    (id, organization_id, name, accommodation_type_id, town, status, created_at, updated_at)
                VALUES (?, ?, 'Takoradi Test Property', ?, 'Takoradi', 'ACTIVE', now(), now())
                """,
                propertyId, orgId, SUITE_TYPE_ID
        );
        seedUnitOnly(propertyId, unitId, unitName, ratePesewas);
    }

    private void seedUnitOnly(UUID propertyId, UUID unitId, String unitName, long ratePesewas) {
        jdbc.update(
                """
                INSERT INTO listing.unit (id, property_id, name, max_guests, quantity, created_at, updated_at)
                VALUES (?, ?, ?, 2, 1, now(), now())
                """,
                unitId, propertyId, unitName
        );
        jdbc.update(
                """
                INSERT INTO listing.rate_plan (id, unit_id, billing_period_id, rate_pesewas, currency, created_at, updated_at)
                VALUES (?, ?, ?, ?, 'GHS', now(), now())
                """,
                UUID.randomUUID(), unitId, NIGHTLY_PERIOD_ID, ratePesewas
        );
    }
}
