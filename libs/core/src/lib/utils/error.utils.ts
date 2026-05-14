import { HttpErrorResponse } from '@angular/common/http';

export interface ApiError {
  code: string;
  message: string;
  [key: string]: unknown;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiError;
  request_id: string;
}

export function parseApiError(err: HttpErrorResponse): ApiError | null {
  const body = err.error;
  if (
    body &&
    typeof body === 'object' &&
    'success' in body &&
    body.success === false &&
    body.error
  ) {
    return body.error as ApiError;
  }
  return null;
}

export function isUnverifiedAccountError(err: unknown): boolean {
  const httpErr = err as HttpErrorResponse | undefined;
  if (!httpErr?.error) return false;
  if (httpErr.error?.verificado === false) return true;
  if (httpErr.error?.error?.is_verified === false) return true;
  return false;
}

export function extractErrorMessage(err: unknown, fallback: string): string {
  const httpErr = err as HttpErrorResponse | undefined;
  if (httpErr?.error) {
    const apiError = (httpErr.error as ApiErrorResponse)?.error;
    if (apiError?.message) return apiError.message;

    const legacy = httpErr.error as Record<string, unknown>;
    if (typeof legacy['detail'] === 'string') return legacy['detail'];
    if (typeof legacy['message'] === 'string') return legacy['message'];
  }
  return fallback;
}
