import type { SortMeta } from 'primeng/api';
import type { SortSpec } from '@reddoc/core';

/**
 * Traduce el `multiSortMeta` de PrimeNG (orden multi-columna) al contrato
 * propio `SortSpec[]`. PrimeNG codifica `1` = asc, `-1` = desc.
 *
 * Función pura y aislada del componente para poder testearla sin renderizar
 * la tabla ni cargar PrimeNG en runtime (el import de `SortMeta` es de tipo).
 */
export function multiSortMetaToSpecs(meta: readonly SortMeta[] | null | undefined): SortSpec[] {
  return (meta ?? []).map((m) => ({
    field: m.field,
    direction: m.order === -1 ? 'desc' : 'asc',
  }));
}

/** Igualdad estructural de dos ordenamientos (mismo campo y dirección, en orden). */
export function sortSpecsEqual(a: readonly SortSpec[], b: readonly SortSpec[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((spec, i) => spec.field === b[i].field && spec.direction === b[i].direction);
}
