export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

export type ApiErrorDetail = {
  field: string;
  message: string;
};

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: ApiErrorDetail[];

  constructor(
    status: number,
    code: string,
    message: string,
    details: ApiErrorDetail[] = [],
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { accessToken?: string } = {},
): Promise<T> {
  const { accessToken, headers, ...rest } = options;
  const mergedHeaders = new Headers(headers);
  if (!mergedHeaders.has('Content-Type') && rest.body) {
    mergedHeaders.set('Content-Type', 'application/json');
  }
  if (accessToken) {
    mergedHeaders.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: mergedHeaders,
  });

  if (!response.ok) {
    if (response.status === 401 && unauthorizedHandler) {
      unauthorizedHandler();
    }
    let code = 'HTTP_ERROR';
    let message = `Request failed with status ${response.status}`;
    let details: ApiErrorDetail[] = [];
    try {
      const body = (await response.json()) as {
        code?: string;
        message?: string;
        details?: ApiErrorDetail[];
      };
      if (body.code) code = body.code;
      if (body.message) message = body.message;
      if (Array.isArray(body.details)) details = body.details;
    } catch {
      // Response body was empty or non-JSON (e.g. 401 from BearerTokenAuthenticationEntryPoint)
    }
    throw new ApiClientError(response.status, code, message, details);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
