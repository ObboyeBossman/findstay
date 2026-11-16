package com.findstay.shared.id;

import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class UuidV7GeneratorTest {

    private static final Instant MOMENT = Instant.parse("2026-11-15T21:17:00.123Z");

    @Test
    void producesVersion7Rfc4122Uuids() {
        UUID id = new UuidV7Generator(Clock.fixed(MOMENT, ZoneOffset.UTC)).newId();
        assertThat(id.version()).isEqualTo(7);
        assertThat(id.variant()).isEqualTo(2);
    }

    @Test
    void embedsTheCreationTime() {
        UUID id = new UuidV7Generator(Clock.fixed(MOMENT, ZoneOffset.UTC)).newId();
        assertThat(UuidV7Generator.createdAt(id)).isEqualTo(MOMENT);
    }

    @Test
    void idsAreStrictlyIncreasingEvenWithinOneMillisecond() {
        UuidV7Generator generator = new UuidV7Generator(Clock.fixed(MOMENT, ZoneOffset.UTC));
        UUID previous = generator.newId();
        Set<UUID> seen = new HashSet<>(Set.of(previous));
        for (int i = 0; i < 10_000; i++) { // more than the 4096 counter values in one millisecond
            UUID next = generator.newId();
            assertThat(compare(next, previous)).isPositive();
            assertThat(seen.add(next)).isTrue();
            previous = next;
        }
    }

    @Test
    void idsStayOrderedIfTheClockStepsBackwards() {
        MutableClock clock = new MutableClock(MOMENT);
        UuidV7Generator generator = new UuidV7Generator(clock);
        UUID first = generator.newId();
        clock.set(MOMENT.minusSeconds(5));
        UUID second = generator.newId();
        assertThat(compare(second, first)).isPositive();
    }

    @Test
    void idsFromLaterMillisecondsSortAfterEarlierOnes() {
        MutableClock clock = new MutableClock(MOMENT);
        UuidV7Generator generator = new UuidV7Generator(clock);
        UUID earlier = generator.newId();
        clock.set(MOMENT.plusMillis(1));
        UUID later = generator.newId();
        assertThat(compare(later, earlier)).isPositive();
    }

    @Test
    void createdAtRejectsOtherUuidVersions() {
        assertThatThrownBy(() -> UuidV7Generator.createdAt(UUID.randomUUID()))
                .isInstanceOf(IllegalArgumentException.class);
    }

    /** Compares as unsigned 128-bit numbers, which is how databases order UUIDs. */
    private static int compare(UUID a, UUID b) {
        int high = Long.compareUnsigned(a.getMostSignificantBits(), b.getMostSignificantBits());
        return high != 0 ? high : Long.compareUnsigned(a.getLeastSignificantBits(), b.getLeastSignificantBits());
    }

    private static final class MutableClock extends Clock {
        private Instant now;

        MutableClock(Instant now) {
            this.now = now;
        }

        void set(Instant now) {
            this.now = now;
        }

        @Override
        public java.time.ZoneId getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(java.time.ZoneId zone) {
            return this;
        }

        @Override
        public Instant instant() {
            return now;
        }
    }
}
