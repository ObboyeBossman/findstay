package com.findstay.shared.id;

import java.util.UUID;

/**
 * Creates identifiers for new records. Inject this instead of calling {@code UUID.randomUUID()}
 * so every table gets time-ordered ids (friendly to database indexes) and tests can substitute
 * a predictable generator.
 */
public interface IdGenerator {

    UUID newId();
}
