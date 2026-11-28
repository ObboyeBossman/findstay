export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorName: string | null;
  orgId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface AuditLogPageResponse {
  items: AuditLogEntry[];
  total: number;
  limit: number;
  offset: number;
}

export interface AuditFilterParams {
  actorId?: string;
  action?: string;
  entityType?: string;
  fromDate?: string; // YYYY-MM-DD (Africa/Accra)
  toDate?: string;   // YYYY-MM-DD (Africa/Accra)
  limit?: number;
  offset?: number;
}
