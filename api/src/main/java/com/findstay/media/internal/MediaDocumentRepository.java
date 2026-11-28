package com.findstay.media.internal;

import com.findstay.media.api.MediaOwnerType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

interface MediaDocumentRepository extends JpaRepository<MediaDocument, UUID> {

    Optional<MediaDocument> findFirstByMediaAssetId(UUID mediaAssetId);

    List<MediaDocument> findByOwnerTypeAndOwnerIdOrderByCreatedAtAsc(MediaOwnerType ownerType, UUID ownerId);
}
