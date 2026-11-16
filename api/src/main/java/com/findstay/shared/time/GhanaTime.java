package com.findstay.shared.time;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

/**
 * The one place that knows about Ghana time.
 *
 * <p>Rules for the whole codebase:
 * <ul>
 *   <li><b>Store and pass around</b> moments as {@link Instant} (UTC). Never persist
 *       {@code LocalDateTime} or {@code ZonedDateTime}.</li>
 *   <li><b>Display</b> to people with {@link #display(Instant)}.</li>
 *   <li>Business "days" (daily totals, "today") are Ghana days: use {@link #dateOf(Instant)}
 *       and {@link #startOfDay(LocalDate)}.</li>
 *   <li>Get "now" from the injected {@link java.time.Clock}, never from {@code Instant.now()},
 *       so tests can control time.</li>
 * </ul>
 */
public final class GhanaTime {

    public static final ZoneId ZONE = ZoneId.of("Africa/Accra");

    private static final DateTimeFormatter DATE_TIME =
            DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm", Locale.ENGLISH).withZone(ZONE);
    private static final DateTimeFormatter DATE =
            DateTimeFormatter.ofPattern("dd MMM yyyy", Locale.ENGLISH).withZone(ZONE);

    private GhanaTime() {
    }

    public static ZonedDateTime toGhana(Instant instant) {
        return instant.atZone(ZONE);
    }

    /** e.g. {@code "15 Nov 2026, 21:17"} */
    public static String display(Instant instant) {
        return DATE_TIME.format(instant);
    }

    /** e.g. {@code "15 Nov 2026"} */
    public static String displayDate(Instant instant) {
        return DATE.format(instant);
    }

    /** The Ghana calendar date on which this instant falls. */
    public static LocalDate dateOf(Instant instant) {
        return instant.atZone(ZONE).toLocalDate();
    }

    /** The first instant of a Ghana calendar day. */
    public static Instant startOfDay(LocalDate date) {
        return date.atStartOfDay(ZONE).toInstant();
    }

    /** The first instant of the following Ghana day, i.e. the exclusive end of {@code date}. */
    public static Instant startOfNextDay(LocalDate date) {
        return date.plusDays(1).atStartOfDay(ZONE).toInstant();
    }

    /** Interprets a wall-clock time typed by a person in Ghana as an instant. */
    public static Instant fromGhanaLocal(LocalDateTime localDateTime) {
        return localDateTime.atZone(ZONE).toInstant();
    }
}
