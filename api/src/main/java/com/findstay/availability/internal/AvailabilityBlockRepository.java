package com.findstay.availability.internal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

interface AvailabilityBlockRepository extends JpaRepository<AvailabilityBlock, UUID> {

    @Query("""
            SELECT b FROM AvailabilityBlock b
            WHERE b.unitId = :unitId
              AND b.startAt < :rangeEnd
              AND b.endAt > :rangeStart
            ORDER BY b.startAt ASC
            """)
    List<AvailabilityBlock> findOverlappingForUnit(
            @Param("unitId") UUID unitId,
            @Param("rangeStart") Instant rangeStart,
            @Param("rangeEnd") Instant rangeEnd
    );

    @Query("""
            SELECT DISTINCT b.unitId FROM AvailabilityBlock b
            WHERE b.unitId IN :unitIds
              AND b.startAt < :rangeEnd
              AND b.endAt > :rangeStart
            """)
    List<UUID> findBlockedUnitIds(
            @Param("unitIds") Collection<UUID> unitIds,
            @Param("rangeStart") Instant rangeStart,
            @Param("rangeEnd") Instant rangeEnd
    );

    Optional<AvailabilityBlock> findByIdAndUnitId(UUID id, UUID unitId);
}
