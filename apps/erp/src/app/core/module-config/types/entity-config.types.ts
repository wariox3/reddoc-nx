import type { ColumnDef, FilterField } from '@reddoc/core';

/**
 * Tipo discriminador de entidades del framework.
 *
 * En v2.0 el framework configuracional aplica únicamente a **documentos
 * transaccionales** sobre el endpoint genérico. Los masters administrativos
 * viven como features directos fuera de este tipo (ver docs/architecture).
 *
 * El campo se mantiene como discriminador (con una sola variante hoy) para
 * dejar abierta la extensión futura sin breaking changes.
 */
export type EntityKind = 'document';

/**
 * Efecto del documento sobre el inventario.
 * - `inflow`:  aumenta stock (compra, devolución de venta).
 * - `outflow`: disminuye stock (venta, devolución de compra).
 */
export type InventoryEffect = 'inflow' | 'outflow';

/**
 * Capacidades visibles en la UI del documento.
 * Cada flag declara lo que la entidad SOPORTA técnicamente; la visibilidad
 * final también depende de los permisos del usuario.
 */
export interface DocumentCapabilities {
  readonly canCreate: boolean;
  readonly canEdit: boolean;
  readonly canDelete: boolean;
  readonly canSelectRows: boolean;
  readonly canImport: boolean;
  readonly canExportExcel: boolean;
  readonly canExportZip: boolean;
  readonly canGenerate: boolean;
}

/**
 * Rutas relativas al módulo.
 * El framework las prefija con el path del módulo en runtime.
 *
 * Ej: `list: 'documento/factura-compra/list'` en módulo `compra` resuelve
 * a `/t/<slug>/compra/documento/factura-compra/list`.
 */
export interface EntityRoutes {
  readonly list: string;
  readonly new: string;
  readonly edit: string;
  readonly detail: string;
}

/**
 * Descriptor de importación masiva opcional para un documento.
 * Se declara cuando `capabilities.canImport` es true.
 */
export interface ImportDescriptor {
  /** Clave i18n del nombre del archivo de ejemplo. */
  readonly templateNameKey: string;
  /** Ruta absoluta al archivo de ejemplo descargable. */
  readonly templateUrl: string;
  /** Parámetros adicionales que se envían junto al archivo importado. */
  readonly extraPayload?: Readonly<Record<string, string | number | boolean>>;
}

/**
 * Configuración de un documento transaccional.
 *
 * Vive sobre el endpoint genérico del backend y se discrimina por
 * `documentTypeId`. Toda la información que el `BaseDocumentListComponent`,
 * el form y el detalle necesitan vive aquí.
 */
export interface DocumentEntityConfig {
  readonly kind: 'document';
  /** Identificador estable en URLs (kebab-case). Ej: `'factura-compra'`. */
  readonly id: string;
  /** Clave i18n del nombre visible. */
  readonly displayNameKey: string;
  /** Endpoint REST. Para documentos típicamente `'/api/documento'`. */
  readonly endpoint: string;
  /** Discriminador para el backend genérico. Único across todo el ERP. */
  readonly documentTypeId: number;
  /** Efecto sobre el inventario. */
  readonly inventoryEffect: InventoryEffect;
  /**
   * Versión del schema. Se usa como sufijo en la clave de localStorage
   * para invalidar filtros guardados cuando el shape cambia.
   */
  readonly schemaVersion: number;
  readonly columns: readonly ColumnDef[];
  readonly filters: readonly FilterField[];
  readonly routes: EntityRoutes;
  readonly capabilities: DocumentCapabilities;
  /**
   * Ids de strategies que el documento expone como acciones extras.
   * Cada id debe corresponder a un `EntityActionStrategy` registrado.
   */
  readonly extraActionIds?: readonly string[];
  readonly importDescriptor?: ImportDescriptor;
}

/**
 * Alias del único tipo de entidad del framework en v2.0.
 * Se conserva el nombre `EntityConfig` para no romper imports existentes;
 * el discriminador `kind` queda como hook de extensión futura.
 */
export type EntityConfig = DocumentEntityConfig;
