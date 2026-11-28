package com.findstay.notification.internal;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

interface NotificationRepository extends JpaRepository<Notification, UUID> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    long countByUserId(UUID userId);

    long countByUserIdAndReadAtIsNull(UUID userId);

    Optional<Notification> findByIdAndUserId(UUID id, UUID userId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Notification n SET n.readAt = :now WHERE n.userId = :userId AND n.readAt IS NULL")
    int markAllReadForUser(@Param("userId") UUID userId, @Param("now") Instant now);
}
