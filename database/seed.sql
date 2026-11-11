-- ==============================================================================
-- FINDSTAY INITIAL SEED DATA (Takoradi Pilot Context)
-- BCrypt password for all test accounts is 'Password123!'
-- Hash: $2a$12$e8YkZ7kG2rE5Lh7Q6pX2v.iIqY7N1HwH/rK5nI0h9o9u9mJp7B2.K
-- ==============================================================================

-- 1. Insert Initial Users
INSERT INTO users (email, password_hash, full_name, phone_number, role, is_active, ghana_card_number, student_id_number, institution_name)
VALUES
(
    'student@findstay.com',
    '$2a$12$e8YkZ7kG2rE5Lh7Q6pX2v.iIqY7N1HwH/rK5nI0h9o9u9mJp7B2.K',
    'Kwame Mensah',
    '0244123456',
    'ROLE_GUEST',
    TRUE,
    'GHA-712345678-1',
    'TTU/HND/CS/24/042',
    'Takoradi Technical University'
),
(
    'landlord@findstay.com',
    '$2a$12$e8YkZ7kG2rE5Lh7Q6pX2v.iIqY7N1HwH/rK5nI0h9o9u9mJp7B2.K',
    'Madam Grace Osei',
    '0209876543',
    'ROLE_LANDLORD',
    TRUE,
    'GHA-987654321-4',
    NULL,
    NULL
),
(
    'admin@findstay.com',
    '$2a$12$e8YkZ7kG2rE5Lh7Q6pX2v.iIqY7N1HwH/rK5nI0h9o9u9mJp7B2.K',
    'Bossman Abraham (System Admin)',
    '0551122334',
    'ROLE_ADMIN',
    TRUE,
    'GHA-000112233-9',
    NULL,
    'FindStay Platform Operations'
);

-- 2. Insert Properties in Takoradi Suburbs
INSERT INTO properties (owner_id, title, description, property_type, address, neighborhood, city, is_verified, is_published, primary_image_url, amenities)
VALUES
(
    2,
    'Anaji Royal Student Hostel',
    'Modern, secure student accommodation located just 8 minutes drive from TTU main campus. Features reliable polytank water supply and dedicated study desks.',
    'Hostel',
    'Plot 42, Queen of Peace Road, Anaji',
    'Anaji',
    'Takoradi',
    TRUE,
    TRUE,
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
    ARRAY['Water Tank', 'Backup Generator', 'Wi-Fi', 'Security Guard', 'Study Room']
),
(
    2,
    'Effia Heritage Lodge',
    'Serene student-friendly compound within walking distance to Effia-Nkwanta Regional Hospital and nursing colleges. Each room is fully tiled.',
    'Hostel',
    'Behind ECG Substation, Effia',
    'Effia',
    'Takoradi',
    TRUE,
    TRUE,
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    ARRAY['Water Tank', 'Self-Meter', 'Security Gate', 'Washing Area']
),
(
    2,
    'Westline Palms Executive Lodge',
    'Premium shared lodge for working professionals and university seniors. Private balcony and gated paved compound.',
    'Apartment',
    'Beach Road Extension, Westline',
    'Westline',
    'Takoradi',
    TRUE,
    TRUE,
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
    ARRAY['Air Conditioning', 'Wi-Fi', 'Polytank', 'Security Guard', 'Parking']
);

-- 3. Insert Units / Rooms
INSERT INTO units_rooms (property_id, unit_name, room_type, capacity, price_per_month, price_per_semester, status, is_active)
VALUES
(1, 'Room 101 - Master Self-Contain', 'Self-Contain', 1, 600.00, 2700.00, 'AVAILABLE', TRUE),
(1, 'Room 102 - 2 in a Room (Bed A)', '2-in-a-Room', 1, 400.00, 1800.00, 'AVAILABLE', TRUE),
(1, 'Room 102 - 2 in a Room (Bed B)', '2-in-a-Room', 1, 400.00, 1800.00, 'AVAILABLE', TRUE),
(2, 'Block A - Room 1 (Self Contain)', 'Self-Contain', 1, 550.00, 2500.00, 'AVAILABLE', TRUE),
(2, 'Block A - Room 2 (Self Contain)', 'Self-Contain', 1, 550.00, 2500.00, 'AVAILABLE', TRUE),
(3, 'Penthouse Unit 3A', 'Self-Contain', 1, 850.00, 3800.00, 'AVAILABLE', TRUE);
