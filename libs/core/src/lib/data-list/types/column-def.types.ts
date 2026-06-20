/**
 * Tipo de valor de una columna. Determina el formateo en la tabla.
 *
 * - `text`:     string crudo
 * - `number`:   número con formato local
 * - `currency`: número con símbolo de moneda
 * - `date`:     fecha formateada (acepta ISO o Date)
 * - `boolean`:  badge sí/no
 * - `enum`:     valor traducido via clave i18n (`enumKeyPrefix.<value>`)
 */
export type ColumnValueType = 'text' | 'number' | 'currency' | 'date' | 'boolean' | 'enum';

/** Alineación horizontal del contenido de la columna. */
export type ColumnAlignment = 'left' | 'center' | 'right';

/**
 * Descriptor de una columna de la tabla.
 *
 * Cualquier consumidor (un documento del framework via `BaseDocumentListComponent`,
 * o una página de master via `<lib-data-table>` directo) declara su lista de
 * columnas y la tabla itera sobre ellas para renderizar header + celda según
 * el `type`.
 */
export interface ColumnDef {
  /** Nombre del campo en el row (acceso por `row[field]`). */
  readonly field: string;
  /** Clave i18n del título de la columna. */
  readonly headerKey: string;
  /** Tipo del valor — controla el formateo. */
  readonly type: ColumnValueType;
  /** Ancho CSS opcional (p. ej. `'120px'`, `'10rem'`). */
  readonly width?: string;
  /** Si la columna soporta ordenamiento desde el header. */
  readonly sortable?: boolean;
  /** Alineación horizontal. Default: `'left'`. */
  readonly align?: ColumnAlignment;
  /**
   * Para `type === 'enum'`: prefijo i18n para resolver el label visible.
   * El valor final se busca como `${enumKeyPrefix}.${row[field]}`.
   */
  readonly enumKeyPrefix?: string;
  /**
   * Para `type === 'boolean'`: prefijo i18n para resolver los labels de
   * verdadero y falso. Default: `'common.boolean'`.
   * Resuelve `${prefix}.true` y `${prefix}.false` del diccionario activo.
   * Permite personalizar por columna: `'common.boolAccepted'` → "Aceptado/Rechazado".
   */
  readonly booleanKeyPrefix?: string;
}
