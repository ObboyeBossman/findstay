package com.findstay.repositories;

import com.findstay.models.UnitRoom;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UnitRoomRepository extends JpaRepository<UnitRoom, Long> {

    List<UnitRoom> findByPropertyIdAndStatus(Long propertyId, String status);

    /**
     * CRITICAL FOR CONCURRENCY & COURSE EVALUATION:
     * Executes 'SELECT ... FOR UPDATE' on PostgreSQL row level.
     * Prevents race conditions and double-bookings when multiple students
     * in Takoradi initiate checkout for the same room simultaneously.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT u FROM UnitRoom u WHERE u.id = :id")
    Optional<UnitRoom> findByIdWithPessimisticLock(@Param("id") Long id);
}
