import type { Route } from '@angular/router';

/**
 * Rutas del módulo General.
 *
 * Por ahora solo expone la lista placeholder de contactos para validar el flujo
 * sidebar → ruta → componente. Cuando exista `BaseListComponent` y los resolvers
 * de entidad, este archivo cargará el componente base con la entidad inyectada
 * vía resolver.
 */
export const GENERAL_ROUTES: Route[] = [
  {
    path: 'master/contacto/list',
    loadComponent: () =>
      import('./pages/contacto-list-placeholder.component').then(
        (m) => m.ContactoListPlaceholderComponent,
      ),
  },
];
