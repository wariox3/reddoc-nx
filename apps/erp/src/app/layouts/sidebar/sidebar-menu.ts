import type { SidebarSection } from './sidebar-menu.types';

/**
 * Estructura declarativa del sidebar del workspace.
 *
 * **Cómo agregar un item de primer nivel** (Dashboard, Reportes, etc.):
 *   Agregar una entrada `{ kind: 'item', labelKey, iconClass, path }`.
 *
 * **Cómo agregar un master nuevo a Administrador**:
 *   Agregar un item al primer grupo del acordeón `administracion` con
 *   `{ labelKey, path }`. El feature debe vivir en su propia carpeta
 *   `apps/erp/src/app/features/<feature>/` y registrar su ruta en
 *   `app.routes.ts`.
 *
 * **Cómo agregar un módulo con documentos** (camino A):
 *   Crear el `ModuleConfig`, registrarlo en `ERP_MODULE_REGISTRY` y agregar
 *   acá un `SidebarAccordion` que liste sus documentos. (En el futuro
 *   podemos derivar este acordeón automáticamente del registry).
 */
export const SIDEBAR_MENU: readonly SidebarSection[] = [
  {
    kind: 'item',
    labelKey: 'layout.nav.dashboard',
    iconClass: 'pi pi-th-large',
    path: 'dashboard',
  },
  {
    kind: 'accordion',
    id: 'administracion',
    labelKey: 'layout.nav.sections.master',
    iconClass: 'pi pi-folder',
    groups: [
      {
        // Sin labelKey: los items van directos sin sub-header.
        items: [{ labelKey: 'entities.contacto.name', path: 'contactos' }],
      },
    ],
  },
];
