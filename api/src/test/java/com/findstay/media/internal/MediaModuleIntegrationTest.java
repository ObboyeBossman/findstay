package com.findstay.media.internal;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.findstay.media.api.MediaAssetStatus;
import com.findstay.media.api.MediaBucket;
import com.findstay.media.api.MediaOwnerType;
import com.findstay.testing.AbstractIntegrationTest;
import com.findstay.testing.Req;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Full-stack PostgreSQL verification for Story {@code S1-09} ({@code T3}, {@code T4}, {@code T5},
 * {@code T7}): pre-signed R2 uploads, WebP public promotion, 5 MB &amp; MIME rejection, DB size
 * constraint, private document expiring signed URLs, and cross-organisation storage isolation.
 */
@Req("NFR-17")
@AutoConfigureMockMvc
class MediaModuleIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private MediaService mediaService;

    private UUID ownerAId;
    private UUID orgAId;
    private UUID ownerBId;
    private UUID orgBId;
    private UUID guestId;
    private UUID adminId;

    @BeforeEach
    void setUp() {
        ownerAId = UUID.randomUUID();
        orgAId = UUID.randomUUID();
        ownerBId = UUID.randomUUID();
        orgBId = UUID.randomUUID();
        guestId = UUID.randomUUID();
        adminId = UUID.randomUUID();

        seedUser(ownerAId, "owner-a-" + ownerAId + "@findstay.gh", "OWNER");
        seedOrg(orgAId, ownerAId, "Takoradi Coastal Villas");

        seedUser(ownerBId, "owner-b-" + ownerBId + "@findstay.gh", "OWNER");
        seedOrg(orgBId, ownerBId, "Beach Road Suites");

        seedUser(guestId, "guest-" + guestId + "@findstay.gh", "GUEST");
        seedUser(adminId, "admin-" + adminId + "@findstay.gh", "ADMIN");
    }

    @Test
    @Req("TA-12")
    void ownerPresignsConfirmsAndPromotesWebpPhotoToPublicCdn() throws Exception {
        UUID propertyId = UUID.randomUUID();
        String payload = """
                {
                  "ownerType": "PROPERTY_PHOTO",
                  "ownerId": "%s",
                  "filename": "living-room.webp",
                  "contentType": "image/webp",
                  "sizeBytes": 245760
                }
                """.formatted(propertyId);

        MvcResult presignRes = mockMvc.perform(post("/api/v1/owner/media/presign")
                        .with(jwt().jwt(j -> j.subject(ownerAId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.bucket").value(MediaBucket.PUBLIC_IMAGES.name()))
                .andExpect(jsonPath("$.uploadUrl").isNotEmpty())
                .andExpect(jsonPath("$.requiredHeaders['Content-Type']").value("image/webp"))
                .andReturn();

        JsonNode presignJson = objectMapper.readTree(presignRes.getResponse().getContentAsString());
        UUID assetId = UUID.fromString(presignJson.get("assetId").asText());
        String storageKey = presignJson.get("storageKey").asText();
        assertThat(storageKey).startsWith("orgs/" + orgAId + "/photos/" + propertyId + "/");
        assertThat(storageKey).endsWith(".webp");

        mockMvc.perform(post("/api/v1/owner/media/{assetId}/confirm", assetId)
                        .with(jwt().jwt(j -> j.subject(ownerAId.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(MediaAssetStatus.READY.name()))
                .andExpect(jsonPath("$.publicUrl").isNotEmpty());

        mockMvc.perform(post("/api/v1/owner/media/{assetId}/promote-webp", assetId)
                        .with(jwt().jwt(j -> j.subject(ownerAId.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bucket").value(MediaBucket.PUBLIC_IMAGES.name()))
                .andExpect(jsonPath("$.storageKey").value("orgs/" + orgAId + "/public/properties/" + propertyId + "/" + assetId + ".webp"))
                .andExpect(jsonPath("$.publicUrl").value(org.hamcrest.Matchers.containsString("/orgs/" + orgAId + "/public/properties/" + propertyId + "/" + assetId + ".webp")));
    }

    @Test
    @Req("NFR-17")
    void rejectsOversizedWrongMimeAndPathTraversalUploadsBeforePresigning() throws Exception {
        UUID propertyId = UUID.randomUUID();

        // > 5 MB (5,242,881 bytes)
        mockMvc.perform(post("/api/v1/owner/media/presign")
                        .with(jwt().jwt(j -> j.subject(ownerAId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "ownerType": "PROPERTY_PHOTO",
                                  "ownerId": "%s",
                                  "filename": "huge.webp",
                                  "contentType": "image/webp",
                                  "sizeBytes": 5242881
                                }
                                """.formatted(propertyId)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));

        // Unsupported MIME type for photo (PDF & SVG blocked)
        mockMvc.perform(post("/api/v1/owner/media/presign")
                        .with(jwt().jwt(j -> j.subject(ownerAId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "ownerType": "PROPERTY_PHOTO",
                                  "ownerId": "%s",
                                  "filename": "script.svg",
                                  "contentType": "image/svg+xml",
                                  "sizeBytes": 4096
                                }
                                """.formatted(propertyId)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));

        // Path traversal attempt in filename
        mockMvc.perform(post("/api/v1/owner/media/presign")
                        .with(jwt().jwt(j -> j.subject(ownerAId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "ownerType": "PROPERTY_PHOTO",
                                  "ownerId": "%s",
                                  "filename": "../other-org/hack.webp",
                                  "contentType": "image/webp",
                                  "sizeBytes": 2048
                                }
                                """.formatted(propertyId)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));

        // Verify PostgreSQL CHECK constraint also enforces <= 5 MB independently
        assertThatThrownBy(() -> jdbc.update("""
                INSERT INTO media.media_asset (id, organization_id, bucket, storage_key, content_type, size_bytes, status, created_at)
                VALUES (?, ?, 'PUBLIC_IMAGES', ?, 'image/webp', 5242881, 'PENDING_UPLOAD', now())
                """, UUID.randomUUID(), orgAId, "orgs/" + orgAId + "/oversize-test.webp"))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    @Req("TA-13")
    void privateDocsIssueExpiringSignedUrlsOnlyToOwnerOrAdminAndIsolateOtherOrgs() throws Exception {
        UUID verificationDocId = UUID.randomUUID();

        // Owner A presigns and confirms a private Ghana Card PDF
        MvcResult presignRes = mockMvc.perform(post("/api/v1/owner/media/presign")
                        .with(jwt().jwt(j -> j.subject(ownerAId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "ownerType": "VERIFICATION_DOCUMENT",
                                  "ownerId": "%s",
                                  "filename": "ghana-card.pdf",
                                  "contentType": "application/pdf",
                                  "sizeBytes": 512000
                                }
                                """.formatted(verificationDocId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.bucket").value(MediaBucket.PRIVATE_DOCS.name()))
                .andExpect(jsonPath("$.publicUrl").doesNotExist())
                .andReturn();

        JsonNode presignJson = objectMapper.readTree(presignRes.getResponse().getContentAsString());
        UUID assetId = UUID.fromString(presignJson.get("assetId").asText());
        assertThat(presignJson.get("storageKey").asText())
                .startsWith("orgs/" + orgAId + "/verification/" + verificationDocId + "/");

        // Owner B cannot confirm Owner A's upload (404 — no existence leak)
        mockMvc.perform(post("/api/v1/owner/media/{assetId}/confirm", assetId)
                        .with(jwt().jwt(j -> j.subject(ownerBId.toString()))))
                .andExpect(status().isNotFound());

        // Owner A confirms upload
        mockMvc.perform(post("/api/v1/owner/media/{assetId}/confirm", assetId)
                        .with(jwt().jwt(j -> j.subject(ownerAId.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(MediaAssetStatus.READY.name()))
                .andExpect(jsonPath("$.publicUrl").doesNotExist());

        // Owner A gets a temporary 5-minute signed download URL
        MvcResult ownerSignedRes = mockMvc.perform(get("/api/v1/media/{assetId}/signed-url", assetId)
                        .with(jwt().jwt(j -> j.subject(ownerAId.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.downloadUrl").value(org.hamcrest.Matchers.containsString("X-Amz-Expires=300")))
                .andReturn();

        JsonNode ownerSignedJson = objectMapper.readTree(ownerSignedRes.getResponse().getContentAsString());
        Instant expiresAt = Instant.parse(ownerSignedJson.get("expiresAt").asText());
        assertThat(mediaService.isSignedUrlValidAt(expiresAt, expiresAt.minusSeconds(10))).isTrue();
        assertThat(mediaService.isSignedUrlValidAt(expiresAt, expiresAt.plusSeconds(1))).isFalse();

        // Admin (with media.private.read) can also generate a short-lived signed download URL
        mockMvc.perform(get("/api/v1/media/{assetId}/signed-url", assetId)
                        .with(jwt().jwt(j -> j.subject(adminId.toString()))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assetId").value(assetId.toString()));

        // Owner B gets 404 NOT_FOUND (cross-org isolation)
        mockMvc.perform(get("/api/v1/media/{assetId}/signed-url", assetId)
                        .with(jwt().jwt(j -> j.subject(ownerBId.toString()))))
                .andExpect(status().isNotFound());

        // Guest gets 403 FORBIDDEN
        mockMvc.perform(get("/api/v1/media/{assetId}/signed-url", assetId)
                        .with(jwt().jwt(j -> j.subject(guestId.toString()))))
                .andExpect(status().isForbidden());

        // Unauthenticated gets 401 UNAUTHENTICATED
        mockMvc.perform(get("/api/v1/media/{assetId}/signed-url", assetId))
                .andExpect(status().isUnauthorized());

        // Soft delete preserves row for audit trail but blocks future downloads
        mockMvc.perform(delete("/api/v1/owner/media/{assetId}", assetId)
                        .with(jwt().jwt(j -> j.subject(ownerBId.toString()))))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/v1/owner/media/{assetId}", assetId)
                        .with(jwt().jwt(j -> j.subject(ownerAId.toString()))))
                .andExpect(status().isNoContent());

        String dbStatus = jdbc.queryForObject(
                "SELECT status FROM media.media_asset WHERE id = ?",
                String.class,
                assetId
        );
        assertThat(dbStatus).isEqualTo(MediaAssetStatus.DELETED.name());

        mockMvc.perform(get("/api/v1/media/{assetId}/signed-url", assetId)
                        .with(jwt().jwt(j -> j.subject(ownerAId.toString()))))
                .andExpect(status().isNotFound());
    }

    @Test
    @Req("BRL-04")
    void enforcesTenPhotoCapPerPropertyAndBlocksGuestPresign() throws Exception {
        UUID propertyId = UUID.randomUUID();

        // Guest cannot presign uploads (missing media.upload)
        mockMvc.perform(post("/api/v1/owner/media/presign")
                        .with(jwt().jwt(j -> j.subject(guestId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "ownerType": "PROPERTY_PHOTO",
                                  "ownerId": "%s",
                                  "filename": "photo.webp",
                                  "contentType": "image/webp",
                                  "sizeBytes": 100000
                                }
                                """.formatted(propertyId)))
                .andExpect(status().isForbidden());

        for (int i = 0; i < MediaService.MAX_PHOTOS_PER_PROPERTY; i++) {
            mockMvc.perform(post("/api/v1/owner/media/presign")
                            .with(jwt().jwt(j -> j.subject(ownerAId.toString())))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {
                                      "ownerType": "PROPERTY_PHOTO",
                                      "ownerId": "%s",
                                      "filename": "photo-%d.webp",
                                      "contentType": "image/webp",
                                      "sizeBytes": 120000
                                    }
                                    """.formatted(propertyId, i)))
                    .andExpect(status().isCreated());
        }

        // 11th photo rejected with 422 BUSINESS_RULE_VIOLATION
        mockMvc.perform(post("/api/v1/owner/media/presign")
                        .with(jwt().jwt(j -> j.subject(ownerAId.toString())))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "ownerType": "PROPERTY_PHOTO",
                                  "ownerId": "%s",
                                  "filename": "photo-11.webp",
                                  "contentType": "image/webp",
                                  "sizeBytes": 120000
                                }
                                """.formatted(propertyId)))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.code").value("BUSINESS_RULE_VIOLATION"));

        assertThat(mediaService.listDocumentsForOrganization(orgAId, MediaOwnerType.PROPERTY_PHOTO, propertyId))
                .hasSize(10);
        assertThat(mediaService.listDocumentsForOrganization(orgBId, MediaOwnerType.PROPERTY_PHOTO, propertyId))
                .isEmpty();
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
                VALUES (?, 'Test User', now())
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
}
