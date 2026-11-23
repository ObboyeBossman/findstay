package com.findstay.shared;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;

/**
 * Platform Clock utility for UTC timestamp acquisition and Africa/Accra timezone formatting.
 */
@Component
public class Clock {

    public static final ZoneId GHANA_ZONE = ZoneId.of("Africa/Accra");

    public Instant now() {
        return Instant.now();
    }

    public ZoneOffset utc() {
        return ZoneOffset.UTC;
    }

    public ZoneId ghanaZone() {
        return GHANA_ZONE;
    }
}
