-- ==============================================================================
-- FINDSTAY RELATIONAL DATABASE SCHEMA (PostgreSQL 15+)
-- Pilot Context: Sekondi-Takoradi Metropolitan Area, Ghana
-- Course: Advanced Java Programming Capstone
-- ==============================================================================

-- Drop existing tables and types if re-initializing
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS units_rooms CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS user_role_enum CASCADE;
DROP TYPE IF EXISTS unit_status_enum CASCADE;
DROP TYPE IF EXISTS booking_status_enum CASCADE;
DROP TYPE IF EXISTS payment_status_enum CASCADE;
DROP TYPE IF EXISTS momo_network_enum CASCADE;

-- 1. ENUMS
CREATE TYPE user_role_enum AS ENUM ('ROLE_GUEST', 'ROLE_LANDLORD', 'ROLE_ADMIN');
CREATE TYPE unit_status_enum AS ENUM ('AVAILABLE', 'HELD', 'BOOKED', 'MAINTENANCE');
CREATE TYPE booking_status_enum AS ENUM ('PENDING', 'HELD', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED');
CREATE TYPE payment_status_enum AS ENUM ('PENDING', 'SUCCESSFUL', 'FAILED', 'REFUNDED');
CREATE TYPE momo_network_enum AS ENUM ('MTN', 'TELECEL', 'AT', 'CARD');

-- 2. USERS TABLE
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    role user_role_enum NOT NULL DEFAULT 'ROLE_GUEST',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    ghana_card_number VARCHAR(30) UNIQUE,
    student_id_number VARCHAR(30),
    institution_name VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. PROPERTIES TABLE
CREATE TABLE properties (
    id BIGSERIAL PRIMARY KEY,
    owner_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    property_type VARCHAR(50) NOT NULL DEFAULT 'Hostel',
    address VARCHAR(255) NOT NULL,
    neighborhood VARCHAR(100) NOT NULL, -- e.g., 'Anaji', 'Effia', 'Beach Road', 'Westline'
    city VARCHAR(100) NOT NULL DEFAULT 'Takoradi',
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    primary_image_url VARCHAR(500),
    gallery_urls TEXT[], -- Array of Cloudinary CDN image URLs
    amenities TEXT[],    -- e.g., ['Water Tank', 'Backup Generator', 'Wi-Fi', 'Security Guard']
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. UNITS / ROOMS TABLE (Parent-child hierarchy for hostel units)
CREATE TABLE units_rooms (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    unit_name VARCHAR(100) NOT NULL, -- e.g., 'Room 104 - 2 in 1', 'Block B - Self Contain'
    room_type VARCHAR(50) NOT NULL,  -- 'Self-Contain', '2-in-a-Room', '4-in-a-Room'
    capacity INTEGER NOT NULL DEFAULT 1,
    price_per_night NUMERIC(10, 2) DEFAULT 0.00,
    price_per_month NUMERIC(10, 2) NOT NULL,
    price_per_semester NUMERIC(10, 2) NOT NULL,
    status unit_status_enum NOT NULL DEFAULT 'AVAILABLE',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. BOOKINGS TABLE (Central Reservation State Machine)
CREATE TABLE bookings (
    id BIGSERIAL PRIMARY KEY,
    reference_code VARCHAR(36) NOT NULL UNIQUE, -- UUID booking reference
    unit_id BIGINT NOT NULL REFERENCES units_rooms(id) ON DELETE RESTRICT,
    guest_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    total_amount_ghs NUMERIC(10, 2) NOT NULL,
    platform_fee_ghs NUMERIC(10, 2) NOT NULL, -- 5% FindStay Commission
    landlord_payout_ghs NUMERIC(10, 2) NOT NULL,
    status booking_status_enum NOT NULL DEFAULT 'PENDING',
    expires_at TIMESTAMP WITH TIME ZONE, -- 15-minute countdown during checkout
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_booking_dates CHECK (check_out_date > check_in_date)
);

-- 6. PAYMENTS TABLE (Immutable Financial Ledger)
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
    paystack_reference VARCHAR(100) NOT NULL UNIQUE,
    amount_ghs NUMERIC(10, 2) NOT NULL,
    paystack_fee_ghs NUMERIC(10, 2) DEFAULT 0.00,
    net_platform_revenue_ghs NUMERIC(10, 2) DEFAULT 0.00,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'Mobile Money',
    momo_network momo_network_enum NOT NULL DEFAULT 'MTN',
    momo_number VARCHAR(20) NOT NULL,
    status payment_status_enum NOT NULL DEFAULT 'PENDING',
    raw_webhook_payload JSONB,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. REVIEWS & RATINGS TABLE
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE RESTRICT,
    property_id BIGINT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    guest_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. AUDIT LOGS TABLE (Ghana Data Protection Act 2012 / Act 843 Compliance)
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- e.g., 'VERIFY_LANDLORD', 'REFUND_BOOKING', 'ADMIN_LOGIN'
    entity_name VARCHAR(100) NOT NULL,
    entity_id BIGINT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- INDEXES FOR SUB-MILLISECOND QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_properties_city_neighborhood ON properties(city, neighborhood);
CREATE INDEX idx_properties_owner ON properties(owner_id);
CREATE INDEX idx_units_property_status ON units_rooms(property_id, status);
CREATE INDEX idx_bookings_unit_status ON bookings(unit_id, status);
CREATE INDEX idx_bookings_guest ON bookings(guest_id);
CREATE INDEX idx_bookings_reference ON bookings(reference_code);
CREATE INDEX idx_payments_paystack_ref ON payments(paystack_reference);
CREATE INDEX idx_audit_logs_user_action ON audit_logs(user_id, action);

-- ==============================================================================
-- AUTOMATIC updated_at TRIGGER FUNCTION
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

CREATE TRIGGER trg_properties_updated_at BEFORE UPDATE ON properties
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

CREATE TRIGGER trg_units_updated_at BEFORE UPDATE ON units_rooms
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

CREATE TRIGGER trg_bookings_updated_at BEFORE UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();
