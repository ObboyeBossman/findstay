package com.findstay.availability.internal;

import com.findstay.availability.api.AvailabilityBlockView;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

final class AvailabilityDtos {

    private AvailabilityDtos() {
    }

    record CalendarDayResponse(
            LocalDate date,
            String state,
            UUID blockId
    ) {
    }

    record AvailabilityCalendarResponse(
            UUID unitId,
            UUID propertyId,
            String unitName,
            String month,
            List<CalendarDayResponse> days,
            List<AvailabilityBlockView> blocks
    ) {
    }

    /**
     * Accepts either Ghana calendar dates ({@code startDate}, {@code endDate}, exclusive checkout)
     * or explicit UTC instants ({@code start}, {@code end}) per {@code openapi.yaml}.
     */
    record CreateBlockRequest(
            LocalDate startDate,
            LocalDate endDate,
            Instant start,
            Instant end,
            String reason
    ) {
    }
}
