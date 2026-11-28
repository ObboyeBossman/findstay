package com.findstay.organization;

import com.findstay.organization.api.OrganizationAccessApi;
import com.findstay.organization.api.OrganizationSummary;
import com.findstay.shared.error.AppException;
import com.findstay.shared.error.ErrorCode;
import com.findstay.shared.security.OrgMembership;
import com.findstay.shared.security.OrgRole;
import com.findstay.shared.security.OrgScope;
import com.findstay.testing.AbstractIntegrationTest;
import com.findstay.testing.Req;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Proves {@code S1-07-T3} (#69) and {@code S1-07-T5} (#70) against real PostgreSQL:
 * idempotent owner organisation auto-creation, {@code GET/PATCH /api/v1/owner/org},
 * and {@link OrgScope} cross-company isolation + staff per-property permissions.
 */
@Req("S1-07-AC1")
@AutoConfigureMockMvc
class OrganizationAndOrgScopeIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private OrganizationAccessApi organizationAccess;

    @Autowired
    private OrgScope orgScope;

    @Test
    void onboardingAutoCreatesOwnerOrganizationIdempotentlyAndExposesGetAndPatch() throws Exception {
        UUID ownerId = UUID.randomUUID();

        // 1. Provision with owner metadata -> auto-creates 1 org + 1 primary OWNER membership.
        mockMvc.perform(post("/api/v1/auth/provision")
                        .with(jwt().jwt(builder -> builder
                                .subject(ownerId.toString())
                                .claim("email", "owner.kofi@example.com")
                                .claim("user_metadata", Map.of(
                                        "full_name", "Kofi Mensah",
                                        "phone", "+233241112233",
                                        "role", "OWNER")))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.memberships.length()").value(1))
                .andExpect(jsonPath("$.memberships[0].role").value("OWNER"))
                .andExpect(jsonPath("$.activeOrganizationId").isNotEmpty());

        // 2. Repeating onboarding via POST /api/v1/owner/org must be idempotent (no duplicate rows).
        mockMvc.perform(post("/api/v1/owner/org")
                        .with(jwt().jwt(builder -> builder
                                .subject(ownerId.toString())
                                .claim("email", "owner.kofi@example.com"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Kofi Mensah Properties"))
                .andExpect(jsonPath("$.verificationStatus").value("NOT_SUBMITTED"));

        Integer membershipCount = jdbc.queryForObject(
                "SELECT count(*) FROM organization.membership WHERE user_id = ?",
                Integer.class, ownerId);
        assertThat(membershipCount).isEqualTo(1);

        // 3. GET /api/v1/owner/org returns the owner's company profile.
        mockMvc.perform(get("/api/v1/owner/org")
                        .with(jwt().jwt(builder -> builder
                                .subject(ownerId.toString())
                                .claim("email", "owner.kofi@example.com"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.displayName").value("Kofi Mensah Properties"))
                .andExpect(jsonPath("$.contactEmail").value("owner.kofi@example.com"))
                .andExpect(jsonPath("$.contactPhone").value("+233241112233"));

        // 4. PATCH /api/v1/owner/org updates allowed fields.
        mockMvc.perform(patch("/api/v1/owner/org")
                        .with(jwt().jwt(builder -> builder
                                .subject(ownerId.toString())
                                .claim("email", "owner.kofi@example.com")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Takoradi Harbour Hospitality Ltd",
                                  "displayName": "Harbour View Lodges",
                                  "contactEmail": "bookings@harbourview.gh",
                                  "contactPhone": "+233501234567"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Takoradi Harbour Hospitality Ltd"))
                .andExpect(jsonPath("$.displayName").value("Harbour View Lodges"))
                .andExpect(jsonPath("$.contactEmail").value("bookings@harbourview.gh"))
                .andExpect(jsonPath("$.contactPhone").value("+233501234567"));

        // 5. Invalid phone returns 400 VALIDATION_FAILED.
        mockMvc.perform(patch("/api/v1/owner/org")
                        .with(jwt().jwt(builder -> builder
                                .subject(ownerId.toString())
                                .claim("email", "owner.kofi@example.com")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "contactPhone": "024-INVALID"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));
    }

    @Test
    void orgScopeEnforcesCrossOrganizationIsolationAndStaffPropertyPermissions() throws Exception {
        UUID guestWithNoOrg = UUID.randomUUID();
        UUID ownerA = UUID.randomUUID();
        UUID ownerB = UUID.randomUUID();
        UUID staffA = UUID.randomUUID();

        // 1. User with no organisation membership receives 403 FORBIDDEN on /api/v1/owner/org.
        mockMvc.perform(get("/api/v1/owner/org")
                        .with(jwt().jwt(builder -> builder
                                .subject(guestWithNoOrg.toString())
                                .claim("email", "guest@example.com"))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        // 2. Provision two separate owner organisations (Owner A and Owner B).
        OrganizationSummary orgA = organizationAccess.ensureOwnerOrganization(
                ownerA, "ownera@example.com", "Owner A", "+233240000001");
        OrganizationSummary orgB = organizationAccess.ensureOwnerOrganization(
                ownerB, "ownerb@example.com", "Owner B", "+233240000002");

        assertThat(orgA.id()).isNotEqualTo(orgB.id());

        // 3. Owner A attempting to access Owner B's organisation via OrgScope gets 404 NOT_FOUND.
        assertThatThrownBy(() -> orgScope.requireOrganization(ownerA, orgB.id()))
                .isInstanceOf(AppException.class)
                .extracting(ex -> ((AppException) ex).code())
                .isEqualTo(ErrorCode.NOT_FOUND);

        UUID orgBPropertyId = UUID.randomUUID();
        assertThatThrownBy(() -> orgScope.requirePropertyAccess(ownerA, orgB.id(), orgBPropertyId, "Property"))
                .isInstanceOf(AppException.class)
                .extracting(ex -> ((AppException) ex).code())
                .isEqualTo(ErrorCode.NOT_FOUND);

        // 4. Add a STAFF member to Org A granted access only to grantedPropertyId.
        UUID staffMembershipId = UUID.randomUUID();
        UUID grantedPropertyId = UUID.randomUUID();
        UUID ungrantedPropertyId = UUID.randomUUID();

        jdbc.update(
                "INSERT INTO organization.membership (id, organization_id, user_id, role, is_primary_owner, joined_at) VALUES (?, ?, ?, 'STAFF', false, ?)",
                staffMembershipId, orgA.id(), staffA, Timestamp.from(Instant.now()));
        jdbc.update(
                "INSERT INTO organization.membership_permission (membership_id, property_id) VALUES (?, ?)",
                staffMembershipId, grantedPropertyId);

        OrgMembership resolvedStaff = orgScope.requireActive(staffA);
        assertThat(resolvedStaff.organizationId()).isEqualTo(orgA.id());
        assertThat(resolvedStaff.role()).isEqualTo(OrgRole.STAFF);
        assertThat(resolvedStaff.propertyIds()).containsExactly(grantedPropertyId);

        // Staff can read GET /api/v1/owner/org, but PATCH /api/v1/owner/org is 403 FORBIDDEN.
        mockMvc.perform(get("/api/v1/owner/org")
                        .with(jwt().jwt(builder -> builder
                                .subject(staffA.toString())
                                .claim("email", "staffa@example.com"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(orgA.id().toString()));

        mockMvc.perform(patch("/api/v1/owner/org")
                        .with(jwt().jwt(builder -> builder
                                .subject(staffA.toString())
                                .claim("email", "staffa@example.com")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                { "displayName": "Unauthorized Staff Rename" }
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        // Staff can access grantedPropertyId in Org A, gets 403 on ungrantedPropertyId in Org A,
        // and gets 404 on a property belonging to Org B.
        assertThat(orgScope.requirePropertyAccess(staffA, orgA.id(), grantedPropertyId, "Property")
                .organizationId()).isEqualTo(orgA.id());

        assertThatThrownBy(() -> orgScope.requirePropertyAccess(staffA, orgA.id(), ungrantedPropertyId, "Property"))
                .isInstanceOf(AppException.class)
                .extracting(ex -> ((AppException) ex).code())
                .isEqualTo(ErrorCode.FORBIDDEN);

        assertThatThrownBy(() -> orgScope.requirePropertyAccess(staffA, orgB.id(), orgBPropertyId, "Property"))
                .isInstanceOf(AppException.class)
                .extracting(ex -> ((AppException) ex).code())
                .isEqualTo(ErrorCode.NOT_FOUND);
    }
}
