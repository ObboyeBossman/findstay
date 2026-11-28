package com.findstay.availability.internal;

import com.findstay.availability.api.AvailabilityBlockReason;
import com.findstay.availability.api.AvailabilityBlockView;
import com.findstay.availability.api.AvailabilityGate;
import com.findstay.availability.internal.AvailabilityDtos.AvailabilityCalendarResponse;
import com.findstay.availability.internal.AvailabilityDtos.CalendarDayResponse;
import com.findstay.availability.internal.AvailabilityDtos.CreateBlockRequest;
import com.findstay.listing.api.CatalogQuery;
import com.findstay.listing.api.UnitSummaryView;
import com.findstay.shared.error.ApiError;
import com.findstay.shared.error.AppException;
import com.findstay.shared.id.IdGenerator;
import com.findstay.shared.security.OrgScope;
import com.findstay.shared.time.GhanaTime;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.sql.SQLException;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
class AvailabilityService implements AvailabilityGate {

    private static final String PG_EXCLUSION_VIOLATION = "23P01";

    private final AvailabilityBlockRepository blockRepository;
    private final CatalogQuery catalogQuery;
    private final OrgScope orgScope;
    private final IdGenerator idGenerator;
    private final Clock clock;
    private final TransactionTemplate transactionTemplate;

    AvailabilityService(
            AvailabilityBlockRepository blockRepository,
            CatalogQuery catalogQuery,
            OrgScope orgScope,
            IdGenerator idGenerator,
            Clock clock,
            TransactionTemplate transactionTemplate
    ) {
        this.blockRepository = blockRepository;
        this.catalogQuery = catalogQuery;
        this.orgScope = orgScope;
        this.idGenerator = idGenerator;
        this.clock = clock;
        this.transactionTemplate = transactionTemplate;
    }

    // -------------------------------------------------------------------------
    // Owner / Staff calendar endpoints
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    AvailabilityCalendarResponse getUnitCalendar(UUID userId, UUID unitId, String monthParam) {
        UnitSummaryView unit = requireAccessibleUnit(userId, unitId);
        YearMonth ym = parseMonth(monthParam);

        LocalDate firstDay = ym.atDay(1);
        LocalDate firstOfNextMonth = ym.plusMonths(1).atDay(1);
        Instant rangeStart = GhanaTime.startOfDay(firstDay);
        Instant rangeEnd = GhanaTime.startOfDay(firstOfNextMonth);

        List<AvailabilityBlock> overlapping = blockRepository.findOverlappingForUnit(unitId, rangeStart, rangeEnd);
        List<AvailabilityBlockView> blockViews = overlapping.stream().map(AvailabilityService::toView).toList();

        List<CalendarDayResponse> days = new ArrayList<>(ym.lengthOfMonth());
        for (int day = 1; day <= ym.lengthOfMonth(); day++) {
            LocalDate date = ym.atDay(day);
            Instant dayStart = GhanaTime.startOfDay(date);
            Instant dayEnd = GhanaTime.startOfNextDay(date);

            AvailabilityBlock matched = overlapping.stream()
                    .filter(b -> b.getStartAt().isBefore(dayEnd) && b.getEndAt().isAfter(dayStart))
                    .findFirst()
                    .orElse(null);

            if (matched != null) {
                days.add(new CalendarDayResponse(date, "OWNER_BLOCKED", matched.getId()));
            } else {
                days.add(new CalendarDayResponse(date, "AVAILABLE", null));
            }
        }

        return new AvailabilityCalendarResponse(
                unit.unitId(),
                unit.propertyId(),
                unit.name(),
                ym.toString(),
                days,
                blockViews
        );
    }

    /**
     * Inserts a new owner availability block. Uses {@link TransactionTemplate} directly so
     * PostgreSQL's {@code btree_gist} exclusion violation ({@code SQLSTATE 23P01}) is caught
     * cleanly outside transaction commit and mapped to HTTP {@code 409 CONFLICT} even under
     * concurrent requests ({@code S1-14-T5}).
     */
    AvailabilityBlockView createBlock(UUID userId, UUID unitId, CreateBlockRequest request) {
        requireAccessibleUnit(userId, unitId);

        TimeWindow window = resolveWindow(request);
        AvailabilityBlockReason reason = resolveReason(request.reason());
        Instant now = clock.instant();

        AvailabilityBlock block = new AvailabilityBlock(
                idGenerator.newId(),
                unitId,
                window.startAt(),
                window.endAt(),
                reason,
                userId,
                now
        );

        try {
            AvailabilityBlock saved = transactionTemplate.execute(status -> blockRepository.saveAndFlush(block));
            return toView(saved != null ? saved : block);
        } catch (DataIntegrityViolationException ex) {
            if (isOverlapExclusionViolation(ex)) {
                throw AppException.conflict("Selected dates overlap an existing block on this unit");
            }
            throw ex;
        }
    }

    @Transactional
    void deleteBlock(UUID userId, UUID unitId, UUID blockId) {
        requireAccessibleUnit(userId, unitId);
        AvailabilityBlock block = blockRepository.findByIdAndUnitId(blockId, unitId)
                .orElseThrow(() -> AppException.notFound("AvailabilityBlock", blockId));
        blockRepository.delete(block);
        blockRepository.flush();
    }

    // -------------------------------------------------------------------------
    // Extension Seam 1 — AvailabilityGate implementation
    // -------------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    public boolean isUnitAvailable(UUID unitId, Instant startAt, Instant endAt) {
        validateInstantRange(startAt, endAt);
        return blockRepository.findOverlappingForUnit(unitId, startAt, endAt).isEmpty();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AvailabilityBlockView> listBlocksInRange(UUID unitId, Instant rangeStart, Instant rangeEnd) {
        validateInstantRange(rangeStart, rangeEnd);
        return blockRepository.findOverlappingForUnit(unitId, rangeStart, rangeEnd).stream()
                .map(AvailabilityService::toView)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Set<UUID> findBlockedUnitIds(Collection<UUID> unitIds, Instant startAt, Instant endAt) {
        validateInstantRange(startAt, endAt);
        if (unitIds == null || unitIds.isEmpty()) {
            return Set.of();
        }
        return new HashSet<>(blockRepository.findBlockedUnitIds(unitIds, startAt, endAt));
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private UnitSummaryView requireAccessibleUnit(UUID userId, UUID unitId) {
        UnitSummaryView unit = catalogQuery.findUnitById(unitId)
                .orElseThrow(() -> AppException.notFound("Unit", unitId));
        orgScope.requirePropertyAccess(userId, unit.organizationId(), unit.propertyId(), "Unit");
        return unit;
    }

    private YearMonth parseMonth(String monthParam) {
        if (monthParam == null || monthParam.isBlank()) {
            return YearMonth.from(GhanaTime.dateOf(clock.instant()));
        }
        try {
            return YearMonth.parse(monthParam.trim());
        } catch (DateTimeParseException ex) {
            throw AppException.validation(
                    "Invalid month format. Expected YYYY-MM.",
                    List.of(new ApiError.Detail("month", "Must match YYYY-MM (e.g. 2026-11)"))
            );
        }
    }

    private static TimeWindow resolveWindow(CreateBlockRequest request) {
        if (request == null) {
            throw AppException.validation(
                    "Block date range is required",
                    List.of(new ApiError.Detail("startDate", "Provide startDate/endDate or start/end"))
            );
        }

        Instant startAt;
        Instant endAt;
        if (request.startDate() != null || request.endDate() != null) {
            if (request.startDate() == null || request.endDate() == null) {
                throw AppException.validation(
                        "Both startDate and endDate are required",
                        List.of(new ApiError.Detail("endDate", "Provide both startDate and endDate"))
                );
            }
            if (!request.endDate().isAfter(request.startDate())) {
                throw AppException.validation(
                        "End date must be after start date",
                        List.of(new ApiError.Detail("endDate", "Must be after startDate"))
                );
            }
            startAt = GhanaTime.startOfDay(request.startDate());
            endAt = GhanaTime.startOfDay(request.endDate());
        } else if (request.start() != null && request.end() != null) {
            startAt = request.start();
            endAt = request.end();
        } else {
            throw AppException.validation(
                    "Block date range is required",
                    List.of(new ApiError.Detail("start", "Provide startDate/endDate or start/end"))
            );
        }

        validateInstantRange(startAt, endAt);
        return new TimeWindow(startAt, endAt);
    }

    private static void validateInstantRange(Instant startAt, Instant endAt) {
        if (startAt == null || endAt == null || !endAt.isAfter(startAt)) {
            throw AppException.validation(
                    "Block end must be strictly after start",
                    List.of(new ApiError.Detail("end", "Must be after start"))
            );
        }
    }

    private static AvailabilityBlockReason resolveReason(String raw) {
        if (raw == null || raw.isBlank()) {
            return AvailabilityBlockReason.OWNER_BLOCK;
        }
        String normalized = raw.trim().toUpperCase(Locale.ROOT);
        try {
            return AvailabilityBlockReason.valueOf(normalized);
        } catch (IllegalArgumentException ex) {
            throw AppException.validation(
                    "Unsupported availability block reason",
                    List.of(new ApiError.Detail("reason", "Only OWNER_BLOCK is permitted in Release 1"))
            );
        }
    }

    private static boolean isOverlapExclusionViolation(Throwable ex) {
        Throwable cursor = ex;
        while (cursor != null) {
            if (cursor instanceof SQLException sqlEx && PG_EXCLUSION_VIOLATION.equals(sqlEx.getSQLState())) {
                return true;
            }
            String message = cursor.getMessage();
            if (message != null && (message.contains("availability_block_no_overlap")
                    || message.contains("conflicting key value violates exclusion constraint"))) {
                return true;
            }
            cursor = cursor.getCause();
        }
        return false;
    }

    private static AvailabilityBlockView toView(AvailabilityBlock block) {
        return new AvailabilityBlockView(
                block.getId(),
                block.getUnitId(),
                block.getStartAt(),
                block.getEndAt(),
                GhanaTime.dateOf(block.getStartAt()),
                GhanaTime.dateOf(block.getEndAt()),
                block.getReason(),
                block.getCreatedByUserId(),
                block.getCreatedAt()
        );
    }

    private record TimeWindow(Instant startAt, Instant endAt) {
    }
}
