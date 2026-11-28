package com.findstay.verification.internal;

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
 * Full-stack PostgreSQL verification for Story {@code S1-11} ({@code T2}, {@code T3}, {@code T5}):
 * Ghana Act 843 privacy notice metadata, append-only {@code verification.consent_record} persistence
 * with PostgreSQL {@code inet} IP addresses, dynamic re-consent when {@code privacy.policy_version}
 * increments, and strict DTO personal-data filtering on public endpoints.
 */
@Req("NFR-31")
@AutoConfigureMockMvc
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class ConsentAndPrivacyIntegrationTest extends AbstractIntegrationTest {

    private static final UUID SUITE_TYPE_ID = UUID.fromString("01a1e6cd-a800-7004-bf00-000000000004");
    private static final UUID BEACH_ROAD_AREA_ID = UUID.fromString("01a1e6cd-a818-7001-bf00-000000000001");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbc;

    private UUID guestId;
    private UUID ownerId;
    private UUID orgId;
    private UUID adminId;

    @BeforeEach
    void setUp() {
        guestId = UUID.randomUUID();
        ownerId = UUID.randomUUID();
        orgId = UUID.randomUUID();
        adminId = UUID.randomUUID();

        seedUser(guestId, "consent-guest-" + guestId + "@findstay.gh", "GUEST");
        seedUser(ownerId, "consent-owner-" + ownerId + "@findstay.gh", "OWNER");
        seedUser(adminId, "consent-admin-" + adminId + "@findstay.gh", "ADMIN");
        seedOrg(orgId, ownerId, "Harbour View Villas", "private-owner-secret@findstay.gh", "+233244998877");
    }

    @Test
    @Req("NFR-36")
    void recordsAct843ConsentWithIpAndTriggersReconsentWhenPolicyVersionIncrements() throws Exception {
        // 1. Public privacy notice metadata is readable anonymously
        mockMvc.perform(get("/api/v1/privacy-notice"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.policyVersion").value("1"))
                .andExpect(jsonPath("$.governingLaw").value("Data Protection Act, 2012 (Act 843), Republic of Ghana"));

        // 2. Unauthenticated consent calls rejected (401)
        mockMvc.perform(get("/api/v1/consents/latest"))
                .andExpect(status().isUnauthorized());

        // 3. New user initially requires consent
        mockMvc.perform(get("/api/v1/consents/latest")
                        .with(jwt().jwt(j -> j.subject(guestId.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.policyVersion").value("1"))
                .andExpect(jsonPath("$.requiresConsent").value(true))
                .andExpect(jsonPath("$.acceptedAt").doesNotExist());

        // 4. Rejecting acceptance == false (400)
        mockMvc.perform(post("/api/v1/me/consents")
                        .with(jwt().jwt(j -> j.subject(guestId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"accepted": false, "policyVersion": "1"}
                                """))
                .andExpect(status().isBadRequest());

        // 5. Recording consent persists inet IP + timestamp + policy_version + audit entry
        mockMvc.perform(post("/api/v1/me/consents")
                        .header("X-Forwarded-For", "41.215.160.12")
                        .with(jwt().jwt(j -> j.subject(guestId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"accepted": true, "policyVersion": "1"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.policyVersion").value("1"))
                .andExpect(jsonPath("$.ipAddress").value("41.215.160.12"));

        // Now requiresConsent == false
        mockMvc.perform(get("/api/v1/consents/latest")
                        .with(jwt().jwt(j -> j.subject(guestId.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.requiresConsent").value(false))
                .andExpect(jsonPath("$.history.length()").value(1));

        Integer auditCount = jdbc.queryForObject(
                "SELECT count(*) FROM audit.audit_log WHERE actor_id = ? AND action = 'consent.recorded'",
                Integer.class,
                guestId
        );
        assertThat(auditCount).isEqualTo(1);

        // 6. Admin bumps privacy.policy_version 1 -> 2 => user immediately requires re-consent!
        try {
            mockMvc.perform(put("/api/v1/admin/settings/privacy.policy_version")
                            .with(jwt().jwt(j -> j.subject(adminId.toString())))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {"value": "2"}
                                    """))
                    .andExpect(status().isOk());

            mockMvc.perform(get("/api/v1/consents/latest")
                            .with(jwt().jwt(j -> j.subject(guestId.toString()))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.policyVersion").value("2"))
                    .andExpect(jsonPath("$.requiresConsent").value(true));
        } finally {
            jdbc.update("UPDATE admin.platform_setting SET value = '1' WHERE key = 'privacy.policy_version'");
        }
    }

    @Test
    @Req("NFR-35")
    void publicListingDtoNeverExposesPrivateOwnerContactOrGovernmentIdData() throws Exception {
        UUID propertyId = UUID.randomUUID();
        UUID listingId = UUID.randomUUID();

        jdbc.update(
                """
                INSERT INTO listing.property
                    (id, organization_id, name, description, accommodation_type_id, town, area_id,
                     address, house_rules, status, created_at, updated_at)
                VALUES (?, ?, 'Privacy Checked Suite', 'Safe public listing', ?, 'Takoradi', ?,
                        'Beach Road', 'No smoking', 'ACTIVE', now(), now())
                """,
                propertyId, orgId, SUITE_TYPE_ID, BEACH_ROAD_AREA_ID
        );
        jdbc.update(
                """
                INSERT INTO listing.listing
                    (id, property_id, name, description, town, area_name, address,
                     accommodation_type_code, amenities, house_rules, from_price_pesewas,
                     currency, owner_verified, status, published_at, updated_at)
                VALUES (?, ?, 'Privacy Checked Suite', 'Safe public listing', 'Takoradi', 'Beach Road',
                        'Beach Road', 'SUITE', '["WIFI"]'::jsonb, 'No smoking', 40000,
                        'GHS', true, 'ACTIVE', now(), now())
                """,
                listingId, propertyId
        );

        MvcResult res = mockMvc.perform(get("/api/v1/properties/{propertyId}", propertyId))
                .andExpect(status().isOk())
                .andReturn();

        String body = res.getResponse().getContentAsString();
        assertThat(body)
                .doesNotContain("private-owner-secret@findstay.gh")
                .doesNotContain("+233244998877")
                .doesNotContain("ghanaCard")
                .doesNotContain("GHA-");
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
                VALUES (?, 'Privacy Test User', now())
                """,
                userId
        );
    }

    private void seedOrg(UUID orgId, UUID ownerUserId, String name, String email, String phone) {
        jdbc.update(
                """
                INSERT INTO organization.organization
                    (id, name, display_name, contact_email, contact_phone, verification_status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, 'APPROVED', now(), now())
                """,
                orgId, name, name, email, phone
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
}
