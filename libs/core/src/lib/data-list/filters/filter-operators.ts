import type { FilterFieldType } from '../types/filter-field.types';
import type { FilterOperator } from '../data/list-query.types';

/**
 * Catálogo declarativo de operadores de filtro por tipo de campo.
 *
 * Es la **fuente única de verdad** que consume el constructor de filtros (UI):
 * para un campo de tipo `string` ofrece "contiene/es/comienza con/…", para
 * `boolean` ofrece "es Sí/es No", etc. Es agnóstico de app y de transporte; la
 * traducción del `operator` semántico al string que espera el backend vive en
 * `build-list-body.ts` (`BACKEND_OPERATOR`).
 *
 * Para escalar a un tipo o un operador nuevo, basta tocar este catálogo y su
 * mapeo backend — ni la UI ni los hosts necesitan cambios.
 */

/**
 * Control de valor que el constructor de filtros debe renderizar para un
 * operador.
 *  - `'text' | 'number' | 'date'`: input del tipo correspondiente.
 *  - `'none'`: el operador no toma valor del usuario; el valor enviado al
 *    backend es `fixedValue` (p. ej. `is_null=true` para "está vacío", o
 *    `=true` para un booleano "es Sí").
 */
export type FilterValueKind = 'text' | 'number' | 'date' | 'none';

/**
 * Definición de un operador disponible en el constructor de filtros.
 *
 * `id` es estable dentro de un tipo (no global) y es lo que la UI usa como
 * valor del selector de operador. Varios `id` pueden mapear al mismo
 * `operator` semántico con distinto `fixedValue` (p. ej. "está vacío" y
 * "no está vacío" mapean ambos a `isNull`).
 */
export interface FilterOperatorDef {
  /** Identificador del operador en la UI (único dentro de su tipo de campo). */
  readonly id: string;
  /** Operador semántico que se mapea 1:1 al DSL del backend. */
  readonly operator: FilterOperator;
  /** Clave i18n del label visible (p. ej. `common.filters.operators.contiene`). */
  readonly labelKey: string;
  /** Qué control de valor renderizar; `'none'` ⇒ usa `fixedValue`. */
  readonly valueKind: FilterValueKind;
  /** Valor fijo enviado cuando `valueKind === 'none'` (booleanos / is_null). */
  readonly fixedValue?: boolean;
}

const OPERATORS_PREFIX = 'common.filters.operators';

/** Operadores comunes a campos comparables (number / date). */
const COMPARISON_OPERATORS = (valueKind: 'number' | 'date'): readonly FilterOperatorDef[] => [
  { id: 'es', operator: 'eq', labelKey: `${OPERATORS_PREFIX}.es`, valueKind },
  { id: 'noEs', operator: 'neq', labelKey: `${OPERATORS_PREFIX}.noEs`, valueKind },
  { id: 'mayor', operator: 'gt', labelKey: `${OPERATORS_PREFIX}.mayor`, valueKind },
  { id: 'mayorIgual', operator: 'gte', labelKey: `${OPERATORS_PREFIX}.mayorIgual`, valueKind },
  { id: 'menor', operator: 'lt', labelKey: `${OPERATORS_PREFIX}.menor`, valueKind },
  { id: 'menorIgual', operator: 'lte', labelKey: `${OPERATORS_PREFIX}.menorIgual`, valueKind },
  {
    id: 'vacio',
    operator: 'isNull',
    labelKey: `${OPERATORS_PREFIX}.vacio`,
    valueKind: 'none',
    fixedValue: true,
  },
  {
    id: 'noVacio',
    operator: 'isNull',
    labelKey: `${OPERATORS_PREFIX}.noVacio`,
    valueKind: 'none',
    fixedValue: false,
  },
];

/**
 * Operadores disponibles por tipo de campo.
 *
 * `readonly` y congelado: es configuración compartida, no debe mutarse en runtime.
 */
export const FILTER_OPERATORS: Readonly<Record<FilterFieldType, readonly FilterOperatorDef[]>> = {
  string: [
    {
      id: 'contiene',
      operator: 'contains',
      labelKey: `${OPERATORS_PREFIX}.contiene`,
      valueKind: 'text',
    },
    { id: 'es', operator: 'eq', labelKey: `${OPERATORS_PREFIX}.es`, valueKind: 'text' },
    { id: 'noEs', operator: 'neq', labelKey: `${OPERATORS_PREFIX}.noEs`, valueKind: 'text' },
    {
      id: 'comienzaCon',
      operator: 'startsWith',
      labelKey: `${OPERATORS_PREFIX}.comienzaCon`,
      valueKind: 'text',
    },
    {
      id: 'terminaCon',
      operator: 'endsWith',
      labelKey: `${OPERATORS_PREFIX}.terminaCon`,
      valueKind: 'text',
    },
    {
      id: 'vacio',
      operator: 'isNull',
      labelKey: `${OPERATORS_PREFIX}.vacio`,
      valueKind: 'none',
      fixedValue: true,
    },
    {
      id: 'noVacio',
      operator: 'isNull',
      labelKey: `${OPERATORS_PREFIX}.noVacio`,
      valueKind: 'none',
      fixedValue: false,
    },
  ],
  number: COMPARISON_OPERATORS('number'),
  date: COMPARISON_OPERATORS('date'),
  boolean: [
    {
      id: 'esVerdadero',
      operator: 'eq',
      labelKey: `${OPERATORS_PREFIX}.esVerdadero`,
      valueKind: 'none',
      fixedValue: true,
    },
    {
      id: 'esFalso',
      operator: 'eq',
      labelKey: `${OPERATORS_PREFIX}.esFalso`,
      valueKind: 'none',
      fixedValue: false,
    },
  ],
};

/** Operadores disponibles para un tipo de campo (array vacío si el tipo no existe). */
export function getOperatorsForType(type: FilterFieldType): readonly FilterOperatorDef[] {
  return FILTER_OPERATORS[type] ?? [];
}

/** Resuelve un operador por su `id` dentro de un tipo; `undefined` si no existe. */
export function getOperatorDef(type: FilterFieldType, id: string): FilterOperatorDef | undefined {
  return getOperatorsForType(type).find((def) => def.id === id);
}
