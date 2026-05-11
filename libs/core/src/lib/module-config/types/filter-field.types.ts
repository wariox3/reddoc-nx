/**
 * Tipo primitivo soportado por un filtro.
 * El componente de filtro renderiza un control distinto según este valor.
 */
export type FilterFieldType = 'string' | 'number' | 'boolean' | 'date';

/**
 * Descriptor de un campo filtrable de una entidad.
 * Las configs de las entidades declaran un array de estos para que
 * el componente de filtros sepa qué controles renderizar y cómo serializar
 * los valores hacia el backend.
 */
export interface FilterField {
  /** Nombre del campo tal como lo recibe el backend (p. ej. 'numero_identificacion'). */
  readonly name: string;
  /** Clave i18n del label visible para el usuario. */
  readonly displayNameKey: string;
  /** Tipo del valor; determina el control de UI. */
  readonly type: FilterFieldType;
}
