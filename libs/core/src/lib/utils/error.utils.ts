import { HttpErrorResponse } from '@angular/common/http';
import { normalizeInternal } from './error-normalizer';

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

/**
 * @deprecated Usa `normalizeHttpError` de `./error-normalizer`, que entiende todos los
 * formatos de error del backend (envelope envuelto, DRF, detail, string plano).
 */
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

/**
 * Extrae un mensaje legible de un error HTTP. Si el body no trae un mensaje real,
 * retorna el `fallback` provisto por el caller.
 */
export function extractErrorMessage(err: unknown, fallback: string): string {
  if (!(err instanceof HttpErrorResponse)) return fallback;
  const { message, messageFromBody } = normalizeInternal(err);
  return messageFromBody ? message : fallback;
}
