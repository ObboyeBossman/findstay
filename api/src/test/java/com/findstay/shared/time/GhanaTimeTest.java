package com.findstay.shared.time;

import com.findstay.testing.Req;

import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;

@Req("S1-01-T7")
class GhanaTimeTest {

    private static final Instant MOMENT = Instant.parse("2026-11-15T21:17:00Z");

    @Test
    void zoneIsAccra() {
        assertThat(GhanaTime.ZONE.getId()).isEqualTo("Africa/Accra");
    }

    @Test
    void displaysInGhanaTime() {
        assertThat(GhanaTime.display(MOMENT)).isEqualTo("15 Nov 2026, 21:17");
        assertThat(GhanaTime.displayDate(MOMENT)).isEqualTo("15 Nov 2026");
        assertThat(GhanaTime.toGhana(MOMENT).getZone()).isEqualTo(GhanaTime.ZONE);
    }

    @Test
    void ghanaDayBoundariesAreInstants() {
        LocalDate day = LocalDate.of(2026, 11, 15);
        assertThat(GhanaTime.dateOf(MOMENT)).isEqualTo(day);
        assertThat(GhanaTime.startOfDay(day)).isEqualTo(Instant.parse("2026-11-15T00:00:00Z"));
        assertThat(GhanaTime.startOfNextDay(day)).isEqualTo(Instant.parse("2026-11-16T00:00:00Z"));
    }

    @Test
    void lastSecondOfTheDayStaysInThatDay() {
        Instant lastSecond = Instant.parse("2026-11-15T23:59:59Z");
        assertThat(GhanaTime.dateOf(lastSecond)).isEqualTo(LocalDate.of(2026, 11, 15));
        assertThat(GhanaTime.dateOf(lastSecond.plusSeconds(1))).isEqualTo(LocalDate.of(2026, 11, 16));
    }

    @Test
    void localWallClockTimeBecomesAnInstant() {
        assertThat(GhanaTime.fromGhanaLocal(LocalDateTime.of(2026, 11, 15, 9, 30)))
                .isEqualTo(Instant.parse("2026-11-15T09:30:00Z"));
    }

    @Test
    void ghanaHasNoDaylightSavingSoOffsetIsAlwaysZero() {
        assertThat(GhanaTime.toGhana(Instant.parse("2026-01-01T12:00:00Z")).getOffset()).isEqualTo(ZoneOffset.UTC);
        assertThat(GhanaTime.toGhana(Instant.parse("2026-07-01T12:00:00Z")).getOffset()).isEqualTo(ZoneOffset.UTC);
    }
}
