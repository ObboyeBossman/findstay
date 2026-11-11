// ==============================================================================
// FINDSTAY CORE DOMAIN TYPES & DATA CONTRACTS
// Shared across all frontend applications (Site, Guest, Owner, Admin) & Services
// ==============================================================================

export type Role = 'ROLE_GUEST' | 'ROLE_LANDLORD' | 'ROLE_ADMIN';

export type PropertyCategory = 'Hotel' | 'Apartment' | 'Guesthouse' | 'Hostel';

export type UnitStatus = 'AVAILABLE' | 'HELD' | 'BOOKED' | 'MAINTENANCE';

export type BookingStatus = 'PENDING' | 'HELD' | 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'SUCCESSFUL' | 'FAILED' | 'REFUNDED';

export type MoMoNetwork = 'MTN' | 'TELECEL' | 'AT' | 'CARD';

export type RateType = 'NIGHT' | 'MONTH' | 'SEMESTER';

export interface Unit {
  id: number;
  propertyId?: number;
  propertyTitle: string;
  propertyType: PropertyCategory;
  neighborhood: string;
  unitName: string;
  roomType: string;
  rateType: RateType;
  price: number;
  pricePerSemester?: number;
  imageUrl: string;
  amenities: string[];
  isVerified: boolean;
  status?: UnitStatus;
}

export interface Property {
  id: number;
  ownerId: number;
  title: string;
  description: string;
  propertyType: PropertyCategory;
  address: string;
  neighborhood: string;
  city: string;
  isVerified: boolean;
  isPublished: boolean;
  primaryImageUrl: string;
  amenities: string[];
}

export interface Booking {
  id: number;
  referenceCode: string;
  unitId: number;
  guestId: number;
  checkInDate: string;
  checkOutDate: string;
  totalAmountGhs: number;
  platformFeeGhs: number;
  landlordPayoutGhs: number;
  status: BookingStatus;
  expiresAt?: string;
  momoNetwork?: MoMoNetwork;
  momoNumber?: string;
}

export interface LandlordVerification {
  id: number;
  name: string;
  phone: string;
  propertyTitle: string;
  neighborhood: string;
  ghanaCard: string;
  status: 'PENDING_REVIEW' | 'VERIFIED';
}

export interface AuditLogEntry {
  timestamp: string;
  action: string;
  actor: string;
  details: string;
  status: 'OK' | 'FAILED' | 'ALERT';
}
