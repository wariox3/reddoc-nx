import { HttpErrorResponse } from '@angular/common/http';

/** Clasificación de un error HTTP independiente del código numérico. */
export type ApiErrorKind =
  | 'network'
  | 'validation'
  | 'unauthorized'
  | 'forbidden'
  | 'notFound'
  | 'conflict'
  | 'rateLimit'
  | 'client'
  | 'server'
  | 'unknown';

/** Error HTTP normalizado: forma única que entienden interceptor y componentes. */
export interface NormalizedError {
  readonly status: number;
  readonly kind: ApiErrorKind;
  /** Mensaje siempre poblado y seguro para mostrar en un toast. */
  readonly message: string;
  /** Errores por campo del backend: { nombreCampo: ["mensaje"] }. */
  readonly fieldErrors: Record<string, string[]>;
  readonly code: string | null;
  readonly requestId: string | null;
  readonly hasFieldErrors: boolean;
  /** Respuesta original — escape hatch para casos especiales (is_verified, etc.). */
  readonly raw: HttpErrorResponse;
}

/** Clave que DRF usa para errores no asociados a un campo concreto. */
export const NON_FIELD_KEY = 'non_field_errors';

const DEFAULT_MESSAGES: Record<ApiErrorKind, string> = {
  network: 'No se pudo conectar con el servidor.',
  validation: 'Revisa los datos ingresados.',
  unauthorized: 'Tu sesión ha expirado. Inicia sesión nuevamente.',
  forbidden: 'No tienes permisos para realizar esta acción.',
  notFound: 'No se encontró el recurso solicitado.',
  conflict: 'La operación no se pudo completar por un conflicto con el estado actual.',
  rateLimit: 'Has excedido el límite de solicitudes. Intenta de nuevo más tarde.',
  client: 'No se pudo completar la solicitud.',
  server: 'Ocurrió un error inesperado. Intenta de nuevo.',
  unknown: 'Ocurrió un error inesperado. Intenta de nuevo.',
};

/** Claves de nivel raíz que no son campos de validación. */
const RESERVED_KEYS = new Set(['detail', 'success', 'request_id', 'code']);

export function classifyStatus(status: number): ApiErrorKind {
  if (status === 0) return 'network';
  if (status === 400 || status === 422) return 'validation';
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'notFound';
  if (status === 409) return 'conflict';
  if (status === 429) return 'rateLimit';
  if (status >= 400 && status < 500) return 'client';
  if (status >= 500) return 'server';
  return 'unknown';
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

function asStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const strings = value.filter((v): v is string => typeof v === 'string' && v.trim().length > 0);
  return strings.length > 0 ? strings : null;
}

/** Un string de body solo se usa como mensaje si no es una página HTML de error. */
function isSafeBodyString(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= 500 && !trimmed.startsWith('<');
}

/** Recolecta errores por campo de un mapa DRF, aplanando objetos anidados con punto. */
function collectFieldErrors(
  body: Record<string, unknown>,
  target: Record<string, string[]>,
  prefix = '',
  depth = 0,
): void {
  for (const [key, value] of Object.entries(body)) {
    if (depth === 0 && RESERVED_KEYS.has(key)) continue;
    const fullKey = prefix ? `${prefix}.${key}` : key;

    const arr = asStringArray(value);
    if (arr) {
      target[fullKey] = arr;
      continue;
    }
    const single = stringOrNull(value);
    if (single) {
      target[fullKey] = [single];
      continue;
    }
    if (isPlainObject(value) && depth < 2) {
      collectFieldErrors(value, target, fullKey, depth + 1);
    }
  }
}

/** Variante interna que además indica si el mensaje provino del body o de un default. */
export interface InternalNormalizedError extends NormalizedError {
  readonly messageFromBody: boolean;
}

export function normalizeInternal(err: HttpErrorResponse): InternalNormalizedError {
  const status = err.status;
  const kind = classifyStatus(status);
  const fieldErrors: Record<string, string[]> = {};
  let code: string | null = null;
  let requestId: string | null = null;
  let message: string | null = null;

  const finalize = (): InternalNormalizedError => ({
    status,
    kind,
    message: message ?? DEFAULT_MESSAGES[kind],
    fieldErrors,
    code,
    requestId,
    hasFieldErrors: Object.keys(fieldErrors).length > 0,
    raw: err,
    messageFromBody: message !== null,
  });

  // 1 — sin conexión: el body es un ProgressEvent, nunca parseable.
  if (status === 0) return finalize();

  const body: unknown = err.error;

  // 2 — body string plano.
  if (typeof body === 'string') {
    if (isSafeBodyString(body)) message = body.trim();
    return finalize();
  }

  if (body === null || body === undefined) return finalize();

  // 3 — body array de strings.
  if (Array.isArray(body)) {
    const strings = asStringArray(body);
    if (strings) {
      message = strings[0];
      fieldErrors[NON_FIELD_KEY] = strings;
    }
    return finalize();
  }

  if (!isPlainObject(body)) return finalize();

  // 4 — envelope envuelto { success:false, error:{ code, message, ... } }.
  if (body['success'] === false && isPlainObject(body['error'])) {
    const errObj = body['error'];
    code = stringOrNull(errObj['code']);
    message = stringOrNull(errObj['message']);
    requestId = stringOrNull(body['request_id']);
    for (const [key, value] of Object.entries(errObj)) {
      if (key === 'code' || key === 'message') continue;
      const arr = asStringArray(value);
      if (arr) fieldErrors[key] = arr;
    }
    return finalize();
  }

  // 5 — DRF detail (string o array).
  if ('detail' in body) {
    const detail = body['detail'];
    if (typeof detail === 'string') {
      message = stringOrNull(detail);
    } else {
      const arr = asStringArray(detail);
      if (arr) {
        message = arr[0];
        fieldErrors[NON_FIELD_KEY] = arr;
      }
    }
  }

  // 6 — mapa de validación DRF { campo: [...], non_field_errors: [...] }.
  collectFieldErrors(body, fieldErrors);

  // Si aún no hay mensaje, derivarlo de los errores por campo.
  if (message === null) {
    const nonField = fieldErrors[NON_FIELD_KEY];
    if (nonField && nonField.length > 0) {
      message = nonField[0];
    } else {
      const firstKey = Object.keys(fieldErrors)[0];
      if (firstKey) message = fieldErrors[firstKey][0];
    }
  }

  return finalize();
}

/** Normaliza un error HTTP a la forma `NormalizedError`. */
export function normalizeHttpError(err: HttpErrorResponse): NormalizedError {
  const internal = normalizeInternal(err);
  return {
    status: internal.status,
    kind: internal.kind,
    message: internal.message,
    fieldErrors: internal.fieldErrors,
    code: internal.code,
    requestId: internal.requestId,
    hasFieldErrors: internal.hasFieldErrors,
    raw: internal.raw,
  };
}
