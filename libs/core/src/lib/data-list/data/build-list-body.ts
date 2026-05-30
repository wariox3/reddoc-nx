import type { FilterCondition, FilterOperator, ListQuery, SortSpec } from './list-query.types';

/**
 * Serialización del `ListQuery` genérico al **body** que esperan los endpoints
 * `POST <recurso>/lista/` del backend (contactos, documentos, demás masters).
 *
 * Forma del body:
 * ```json
 * {
 *   "filtros": [{ "propiedad": "nombre_corto", "operador": "contiene", "valor": "m" }],
 *   "ordenamientos": ["-nombre_corto"],
 *   "pagina": 1,
 *   "tamano_pagina": 25
 * }
 * ```
 *
 * El front trabaja con operadores semánticos (`FilterOperator`); aquí se
 * traducen 1:1 al vocabulario de `operador` que confirmó el backend. Mantener
 * el mapeo centralizado evita que cada servicio invente el suyo.
 */

/**
 * Mapeo de operadores semánticos al string que el backend espera en `operador`.
 * Vocabulario autoritativo confirmado por backend:
 * `=, !=, >, >=, <, <=, contiene, comienza_con, termina_con, in, is_null`.
 */
export const BACKEND_OPERATOR: Readonly<Record<FilterOperator, string>> = {
  eq: '=',
  neq: '!=',
  gt: '>',
  gte: '>=',
  lt: '<',
  lte: '<=',
  contains: 'contiene',
  startsWith: 'comienza_con',
  endsWith: 'termina_con',
  in: 'in',
  isNull: 'is_null',
};

/** Filtro tal como lo espera el backend dentro de `filtros`. */
export interface BackendFilter {
  readonly propiedad: string;
  readonly operador: string;
  readonly valor: string | number | boolean;
}

/** Body completo de `POST <recurso>/lista/`. */
export interface AdvancedListBody {
  readonly filtros: readonly BackendFilter[];
  readonly ordenamientos: readonly string[];
  /** Página 1-based (el `ListQuery` es 0-based; aquí se convierte). */
  readonly pagina: number;
  readonly tamano_pagina: number;
}

/** Traduce un `FilterCondition` genérico al shape `{propiedad, operador, valor}`. */
function toBackendFilter(condition: FilterCondition): BackendFilter {
  return {
    propiedad: condition.field,
    operador: BACKEND_OPERATOR[condition.operator],
    valor: normalizeFilterValue(condition.value),
  };
}

/**
 * `Array.isArray` no estrecha sobre `readonly`, por eso serializamos las listas
 * a CSV de forma explícita; el resto de valores pasa tal cual.
 */
function normalizeFilterValue(value: FilterCondition['value']): string | number | boolean {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  return value.join(',');
}

/** Codifica un `SortSpec` al formato `campo` / `-campo` (desc) del backend. */
function encodeSort(spec: SortSpec): string {
  return spec.direction === 'desc' ? `-${spec.field}` : spec.field;
}

/**
 * Construye el array `filtros` del body.
 * Reutilizable fuera del listado (p. ej. exportación a Excel, que solo necesita
 * los filtros activos).
 */
export function buildFiltros(filters: readonly FilterCondition[]): readonly BackendFilter[] {
  return filters.map(toBackendFilter);
}

/**
 * Construye el array `ordenamientos` del body a partir del orden de la tabla.
 * Respeta el orden de prioridad (multi-columna).
 */
export function buildOrdenamientos(sort: readonly SortSpec[]): readonly string[] {
  return sort.map(encodeSort);
}

/**
 * Arma el body completo de `POST <recurso>/lista/` a partir del `ListQuery`.
 *
 * @param opts.baseFilters Filtros inyectados por el llamador que van **antes**
 *   de los del usuario (p. ej. el `documento_tipo_id` del framework de
 *   documentos). El consumidor no los declara en la UI.
 */
export function buildListBody(
  query: ListQuery,
  opts?: { readonly baseFilters?: readonly FilterCondition[] },
): AdvancedListBody {
  const baseFilters = opts?.baseFilters ?? [];
  return {
    filtros: buildFiltros([...baseFilters, ...query.filters]),
    ordenamientos: buildOrdenamientos(query.sort),
    pagina: query.page + 1,
    tamano_pagina: query.pageSize,
  };
}
