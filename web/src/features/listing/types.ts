export type PropertyStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'CORRECTIONS_REQUESTED'
  | 'ACTIVE'
  | 'PAUSED'
  | 'SUSPENDED'
  | 'REJECTED';

export interface ReferenceOption {
  id: string;
  code: string;
  name: string;
}

export interface AreaOption {
  id: string;
  name: string;
}

export interface AmenityOption {
  id: string;
  code: string;
  name: string;
  displayOrder: number;
}

export interface CatalogReferenceResponse {
  accommodationTypes: ReferenceOption[];
  areas: AreaOption[];
  amenities: AmenityOption[];
  billingPeriods: ReferenceOption[];
}

export interface UnitResponse {
  id: string;
  propertyId: string;
  name: string;
  category: string | null;
  maxGuests: number;
  quantity: number;
  nightlyRatePesewas: number;
  currency: string;
}

export interface PropertyPhotoResponse {
  documentId: string;
  assetId: string;
  publicUrl: string | null;
  position: number;
  isCover: boolean;
}

export interface StatusHistoryItem {
  fromStatus: string | null;
  toStatus: string;
  reason: string | null;
  createdAt: string;
}

export interface PropertyDetailResponse {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  accommodationTypeCode: string | null;
  accommodationTypeName: string | null;
  town: string;
  areaId: string | null;
  areaName: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  houseRules: string | null;
  status: PropertyStatus;
  amenityCodes: string[];
  units: UnitResponse[];
  photos: PropertyPhotoResponse[];
  fromPricePesewas: number | null;
  currency: string;
  missingForSubmission: string[];
  statusHistory: StatusHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface PropertyListItemResponse {
  id: string;
  name: string;
  accommodationTypeCode: string | null;
  accommodationTypeName: string | null;
  town: string;
  areaName: string | null;
  status: PropertyStatus;
  unitCount: number;
  fromPricePesewas: number | null;
  currency: string;
  coverPhotoUrl: string | null;
  readyToSubmit: boolean;
  updatedAt: string;
}

export interface PublicPropertyDetailResponse {
  propertyId: string;
  name: string;
  description: string | null;
  accommodationTypeCode: string | null;
  accommodationTypeName: string | null;
  town: string;
  areaName: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  amenityCodes: string[];
  houseRules: string | null;
  coverPhotoUrl: string | null;
  fromPricePesewas: number | null;
  currency: string;
  ownerVerified: boolean;
  status: string;
  units: UnitResponse[];
  photos: PropertyPhotoResponse[];
  publishedAt: string | null;
}

export interface CreatePropertyPayload {
  name: string;
  accommodationTypeCode: string;
  town: string;
  areaId?: string | null;
  address?: string | null;
  description?: string | null;
  houseRules?: string | null;
  amenityCodes?: string[];
}

export interface UpdatePropertyPayload {
  name?: string;
  accommodationTypeCode?: string;
  town?: string;
  areaId?: string | null;
  address?: string;
  latitude?: number | null;
  longitude?: number | null;
  description?: string;
  houseRules?: string;
  amenityCodes?: string[];
}

export interface CreateUnitPayload {
  name: string;
  category?: string;
  maxGuests: number;
  quantity: number;
  nightlyRatePesewas: number;
}

export interface UpdateUnitPayload {
  name?: string;
  category?: string;
  maxGuests?: number;
  quantity?: number;
  nightlyRatePesewas?: number;
}

export interface PhotoOrderItemPayload {
  documentId: string;
  position: number;
  isCover: boolean;
}
