/**
 * Tipos del menú del sidebar declarativo (camino híbrido — ver docs/architecture).
 *
 * El sidebar puede mezclar dos fuentes:
 *   1. Estas estructuras declarativas — controladas en `sidebar-menu.ts`.
 *   2. Acordeones derivados del `ModuleRegistryService` (cuando existan
 *      módulos con documentos en el framework configuracional).
 *
 * Las dos fuentes se traducen a esta misma forma antes de renderizar,
 * así que el template solo conoce `SidebarSection`.
 */

/** Item simple del sidebar (Dashboard, Reportes, etc.). */
export interface SidebarSimpleItem {
  readonly kind: 'item';
  /** Clave i18n del label visible. */
  readonly labelKey: string;
  /** Clase PrimeIcon, p. ej. `'pi pi-th-large'`. */
  readonly iconClass: string;
  /**
   * Path absoluto al que apunta el item, sin el prefijo `/t/<slug>/`.
   * Ej: `'dashboard'` resuelve a `'/t/acme/dashboard'`.
   */
  readonly path: string;
}

/** Item navegable dentro de un grupo de módulo (Contactos, Ítems, etc.). */
export interface SidebarLeafItem {
  readonly labelKey: string;
  /**
   * Path relativo al módulo. Ej: `'contactos'` bajo módulo `'general'`
   * resuelve a `'/t/acme/general/contactos'`.
   */
  readonly path: string;
}

/** Sub-grupo dentro del acordeón de un módulo (Administrador, Documentos, etc.). */
export interface SidebarGroup {
  readonly labelKey: string;
  readonly items: readonly SidebarLeafItem[];
}

/**
 * Acordeón de un módulo en el sidebar. Contiene uno o varios grupos
 * (típicamente "Administrador" para masters y "Documentos" para
 * documentos del framework, cuando existan).
 */
export interface SidebarModuleAccordion {
  readonly kind: 'module';
  /** Identificador del módulo. Prefija las rutas de los items. */
  readonly moduleId: string;
  readonly labelKey: string;
  readonly iconClass: string;
  readonly groups: readonly SidebarGroup[];
}

/** Cualquier entrada de primer nivel del sidebar. */
export type SidebarSection = SidebarSimpleItem | SidebarModuleAccordion;
