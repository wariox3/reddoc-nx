import type { Route } from '@angular/router';

/**
 * Rutas del master Item del módulo General.
 *
 * Cubre los caminos típicos de un master: listado, alta y edición. Los
 * componentes se cargan lazy para mantener el bundle del master por separado
 * del resto. Las rutas `nuevo`/`editar/:id` se suman con el formulario.
 *
 * URL: `/t/:tenantSlug/general/items[...]`
 */
export const ITEM_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/items-list/items-list.component').then((m) => m.ItemsListComponent),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./pages/item-form/item-form.component').then((m) => m.ItemFormComponent),
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./pages/item-form/item-form.component').then((m) => m.ItemFormComponent),
  },
  {
    path: 'detalle/:id',
    loadComponent: () =>
      import('./pages/item-detail/item-detail.component').then((m) => m.ItemDetailComponent),
  },
];
