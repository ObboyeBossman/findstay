package com.findstay.shared.id;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.time.Clock;
import java.time.Instant;
import java.util.UUID;

/**
 * UUID version 7 (RFC 9562): a 48-bit millisecond timestamp followed by random bits, so ids
 * sort by creation time. Ids created by one generator instance are strictly increasing, even
 * within the same millisecond or if the clock steps backwards.
 */
@Component
public class UuidV7Generator implements IdGenerator {

    private static final int COUNTER_MAX = 0xFFF; // 12 bits

    private final Clock clock;
    private final SecureRandom random = new SecureRandom();

    private long lastMillis = Long.MIN_VALUE;
    private int counter;

    public UuidV7Generator(Clock clock) {
        this.clock = clock;
    }

    @Override
    public synchronized UUID newId() {
        long now = clock.millis();
        if (now > lastMillis) {
            lastMillis = now;
            counter = random.nextInt(COUNTER_MAX / 2); // start low to leave headroom in this ms
        } else {
            counter++;
            if (counter > COUNTER_MAX) { // more than 4096 ids in one ms: borrow the next ms
                lastMillis++;
                counter = random.nextInt(COUNTER_MAX / 2);
            }
        }

        long mostSignificant = ((lastMillis & 0xFFFF_FFFF_FFFFL) << 16) | 0x7000L | counter;
        long leastSignificant = (random.nextLong() & 0x3FFF_FFFF_FFFF_FFFFL) | 0x8000_0000_0000_0000L;
        return new UUID(mostSignificant, leastSignificant);
    }

    /** When the id was created (millisecond precision). Only valid for UUIDv7 values. */
    public static Instant createdAt(UUID id) {
        if (id.version() != 7) {
            throw new IllegalArgumentException("Not a UUIDv7: " + id);
        }
        return Instant.ofEpochMilli(id.getMostSignificantBits() >>> 16);
    }
}
