-- =====================================================================
-- FindStay V1_18 — Takoradi pilot areas and property amenity catalogue
-- Task S1-13-T3 (issue #83).
--
-- Additive and repeatable: fixed UUIDv7 ids and ON CONFLICT DO NOTHING.
-- Existing migrations and reference-list values are never edited here.
-- =====================================================================

-- ---------------------------------------------------------------------
-- listing.area — Takoradi / Sekondi-Takoradi pilot neighbourhoods,
-- campus zones and major local areas. All rows are active.
-- ---------------------------------------------------------------------
INSERT INTO listing.area (id, name, is_active) VALUES
    ('01a1e6cd-a818-7001-bf00-000000000001', 'Beach Road', true),
    ('01a1e6cd-a818-7002-bf00-000000000002', 'Chapel Hill', true),
    ('01a1e6cd-a818-7003-bf00-000000000003', 'Airport Ridge', true),
    ('01a1e6cd-a818-7004-bf00-000000000004', 'Anaji', true),
    ('01a1e6cd-a818-7005-bf00-000000000005', 'Windy Ridge', true),
    ('01a1e6cd-a818-7006-bf00-000000000006', 'Takoradi Market Circle', true),
    ('01a1e6cd-a818-7007-bf00-000000000007', 'Effiakuma', true),
    ('01a1e6cd-a818-7008-bf00-000000000008', 'Kojokrom', true),
    ('01a1e6cd-a818-7009-bf00-000000000009', 'Sekondi', true),
    ('01a1e6cd-a818-700a-bf00-00000000000a', 'Fijai', true),
    ('01a1e6cd-a818-700b-bf00-00000000000b', 'Takoradi Technical University', true),
    ('01a1e6cd-a818-700c-bf00-00000000000c', 'Westline / New Takoradi', true)
ON CONFLICT (name) DO NOTHING;

-- ---------------------------------------------------------------------
-- listing.amenity — Sprint 1 hospitality/stay amenity catalogue.
-- display_order is stable and drives the owner/property picker.
-- ---------------------------------------------------------------------
INSERT INTO listing.amenity (id, code, name, is_active, display_order) VALUES
    ('01a1e6cd-a818-7011-bf00-000000000011', 'WIFI', 'Wi-Fi', true, 1),
    ('01a1e6cd-a818-7012-bf00-000000000012', 'AIR_CONDITIONING', 'Air Conditioning', true, 2),
    ('01a1e6cd-a818-7013-bf00-000000000013', 'BACKUP_POWER', 'Backup Generator / Solar', true, 3),
    ('01a1e6cd-a818-7014-bf00-000000000014', 'RUNNING_WATER', 'Running Water', true, 4),
    ('01a1e6cd-a818-7015-bf00-000000000015', 'FREE_PARKING', 'Free Parking', true, 5),
    ('01a1e6cd-a818-7016-bf00-000000000016', 'SECURITY_24_7', '24/7 Security', true, 6),
    ('01a1e6cd-a818-7017-bf00-000000000017', 'KITCHENETTE', 'Kitchenette', true, 7),
    ('01a1e6cd-a818-7018-bf00-000000000018', 'ENSUITE_BATHROOM', 'En-suite Bathroom', true, 8),
    ('01a1e6cd-a818-7019-bf00-000000000019', 'WORKSPACE', 'Workspace / Desk', true, 9),
    ('01a1e6cd-a818-701a-bf00-00000000001a', 'TV', 'TV', true, 10),
    ('01a1e6cd-a818-701b-bf00-00000000001b', 'LAUNDRY', 'Laundry', true, 11),
    ('01a1e6cd-a818-701c-bf00-00000000001c', 'SWIMMING_POOL', 'Swimming Pool', true, 12),
    ('01a1e6cd-a818-701d-bf00-00000000001d', 'BEACH_ACCESS', 'Beach Access', true, 13)
ON CONFLICT (code) DO NOTHING;

-- ---------------------------------------------------------------------
-- listing.accommodation_type — future hostel types. V1_13 provides the
-- seven confirmed R1 hospitality types. Add agreed hostel categories
-- idempotently here only if they are not already present.
-- ---------------------------------------------------------------------
INSERT INTO listing.accommodation_type (id, code, name, is_active) VALUES
    ('01a1e6cd-a818-7021-bf00-000000000021', 'HOSTEL_ROOM', 'Hostel Room', true),
    ('01a1e6cd-a818-7022-bf00-000000000022', 'HOSTEL_DORM', 'Hostel Dormitory', true),
    ('01a1e6cd-a818-7023-bf00-000000000023', 'PRIVATE_HOSTEL_ROOM', 'Private Hostel Room', true),
    ('01a1e6cd-a818-7024-bf00-000000000024', 'SHARED_HOSTEL_ROOM', 'Shared Hostel Room', true)
ON CONFLICT (code) DO NOTHING;
