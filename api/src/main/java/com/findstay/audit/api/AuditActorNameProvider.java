package com.findstay.audit.api;

import java.util.Collection;
import java.util.Map;
import java.util.UUID;

/**
 * Optional SPI implemented by {@code identity} so {@code audit} can enrich actor display names
 * at read time without introducing a circular module dependency ({@code C5}).
 */
public interface AuditActorNameProvider {

    /** Resolves user UUIDs to display labels (full name, falling back to email). */
    Map<UUID, String> resolveDisplayNames(Collection<UUID> userIds);
}
