-- ==============================================================================
-- FINDSTAY INITIAL SEED DATA (Takoradi Pilot Context)
-- Comprehensive Accommodation: Hotels, Guesthouses, Serviced Apartments & Hostels
-- BCrypt password for all test accounts is 'Password123!'
-- Hash: $2a$12$e8YkZ7kG2rE5Lh7Q6pX2v.iIqY7N1HwH/rK5nI0h9o9u9mJp7B2.K
-- ==============================================================================

-- 1. Insert Initial Users
INSERT INTO users (email, password_hash, full_name, phone_number, role, is_active, ghana_card_number, student_id_number, institution_name)
VALUES
(
    'guest@findstay.com',
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
    'host@findstay.com',
    '$2a$12$e8YkZ7kG2rE5Lh7Q6pX2v.iIqY7N1HwH/rK5nI0h9o9u9mJp7B2.K',
    'Madam Grace Osei',
    '0209876543',
    'ROLE_LANDLORD',
    TRUE,
    'GHA-987654321-4',
    NULL,
    'Atlantic Hospitality & Properties'
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

-- 2. Insert Diverse Properties in Takoradi Commercial & Residential Hubs
INSERT INTO properties (owner_id, title, description, property_type, address, neighborhood, city, is_verified, is_published, primary_image_url, amenities)
VALUES
(
    2,
    'Atlantic Haven Hotel & Suites',
    'Oceanfront luxury hotel catering to corporate business travelers, offshore energy professionals, and weekend visitors. Features high-speed Wi-Fi, swimming pool, executive conference suites, and fine dining restaurant.',
    'Hotel',
    '12 Ocean Boulevard, Beach Road',
    'Beach Road',
    'Takoradi',
    TRUE,
    TRUE,
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    ARRAY['Swimming Pool', 'Ocean View', 'Wi-Fi', 'Restaurant & Bar', 'Air Conditioning', '24/7 Security', 'Conference Room']
),
(
    2,
    'Oil City Executive Serviced Apartments',
    'Fully furnished 2-bedroom and studio serviced apartments with modern kitchenettes, private balconies, and dedicated parking. Tailored for corporate expatriates, project consultants, and visiting families.',
    'Apartment',
    'Plot 18, Palm Crescent, Westline',
    'Westline',
    'Takoradi',
    TRUE,
    TRUE,
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
    ARRAY['Fitted Kitchen', 'Backup Generator', 'Smart TV', 'Wi-Fi', 'Air Conditioning', 'Free Parking', 'Washing Machine']
),
(
    2,
    'Harbour View Boutique Guesthouse',
    'Charming, quiet heritage guesthouse overlooking Takoradi Harbour. Perfect for business travellers, tourists, and short stays. Complimentary Ghanaian and Continental breakfast included.',
    'Guesthouse',
    '5 Hill Street, Chapel Hill',
    'Chapel Hill',
    'Takoradi',
    TRUE,
    TRUE,
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    ARRAY['Complimentary Breakfast', 'Harbour View', 'Air Conditioning', 'Work Desk', 'Wi-Fi', 'Daily Housekeeping']
),
(
    2,
    'Anaji Royal Student Residency & Hostel',
    'Premier verified student hostel located 8 minutes from TTU campus. Features reliable polytank water reserves, dedicated study rooms, and biometric compound security.',
    'Hostel',
    'Plot 42, Queen of Peace Road, Anaji',
    'Anaji',
    'Takoradi',
    TRUE,
    TRUE,
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
    ARRAY['Water Tank', 'Backup Generator', 'Wi-Fi', 'Security Guard', 'Study Room', 'Shared Kitchen']
),
(
    2,
    'Effia Heritage Lodge & Student Flats',
    'Affordable student flats and self-contain units within walking distance to Takoradi Technical University and Effia-Nkwanta Regional Hospital.',
    'Hostel',
    'Behind ECG Substation, Effia',
    'Effia',
    'Takoradi',
    TRUE,
    TRUE,
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    ARRAY['Water Tank', 'Self-Meter', 'Security Gate', 'Washing Area']
);

-- 3. Insert Units / Rooms across all property types
INSERT INTO units_rooms (property_id, unit_name, room_type, capacity, price_per_night, price_per_month, price_per_semester, status, is_active)
VALUES
-- Atlantic Haven Hotel (Nightly rates)
(1, 'Executive Ocean Deluxe (Suite 201)', 'Executive Suite', 2, 480.00, 11000.00, 0.00, 'AVAILABLE', TRUE),
(1, 'Standard King Deluxe (Room 105)', 'King Deluxe', 2, 350.00, 8500.00, 0.00, 'AVAILABLE', TRUE),

-- Oil City Serviced Apartments (Nightly / Monthly)
(2, '2-Bedroom Luxury Serviced Flat (Apt 3A)', '2-Bedroom Flat', 4, 650.00, 5800.00, 0.00, 'AVAILABLE', TRUE),
(2, 'Executive Studio Suite (Apt 1B)', 'Studio Apartment', 2, 420.00, 3900.00, 0.00, 'AVAILABLE', TRUE),

-- Harbour View Guesthouse (Nightly)
(3, 'Harbour View Queen Room (Room 04)', 'Queen Room', 2, 280.00, 6000.00, 0.00, 'AVAILABLE', TRUE),

-- Anaji Royal Hostel (Monthly / Semester)
(4, 'Master Self-Contain (Room 101)', 'Self-Contain', 1, 0.00, 600.00, 2700.00, 'AVAILABLE', TRUE),
(4, '2-in-1 Shared (Room 102 - Bed A)', '2-in-a-Room', 1, 0.00, 400.00, 1800.00, 'AVAILABLE', TRUE),
(4, '2-in-1 Shared (Room 102 - Bed B)', '2-in-a-Room', 1, 0.00, 400.00, 1800.00, 'AVAILABLE', TRUE),

-- Effia Heritage Lodge (Semester)
(5, 'Block A - Studio Unit 01', 'Self-Contain', 1, 0.00, 550.00, 2500.00, 'AVAILABLE', TRUE),
(5, 'Block A - Studio Unit 02', 'Self-Contain', 1, 0.00, 550.00, 2500.00, 'AVAILABLE', TRUE);
