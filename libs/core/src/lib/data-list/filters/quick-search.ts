import type { FilterCondition } from '../data/list-query.types';

/**
 * Convierte un término de **búsqueda rápida** (input del toolbar) en una
 * condición de filtro `contiene` sobre un campo concreto.
 *
 * La búsqueda rápida no usa un endpoint/param aparte: reaprovecha el mecanismo
 * de filtros del listado (`POST /lista/` con `{ filtros: [...] }`). El host la
 * combina con los filtros avanzados activos antes de armar el body, así que
 * "buscar nombre = sebastián" viaja como un filtro más.
 *
 * @param field campo del backend sobre el que se busca (p. ej. `'nombre_corto'`).
 * @param term  texto escrito por el usuario.
 * @returns la condición `contiene`, o `null` si el término está vacío (no filtra).
 *
 * @example
 * quickSearchCondition('nombre_corto', 'sebastian')
 * // → { field: 'nombre_corto', operator: 'contains', value: 'sebastian' }
 * quickSearchCondition('nombre_corto', '   ') // → null
 */
export function quickSearchCondition(field: string, term: string): FilterCondition | null {
  const value = term.trim();
  return value ? { field, operator: 'contains', value } : null;
}
