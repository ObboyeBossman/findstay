import { apiFetch } from '../../lib/api';
import type {
  CatalogReferenceResponse,
  CreatePropertyPayload,
  CreateUnitPayload,
  PhotoOrderItemPayload,
  PropertyDetailResponse,
  PropertyListItemResponse,
  PropertyPhotoResponse,
  PublicPropertyDetailResponse,
  UnitResponse,
  UpdatePropertyPayload,
  UpdateUnitPayload,
} from './types';

export function fetchCatalogReference(): Promise<CatalogReferenceResponse> {
  return apiFetch<CatalogReferenceResponse>('/catalog/reference');
}

export function fetchOwnerProperties(accessToken: string): Promise<PropertyListItemResponse[]> {
  return apiFetch<PropertyListItemResponse[]>('/owner/properties', { accessToken });
}

export function createOwnerProperty(
  accessToken: string,
  payload: CreatePropertyPayload,
): Promise<PropertyDetailResponse> {
  return apiFetch<PropertyDetailResponse>('/owner/properties', {
    method: 'POST',
    accessToken,
    body: JSON.stringify(payload),
  });
}

export function fetchOwnerPropertyDetail(
  accessToken: string,
  propertyId: string,
): Promise<PropertyDetailResponse> {
  return apiFetch<PropertyDetailResponse>(`/owner/properties/${encodeURIComponent(propertyId)}`, {
    accessToken,
  });
}

export function fetchOwnerPropertyPreview(
  accessToken: string,
  propertyId: string,
): Promise<PublicPropertyDetailResponse> {
  return apiFetch<PublicPropertyDetailResponse>(
    `/owner/properties/${encodeURIComponent(propertyId)}/preview`,
    { accessToken },
  );
}

export function updateOwnerProperty(
  accessToken: string,
  propertyId: string,
  payload: UpdatePropertyPayload,
): Promise<PropertyDetailResponse> {
  return apiFetch<PropertyDetailResponse>(`/owner/properties/${encodeURIComponent(propertyId)}`, {
    method: 'PATCH',
    accessToken,
    body: JSON.stringify(payload),
  });
}

export function addPropertyUnit(
  accessToken: string,
  propertyId: string,
  payload: CreateUnitPayload,
): Promise<UnitResponse> {
  return apiFetch<UnitResponse>(`/owner/properties/${encodeURIComponent(propertyId)}/units`, {
    method: 'POST',
    accessToken,
    body: JSON.stringify(payload),
  });
}

export function updatePropertyUnit(
  accessToken: string,
  propertyId: string,
  unitId: string,
  payload: UpdateUnitPayload,
): Promise<UnitResponse> {
  return apiFetch<UnitResponse>(
    `/owner/properties/${encodeURIComponent(propertyId)}/units/${encodeURIComponent(unitId)}`,
    {
      method: 'PATCH',
      accessToken,
      body: JSON.stringify(payload),
    },
  );
}

export function deletePropertyUnit(
  accessToken: string,
  propertyId: string,
  unitId: string,
): Promise<void> {
  return apiFetch<void>(
    `/owner/properties/${encodeURIComponent(propertyId)}/units/${encodeURIComponent(unitId)}`,
    {
      method: 'DELETE',
      accessToken,
    },
  );
}

export function syncPropertyPhotos(
  accessToken: string,
  propertyId: string,
  photos: PhotoOrderItemPayload[],
): Promise<PropertyPhotoResponse[]> {
  return apiFetch<PropertyPhotoResponse[]>(
    `/owner/properties/${encodeURIComponent(propertyId)}/photos`,
    {
      method: 'PUT',
      accessToken,
      body: JSON.stringify({ photos }),
    },
  );
}

export function removePropertyPhoto(
  accessToken: string,
  propertyId: string,
  documentId: string,
): Promise<void> {
  return apiFetch<void>(
    `/owner/properties/${encodeURIComponent(propertyId)}/photos/${encodeURIComponent(documentId)}`,
    {
      method: 'DELETE',
      accessToken,
    },
  );
}

export function submitOwnerProperty(
  accessToken: string,
  propertyId: string,
): Promise<PropertyDetailResponse> {
  return apiFetch<PropertyDetailResponse>(
    `/owner/properties/${encodeURIComponent(propertyId)}/submit`,
    {
      method: 'POST',
      accessToken,
    },
  );
}

export function pauseOwnerProperty(
  accessToken: string,
  propertyId: string,
): Promise<PropertyDetailResponse> {
  return apiFetch<PropertyDetailResponse>(
    `/owner/properties/${encodeURIComponent(propertyId)}/pause`,
    {
      method: 'POST',
      accessToken,
    },
  );
}

export function resumeOwnerProperty(
  accessToken: string,
  propertyId: string,
): Promise<PropertyDetailResponse> {
  return apiFetch<PropertyDetailResponse>(
    `/owner/properties/${encodeURIComponent(propertyId)}/resume`,
    {
      method: 'POST',
      accessToken,
    },
  );
}
