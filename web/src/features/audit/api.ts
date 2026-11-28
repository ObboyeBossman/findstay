import { apiFetch } from '../../lib/api';
import { buildAuditSearchParams } from './format';
import type { AuditFilterParams, AuditLogPageResponse } from './types';

export function fetchAdminAuditLogs(
  accessToken: string,
  filters: AuditFilterParams,
): Promise<AuditLogPageResponse> {
  const { params, error } = buildAuditSearchParams(filters);
  if (error) {
    return Promise.reject(new Error(error));
  }
  return apiFetch<AuditLogPageResponse>(`/admin/audit-logs?${params.toString()}`, {
    accessToken,
  });
}
