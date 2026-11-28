package com.findstay.media.internal;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

interface MediaAssetRepository extends JpaRepository<MediaAsset, UUID> {
}
