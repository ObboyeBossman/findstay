package com.findstay.testing;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/** Database proof for the S1-13-T3 Takoradi reference-data seed. */
@Req("S1-13-T3")
class TakoradiReferenceDataMigrationTest extends AbstractIntegrationTest {

    @Autowired
    private JdbcTemplate jdbc;

    @Test
    void v118AppliesAndAllReferenceRowsAreSeeded() {
        List<Map<String, Object>> history = jdbc.queryForList(
                "SELECT version, success FROM flyway_schema_history ORDER BY installed_rank");

        assertTrue(history.stream().anyMatch(r -> "1.18".equals(String.valueOf(r.get("version")))
                        && Boolean.TRUE.equals(r.get("success"))),
                "V1_18 must apply successfully: " + history);

        assertEquals(12, jdbc.queryForObject(
                "SELECT count(*) FROM listing.area WHERE is_active", Integer.class));
        assertEquals(13, jdbc.queryForObject(
                "SELECT count(*) FROM listing.amenity WHERE is_active", Integer.class));
        assertTrue(jdbc.queryForObject(
                "SELECT count(*) >= 11 FROM listing.accommodation_type WHERE is_active", Boolean.class));

        assertEquals(List.of(
                        "Wi-Fi", "Air Conditioning", "Backup Generator / Solar", "Running Water",
                        "Free Parking", "24/7 Security", "Kitchenette", "En-suite Bathroom",
                        "Workspace / Desk", "TV", "Laundry", "Swimming Pool", "Beach Access"),
                jdbc.queryForList("SELECT name FROM listing.amenity WHERE is_active ORDER BY display_order", String.class));
    }

    @Test
    void v118SeedIsRepeatableWithZeroDuplicates() {
        int areaBefore = jdbc.queryForObject("SELECT count(*) FROM listing.area", Integer.class);
        int amenityBefore = jdbc.queryForObject("SELECT count(*) FROM listing.amenity", Integer.class);
        int typeBefore = jdbc.queryForObject("SELECT count(*) FROM listing.accommodation_type", Integer.class);

        String repeatSeed = """
                INSERT INTO listing.area (id, name, is_active) VALUES
                    ('01a1e6cd-a818-7001-bf00-000000000001', 'Beach Road', true)
                ON CONFLICT (name) DO NOTHING;
                INSERT INTO listing.amenity (id, code, name, is_active, display_order) VALUES
                    ('01a1e6cd-a818-7011-bf00-000000000011', 'WIFI', 'Wi-Fi', true, 1)
                ON CONFLICT (code) DO NOTHING;
                INSERT INTO listing.accommodation_type (id, code, name, is_active) VALUES
                    ('01a1e6cd-a818-7021-bf00-000000000021', 'HOSTEL_ROOM', 'Hostel Room', true)
                ON CONFLICT (code) DO NOTHING;
                """;

        jdbc.update(repeatSeed);

        assertEquals(areaBefore, jdbc.queryForObject("SELECT count(*) FROM listing.area", Integer.class));
        assertEquals(amenityBefore, jdbc.queryForObject("SELECT count(*) FROM listing.amenity", Integer.class));
        assertEquals(typeBefore, jdbc.queryForObject("SELECT count(*) FROM listing.accommodation_type", Integer.class));
    }
}
