/**
 * Acción contextual disponible desde una fila de la tabla.
 *
 * El consumidor declara qué acciones quiere ofrecer; el `DataTableComponent`
 * solo las renderiza en el menú de la fila y emite el `id` cuando el usuario
 * elige una. La lógica de qué hacer con cada acción vive en el consumidor.
 */
export interface RowAction {
  /** Identificador estable que el consumidor usa para discriminar acciones. */
  readonly id: string;
  /** Clave i18n del label visible. */
  readonly labelKey: string;
  /** Clase PrimeIcon, p. ej. `'pi pi-pencil'`. */
  readonly iconClass: string;
  /**
   * Severity opcional para acciones destructivas. La tabla aplica estilos
   * distintos cuando es `'danger'`.
   */
  readonly severity?: 'default' | 'danger';
  /**
   * Función opcional que decide si la acción es visible para una fila
   * concreta. Por defecto, todas las acciones se muestran para toda fila.
   */
  readonly visibleFor?: (row: unknown) => boolean;
}

/** Evento emitido cuando el usuario invoca una acción de fila. */
export interface RowActionInvokedEvent {
  readonly actionId: string;
  readonly row: unknown;
}

/** Evento emitido cuando cambia la paginación. */
export interface PageChangeEvent {
  readonly page: number;
  readonly pageSize: number;
}
