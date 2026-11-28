package com.findstay.organization;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.findstay.shared.error.AppException;
import com.findstay.shared.error.ErrorCode;
import com.findstay.shared.security.OrgScope;
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

import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * End-to-end QA isolation proof for {@code S1-07-T7} ({@code BRL-04}, {@code BRL-05},
 * {@code UR-ON02}, {@code S1-07-AC3}): verifies Owner A and Staff A can never read, list,
 * modify, or revoke any organisation, member, invitation, or property belonging to Owner B,
 * and that revoking a staff member's property permissions takes effect immediately under
 * {@link OrgScope}.
 */
@Req("S1-07-AC3")
@AutoConfigureMockMvc
class CrossOrganizationIsolationIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private OrgScope orgScope;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private ObjectMapper objectMapper;

    private UUID provisionOwner(String email, String fullName) throws Exception {
        UUID id = UUID.randomUUID();
        mockMvc.perform(post("/api/v1/auth/provision")
                        .with(jwt().jwt(b -> b
                                .subject(id.toString())
                                .claim("email", email)
                                .claim("user_metadata", Map.of("full_name", fullName, "role", "OWNER")))))
                .andExpect(status().isOk());
        return id;
    }

    private UUID provisionGuest(String email, String fullName) throws Exception {
        UUID id = UUID.randomUUID();
        mockMvc.perform(post("/api/v1/auth/provision")
                        .with(jwt().jwt(b -> b
                                .subject(id.toString())
                                .claim("email", email)
                                .claim("user_metadata", Map.of("full_name", fullName)))))
                .andExpect(status().isOk());
        return id;
    }

    @Test
    @Req("UR-ON02")
    void ownerAAndStaffACannotViewListEditOrRevokeOwnerBRecords() throws Exception {
        UUID ownerA = provisionOwner("qa.ownera@example.com", "Owner Alpha");
        UUID ownerB = provisionOwner("qa.ownerb@example.com", "Owner Beta");
        UUID staffA = provisionGuest("qa.staffa@example.com", "Staff Alpha");
        UUID staffB = provisionGuest("qa.staffb@example.com", "Staff Beta");

        UUID propA1 = UUID.randomUUID();
        UUID propA2 = UUID.randomUUID();
        UUID propB1 = UUID.randomUUID();

        // Fetch org IDs for Owner A and Owner B.
        UUID orgA = UUID.fromString(objectMapper.readTree(
                mockMvc.perform(get("/api/v1/owner/org").with(jwt().jwt(b -> b.subject(ownerA.toString()))))
                        .andExpect(status().isOk()).andReturn().getResponse().getContentAsString())
                .get("id").asText());
        UUID orgB = UUID.fromString(objectMapper.readTree(
                mockMvc.perform(get("/api/v1/owner/org").with(jwt().jwt(b -> b.subject(ownerB.toString()))))
                        .andExpect(status().isOk()).andReturn().getResponse().getContentAsString())
                .get("id").asText());
        assertThat(orgA).isNotEqualTo(orgB);

        // Owner A invites Staff A to propA1; Owner B invites Staff B to propB1 + leaves a second pending invite.
        String tokenA = objectMapper.readTree(
                mockMvc.perform(post("/api/v1/owner/invitations")
                                .with(jwt().jwt(b -> b.subject(ownerA.toString()).claim("email", "qa.ownera@example.com")))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"email\":\"qa.staffa@example.com\",\"propertyIds\":[\"%s\"]}".formatted(propA1)))
                        .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString())
                .get("acceptToken").asText();

        String tokenB = objectMapper.readTree(
                mockMvc.perform(post("/api/v1/owner/invitations")
                                .with(jwt().jwt(b -> b.subject(ownerB.toString()).claim("email", "qa.ownerb@example.com")))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"email\":\"qa.staffb@example.com\",\"propertyIds\":[\"%s\"]}".formatted(propB1)))
                        .andExpect(status().isCreated()).andReturn().getResponse().getContentAsString())
                .get("acceptToken").asText();

        MvcResult pendingBRes = mockMvc.perform(post("/api/v1/owner/invitations")
                        .with(jwt().jwt(b -> b.subject(ownerB.toString()).claim("email", "qa.ownerb@example.com")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"qa.pendingb@example.com\",\"propertyIds\":[\"%s\"]}".formatted(propB1)))
                .andExpect(status().isCreated())
                .andReturn();
        UUID pendingBInviteId = UUID.fromString(
                objectMapper.readTree(pendingBRes.getResponse().getContentAsString()).get("id").asText());

        // Both staff accept their respective invitations.
        mockMvc.perform(post("/api/v1/invitations/" + tokenA + "/accept")
                        .with(jwt().jwt(b -> b.subject(staffA.toString()).claim("email", "qa.staffa@example.com"))))
                .andExpect(status().isOk());
        mockMvc.perform(post("/api/v1/invitations/" + tokenB + "/accept")
                        .with(jwt().jwt(b -> b.subject(staffB.toString()).claim("email", "qa.staffb@example.com"))))
                .andExpect(status().isOk());

        entityManager.flush();
        entityManager.clear();

        // 1. Member lists are strictly isolated (Owner A sees only Owner A + Staff A; never Owner B or Staff B).
        String membersAJson = mockMvc.perform(get("/api/v1/owner/members")
                        .with(jwt().jwt(b -> b.subject(ownerA.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andReturn().getResponse().getContentAsString();
        assertThat(membersAJson)
                .contains(ownerA.toString(), staffA.toString())
                .doesNotContain(ownerB.toString(), staffB.toString());

        // 2. Invitation lists are strictly isolated.
        String invitesAJson = mockMvc.perform(get("/api/v1/owner/invitations")
                        .with(jwt().jwt(b -> b.subject(ownerA.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andReturn().getResponse().getContentAsString();
        assertThat(invitesAJson)
                .contains("qa.staffa@example.com")
                .doesNotContain("qa.staffb@example.com", "qa.pendingb@example.com");

        // 3. Owner A cannot revoke Owner B's pending invitation (404), and it stays PENDING.
        mockMvc.perform(delete("/api/v1/owner/invitations/" + pendingBInviteId)
                        .with(jwt().jwt(b -> b.subject(ownerA.toString()))))
                .andExpect(status().isNotFound());
        assertThat(jdbc.queryForObject(
                "SELECT status FROM organization.invitation WHERE id = ?", String.class, pendingBInviteId))
                .isEqualTo("PENDING");

        // 4. Owner A cannot update Staff B's property permissions (404), and Staff B keeps propB1.
        mockMvc.perform(patch("/api/v1/owner/members/" + staffB)
                        .with(jwt().jwt(b -> b.subject(ownerA.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"propertyIds\":[]}"))
                .andExpect(status().isNotFound());
        assertThat(orgScope.requirePropertyAccess(staffB, orgB, propB1, "Property").organizationId())
                .isEqualTo(orgB);

        // 5. OrgScope blocks Owner A and Staff A from Org B and Prop B (404 NOT_FOUND),
        //    and blocks Staff A from ungranted propA2 in Org A (403 FORBIDDEN).
        assertThatThrownBy(() -> orgScope.requireOrganization(ownerA, orgB))
                .isInstanceOf(AppException.class)
                .extracting(e -> ((AppException) e).code())
                .isEqualTo(ErrorCode.NOT_FOUND);
        assertThatThrownBy(() -> orgScope.requirePropertyAccess(ownerA, orgB, propB1, "Property"))
                .isInstanceOf(AppException.class)
                .extracting(e -> ((AppException) e).code())
                .isEqualTo(ErrorCode.NOT_FOUND);
        assertThatThrownBy(() -> orgScope.requirePropertyAccess(staffA, orgB, propB1, "Property"))
                .isInstanceOf(AppException.class)
                .extracting(e -> ((AppException) e).code())
                .isEqualTo(ErrorCode.NOT_FOUND);
        assertThatThrownBy(() -> orgScope.requirePropertyAccess(staffA, orgA, propA2, "Property"))
                .isInstanceOf(AppException.class)
                .extracting(e -> ((AppException) e).code())
                .isEqualTo(ErrorCode.FORBIDDEN);

        // 6. Staff A can access granted propA1, and revoking via PATCH takes effect immediately.
        assertThat(orgScope.requirePropertyAccess(staffA, orgA, propA1, "Property").organizationId())
                .isEqualTo(orgA);

        mockMvc.perform(patch("/api/v1/owner/members/" + staffA)
                        .with(jwt().jwt(b -> b.subject(ownerA.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"propertyIds\":[]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.propertyIds.length()").value(0));

        entityManager.flush();
        entityManager.clear();

        assertThatThrownBy(() -> orgScope.requirePropertyAccess(staffA, orgA, propA1, "Property"))
                .isInstanceOf(AppException.class)
                .extracting(e -> ((AppException) e).code())
                .isEqualTo(ErrorCode.FORBIDDEN);
    }
}
