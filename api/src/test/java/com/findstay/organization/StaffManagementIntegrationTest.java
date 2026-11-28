package com.findstay.organization;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.findstay.testing.AbstractIntegrationTest;
import com.findstay.testing.Req;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Full-stack PostgreSQL verification for {@code S1-07-T4} (staff invite, preview, accept,
 * role promotion via domain event, grant/revoke per-property permissions, and cross-org isolation).
 */
@Req("S1-07-AC2")
@AutoConfigureMockMvc
class StaffManagementIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private ObjectMapper objectMapper;

    private UUID provisionOwner(String email, String fullName) throws Exception {
        UUID ownerId = UUID.randomUUID();
        mockMvc.perform(post("/api/v1/auth/provision")
                        .with(jwt().jwt(b -> b
                                .subject(ownerId.toString())
                                .claim("email", email)
                                .claim("user_metadata", Map.of(
                                        "full_name", fullName,
                                        "role", "OWNER")))))
                .andExpect(status().isOk());
        return ownerId;
    }

    private UUID provisionGuest(String email, String fullName) throws Exception {
        UUID guestId = UUID.randomUUID();
        mockMvc.perform(post("/api/v1/auth/provision")
                        .with(jwt().jwt(b -> b
                                .subject(guestId.toString())
                                .claim("email", email)
                                .claim("user_metadata", Map.of("full_name", fullName)))))
                .andExpect(status().isOk());
        return guestId;
    }

    @Test
    @Req("FR-09")
    void fullStaffInviteAcceptAndPermissionLifecycleWorksEndToEnd() throws Exception {
        UUID ownerId = provisionOwner("owner.ama@example.com", "Ama Mensah");
        UUID staffId = provisionGuest("staff.kwame@example.com", "Kwame Boateng");
        UUID otherGuestId = provisionGuest("other.person@example.com", "Other Person");

        UUID prop1 = UUID.randomUUID();
        UUID prop2 = UUID.randomUUID();
        UUID prop3 = UUID.randomUUID();

        // 1. Owner sends staff invitation with 2 properties -> 201 Created with raw acceptToken once.
        MvcResult createResult = mockMvc.perform(post("/api/v1/owner/invitations")
                        .with(jwt().jwt(b -> b.subject(ownerId.toString()).claim("email", "owner.ama@example.com")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "STAFF.Kwame@example.com",
                                  "propertyIds": ["%s", "%s"]
                                }
                                """.formatted(prop1, prop2)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("staff.kwame@example.com"))
                .andExpect(jsonPath("$.role").value("STAFF"))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.propertyIds", containsInAnyOrder(prop1.toString(), prop2.toString())))
                .andExpect(jsonPath("$.acceptToken").isNotEmpty())
                .andReturn();

        JsonNode created = objectMapper.readTree(createResult.getResponse().getContentAsString());
        String rawToken = created.get("acceptToken").asText();
        UUID invitationId = UUID.fromString(created.get("id").asText());

        // Stored token_hash must be a 64-char SHA-256 hex digest, never the raw token.
        String storedHash = jdbc.queryForObject(
                "SELECT token_hash FROM organization.invitation WHERE id = ?", String.class, invitationId);
        assertThat(storedHash).hasSize(64).isNotEqualTo(rawToken);

        // 2. Duplicate PENDING invite for the same (org, email) returns 409 CONFLICT.
        mockMvc.perform(post("/api/v1/owner/invitations")
                        .with(jwt().jwt(b -> b.subject(ownerId.toString()).claim("email", "owner.ama@example.com")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"staff.kwame@example.com\",\"propertyIds\":[]}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("CONFLICT"));

        // 3. Public preview works unauthenticated; unknown token returns 404.
        mockMvc.perform(get("/api/v1/invitations/" + rawToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("staff.kwame@example.com"))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.acceptToken").doesNotExist());

        mockMvc.perform(get("/api/v1/invitations/does-not-exist-token"))
                .andExpect(status().isNotFound());

        // 4. Accepting with a different email returns 403 FORBIDDEN.
        mockMvc.perform(post("/api/v1/invitations/" + rawToken + "/accept")
                        .with(jwt().jwt(b -> b.subject(otherGuestId.toString()).claim("email", "other.person@example.com"))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        // 5. Accepting with matching invited email creates STAFF membership, copies property permissions,
        //    and promotes the GUEST account to STAFF via StaffInviteAcceptedEvent.
        mockMvc.perform(post("/api/v1/invitations/" + rawToken + "/accept")
                        .with(jwt().jwt(b -> b.subject(staffId.toString()).claim("email", "staff.kwame@example.com"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(staffId.toString()))
                .andExpect(jsonPath("$.role").value("STAFF"))
                .andExpect(jsonPath("$.isPrimaryOwner").value(false))
                .andExpect(jsonPath("$.propertyIds", containsInAnyOrder(prop1.toString(), prop2.toString())));

        entityManager.flush();
        entityManager.clear();

        // /api/v1/me reflects upgraded STAFF role, permissions, and org membership immediately.
        mockMvc.perform(get("/api/v1/me")
                        .with(jwt().jwt(b -> b.subject(staffId.toString()).claim("email", "staff.kwame@example.com"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("STAFF"))
                .andExpect(jsonPath("$.permissions", hasItem("listing.write")))
                .andExpect(jsonPath("$.memberships[0].role").value("STAFF"))
                .andExpect(jsonPath("$.memberships[0].propertyIds", containsInAnyOrder(prop1.toString(), prop2.toString())));

        // 6. Re-accepting an already-accepted invitation returns 409 CONFLICT.
        mockMvc.perform(post("/api/v1/invitations/" + rawToken + "/accept")
                        .with(jwt().jwt(b -> b.subject(staffId.toString()).claim("email", "staff.kwame@example.com"))))
                .andExpect(status().isConflict());

        // 7. Owner lists members and updates staff per-property permissions (grant prop3, revoke prop1).
        mockMvc.perform(get("/api/v1/owner/members")
                        .with(jwt().jwt(b -> b.subject(ownerId.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));

        mockMvc.perform(patch("/api/v1/owner/members/" + staffId)
                        .with(jwt().jwt(b -> b.subject(ownerId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"propertyIds\":[\"%s\",\"%s\"]}".formatted(prop2, prop3)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.propertyIds", containsInAnyOrder(prop2.toString(), prop3.toString())));

        // 8. Owner revokes ALL property permissions (empty array) -> immediate revocation.
        mockMvc.perform(patch("/api/v1/owner/members/" + staffId)
                        .with(jwt().jwt(b -> b.subject(ownerId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"propertyIds\":[]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.propertyIds.length()").value(0));

        // 9. Owner cannot modify primary owner permissions (422); STAFF cannot invite or modify permissions (403).
        mockMvc.perform(patch("/api/v1/owner/members/" + ownerId)
                        .with(jwt().jwt(b -> b.subject(ownerId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"propertyIds\":[]}"))
                .andExpect(status().isUnprocessableEntity());

        mockMvc.perform(post("/api/v1/owner/invitations")
                        .with(jwt().jwt(b -> b.subject(staffId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"another@example.com\",\"propertyIds\":[]}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(patch("/api/v1/owner/members/" + staffId)
                        .with(jwt().jwt(b -> b.subject(staffId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"propertyIds\":[\"%s\"]}".formatted(prop1)))
                .andExpect(status().isForbidden());
    }

    @Test
    @Req("S1-07-AC3")
    void revokeExpiryAndCrossOrganizationIsolationAreEnforced() throws Exception {
        UUID ownerA = provisionOwner("iso.ownera@example.com", "Owner Alpha");
        UUID ownerB = provisionOwner("iso.ownerb@example.com", "Owner Beta");
        UUID invitee = provisionGuest("iso.staff@example.com", "Iso Staff");

        // Owner A creates an invitation.
        MvcResult createA = mockMvc.perform(post("/api/v1/owner/invitations")
                        .with(jwt().jwt(b -> b.subject(ownerA.toString()).claim("email", "iso.ownera@example.com")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"iso.staff@example.com\",\"propertyIds\":[]}"))
                .andExpect(status().isCreated())
                .andReturn();
        JsonNode invA = objectMapper.readTree(createA.getResponse().getContentAsString());
        UUID invAId = UUID.fromString(invA.get("id").asText());
        String tokenA = invA.get("acceptToken").asText();

        // Owner B cannot list or revoke Owner A's invitation (sees 0 invites and 404 on revoke).
        mockMvc.perform(get("/api/v1/owner/invitations")
                        .with(jwt().jwt(b -> b.subject(ownerB.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        mockMvc.perform(delete("/api/v1/owner/invitations/" + invAId)
                        .with(jwt().jwt(b -> b.subject(ownerB.toString()))))
                .andExpect(status().isNotFound());

        // Owner A revokes the invitation -> accepting returns 409 CONFLICT, and re-inviting succeeds.
        mockMvc.perform(delete("/api/v1/owner/invitations/" + invAId)
                        .with(jwt().jwt(b -> b.subject(ownerA.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REVOKED"));

        mockMvc.perform(post("/api/v1/invitations/" + tokenA + "/accept")
                        .with(jwt().jwt(b -> b.subject(invitee.toString()).claim("email", "iso.staff@example.com"))))
                .andExpect(status().isConflict());

        // Owner A re-invites the same email after revocation -> succeeds (201), then expires.
        MvcResult reinviteRes = mockMvc.perform(post("/api/v1/owner/invitations")
                        .with(jwt().jwt(b -> b.subject(ownerA.toString()).claim("email", "iso.ownera@example.com")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"iso.staff@example.com\",\"propertyIds\":[]}"))
                .andExpect(status().isCreated())
                .andReturn();
        JsonNode reinv = objectMapper.readTree(reinviteRes.getResponse().getContentAsString());
        UUID reinvId = UUID.fromString(reinv.get("id").asText());
        String reinvToken = reinv.get("acceptToken").asText();

        // Force expires_at into the past -> preview shows EXPIRED and accept returns 422.
        jdbc.update("UPDATE organization.invitation SET expires_at = ? WHERE id = ?",
                Timestamp.from(Instant.now().minus(1, ChronoUnit.HOURS)), reinvId);
        entityManager.flush();
        entityManager.clear();

        mockMvc.perform(get("/api/v1/invitations/" + reinvToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("EXPIRED"));

        mockMvc.perform(post("/api/v1/invitations/" + reinvToken + "/accept")
                        .with(jwt().jwt(b -> b.subject(invitee.toString()).claim("email", "iso.staff@example.com"))))
                .andExpect(status().isUnprocessableEntity());

        // Owner B cannot modify Owner A's members (404).
        mockMvc.perform(patch("/api/v1/owner/members/" + ownerA)
                        .with(jwt().jwt(b -> b.subject(ownerB.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"propertyIds\":[]}"))
                .andExpect(status().isNotFound());
    }
}
