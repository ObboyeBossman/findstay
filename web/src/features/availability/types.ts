export type AvailabilityBlockReason = 'OWNER_BLOCK';

export type CalendarDayState = 'AVAILABLE' | 'OWNER_BLOCKED';

export interface CalendarDayItem {
  date: string; // YYYY-MM-DD (Africa/Accra)
  state: CalendarDayState;
  blockId: string | null;
}

export interface AvailabilityBlockItem {
  id: string;
  unitId: string;
  start: string;
  end: string;
  startDate: string; // YYYY-MM-DD (inclusive first blocked night)
  endDate: string; // YYYY-MM-DD (exclusive check-out morning)
  reason: AvailabilityBlockReason;
  createdByUserId: string;
  createdAt: string;
}

export interface AvailabilityCalendarResponse {
  unitId: string;
  propertyId: string;
  unitName: string;
  month: string; // YYYY-MM
  days: CalendarDayItem[];
  blocks: AvailabilityBlockItem[];
}

export interface CreateBlockPayload {
  startDate: string;
  endDate: string;
  reason?: AvailabilityBlockReason;
}
