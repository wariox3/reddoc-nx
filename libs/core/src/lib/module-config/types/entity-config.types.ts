import type { Type } from '@angular/core';
import type { ColumnDef } from './column-def.types';
import type { FilterField } from './filter-field.types';

/**
 * Tipo discriminador de las entidades del framework.
 * - `document`: entidad transaccional sobre el endpoint genérico `/documento`
 *   (factura, nota crédito, etc.). Discriminada en el backend por `documentTypeId`.
 * - `master`: entidad maestra con su propio endpoint (contacto, item, etc.).
 *   Es un CRUD estándar sin lógica de inventario.
 * - `utility`: pantalla custom que no es CRUD (configuraciones, importadores
 *   especiales, dashboards de módulo). Se carga vía `loadComponent` lazy.
 */
export type EntityKind = 'document' | 'master' | 'utility';

/**
 * Efecto del documento sobre el inventario.
 * - `inflow`:  aumenta stock (compra, devolución de venta).
 * - `outflow`: disminuye stock (venta, devolución de compra).
 */
export type InventoryEffect = 'inflow' | 'outflow';

/**
 * Capacidades visibles en la UI de una entidad documental.
 * Cada flag es independiente; no hay implicaciones cruzadas.
 *
 * El framework usa estos flags para decidir qué botones renderizar.
 * La declaración aquí indica solo lo que la entidad SOPORTA técnicamente;
 * la visibilidad final también depende de los permisos del usuario.
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
 * Capacidades visibles en la UI de una entidad maestra.
 * Subset de DocumentCapabilities — los masters no tienen "generar" ni "exportar ZIP".
 */
export interface MasterCapabilities {
  readonly canCreate: boolean;
  readonly canEdit: boolean;
  readonly canDelete: boolean;
  readonly canSelectRows: boolean;
  readonly canImport: boolean;
  readonly canExportExcel: boolean;
}

/**
 * Rutas relativas al módulo.
 * El framework las prefija con el path del módulo en runtime para construir
 * la URL completa: `'/t/:slug/<moduloId>/<routeValue>'`.
 *
 * Ej: `list: 'master/contacto/list'` en módulo `general` resuelve a
 * `'/t/acme/general/master/contacto/list'`.
 */
export interface EntityRoutes {
  readonly list: string;
  readonly new: string;
  readonly edit: string;
  readonly detail: string;
}

/**
 * Descriptor de importación masiva opcional para una entidad.
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
 * Base compartida por todas las entidades.
 * Las propiedades aquí son las únicas que el código puede asumir
 * sin hacer narrowing por `kind`.
 */
interface BaseEntityConfig {
  /** Identificador estable que aparece en URLs (kebab-case). Ej: 'factura-compra'. */
  readonly id: string;
  /** Clave i18n del nombre visible. Ej: 'modules.general.entities.contacto.name'. */
  readonly displayNameKey: string;
  /** Endpoint REST de la entidad. */
  readonly endpoint: string;
  /** Columnas a renderizar en la tabla de listado. */
  readonly columns: readonly ColumnDef[];
  /** Campos filtrables disponibles en la UI. */
  readonly filters: readonly FilterField[];
  /** Rutas del CRUD relativas al módulo. */
  readonly routes: EntityRoutes;
  /**
   * Versión del schema. Se usa como sufijo en la clave de localStorage
   * para invalidar filtros guardados cuando el shape cambia.
   * Incrementar siempre que se agreguen/quiten campos en `filters`.
   */
  readonly schemaVersion: number;
}

/**
 * Configuración de una entidad documental (transaccional).
 * Vive sobre el endpoint genérico del backend y se discrimina por `documentTypeId`.
 */
export interface DocumentEntityConfig extends BaseEntityConfig {
  readonly kind: 'document';
  /** Discriminador para el backend genérico. Único across todo el ERP. */
  readonly documentTypeId: number;
  /** Efecto sobre el inventario. */
  readonly inventoryEffect: InventoryEffect;
  readonly capabilities: DocumentCapabilities;
  /**
   * Ids de strategies que la entidad puede ejecutar como acciones extras.
   * Cada id debe corresponder a un `EntityActionStrategy` registrado como provider.
   */
  readonly extraActionIds?: readonly string[];
  readonly importDescriptor?: ImportDescriptor;
}

/**
 * Configuración de una entidad maestra (CRUD estándar).
 * Cada master tiene su propio endpoint y NO usa `documentTypeId`.
 */
export interface MasterEntityConfig extends BaseEntityConfig {
  readonly kind: 'master';
  readonly capabilities: MasterCapabilities;
  readonly importDescriptor?: ImportDescriptor;
}

/**
 * Pantalla custom dentro de un módulo que no es un CRUD.
 * El framework solo se encarga de listarla en el menú y cargarla lazy.
 * Toda la lógica vive en el componente apuntado por `loadComponent`.
 */
export interface UtilityEntityConfig {
  readonly kind: 'utility';
  readonly id: string;
  readonly displayNameKey: string;
  readonly loadComponent: () => Promise<Type<unknown>>;
}

/**
 * Unión discriminada por `kind`.
 * TypeScript hace narrowing automático cuando se ramifica sobre `entity.kind`.
 */
export type EntityConfig = DocumentEntityConfig | MasterEntityConfig | UtilityEntityConfig;
