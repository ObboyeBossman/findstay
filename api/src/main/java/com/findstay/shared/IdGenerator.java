package com.findstay.shared;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.UUID;

/**
 * UUID generator following the UUIDv7 specification (RFC 9562).
 * Provides time-ordered UUIDs with millisecond-precision timestamps.
 */
public final class IdGenerator {

    private static final SecureRandom RANDOM = new SecureRandom();

    private IdGenerator() {}

    public static UUID newId() {
        long epochMillis = Instant.now().toEpochMilli();
        long msb = (epochMillis << 16) | (0x7000L) | (RANDOM.nextLong() & 0x0FFFL);
        long lsb = (0x8000000000000000L) | (RANDOM.nextLong() & 0x3FFFFFFFFFFFFFFFL);
        return new UUID(msb, lsb);
    }
}
