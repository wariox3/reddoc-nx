import type { SidebarSection } from './sidebar-menu.types';

/**
 * Estructura declarativa del sidebar del workspace.
 *
 * **Cómo agregar un item de primer nivel** (Dashboard, Reportes, etc.):
 *   Agregar una entrada `{ kind: 'item', labelKey, iconClass, path }`.
 *
 * **Cómo agregar un master nuevo a un módulo existente** (camino B):
 *   Buscar el `SidebarModuleAccordion` correspondiente y agregar un item
 *   al grupo "Administrador" (o crear el grupo si no existe).
 *
 * **Cómo agregar un módulo nuevo**:
 *   Crear una entrada `{ kind: 'module', moduleId, labelKey, iconClass, groups }`.
 *
 * Los acordeones de **módulos con documentos** se generan dinámicamente
 * a partir del `MODULE_REGISTRY` cuando existan; no se declaran aquí.
 *
 * Las claves i18n viven en `app.es.ts` / `app.en.ts`. Si la clave no existe,
 * el sidebar mostrará la clave misma como fallback (útil en desarrollo).
 */
export const SIDEBAR_MENU: readonly SidebarSection[] = [
  {
    kind: 'item',
    labelKey: 'layout.nav.dashboard',
    iconClass: 'pi pi-th-large',
    path: 'dashboard',
  },
  {
    kind: 'module',
    moduleId: 'general',
    labelKey: 'modules.general.name',
    iconClass: 'pi pi-cog',
    groups: [
      {
        labelKey: 'layout.nav.sections.master',
        items: [
          {
            labelKey: 'modules.general.entities.contacto.name',
            path: 'contactos',
          },
        ],
      },
    ],
  },
];
