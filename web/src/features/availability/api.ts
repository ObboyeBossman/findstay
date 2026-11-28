import { apiFetch } from '../../lib/api';
import type {
  AvailabilityBlockItem,
  AvailabilityCalendarResponse,
  CreateBlockPayload,
} from './types';

export function fetchUnitAvailability(
  accessToken: string,
  unitId: string,
  month: string,
): Promise<AvailabilityCalendarResponse> {
  const query = new URLSearchParams({ month }).toString();
  return apiFetch<AvailabilityCalendarResponse>(
    `/owner/units/${encodeURIComponent(unitId)}/availability?${query}`,
    { accessToken },
  );
}

export function createUnitAvailabilityBlock(
  accessToken: string,
  unitId: string,
  payload: CreateBlockPayload,
): Promise<AvailabilityBlockItem> {
  return apiFetch<AvailabilityBlockItem>(
    `/owner/units/${encodeURIComponent(unitId)}/blocks`,
    {
      method: 'POST',
      accessToken,
      body: JSON.stringify(payload),
    },
  );
}

export function deleteUnitAvailabilityBlock(
  accessToken: string,
  unitId: string,
  blockId: string,
): Promise<void> {
  return apiFetch<void>(
    `/owner/units/${encodeURIComponent(unitId)}/blocks/${encodeURIComponent(blockId)}`,
    {
      method: 'DELETE',
      accessToken,
    },
  );
}
