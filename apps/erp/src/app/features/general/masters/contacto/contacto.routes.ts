import type { Route } from '@angular/router';

/**
 * Rutas del master Contacto del módulo General.
 *
 * Cubre los 4 caminos típicos de un master: listado, alta, edición, detalle.
 * Por ahora solo la lista está implementada — los demás se agregan cuando
 * se necesiten. Los componentes se cargan lazy para mantener el bundle
 * del master por separado del resto.
 *
 * URL: `/t/:tenantSlug/general/contactos[...]`
 */
export const CONTACTO_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/contactos-list/contactos-list.component').then(
        (m) => m.ContactosListComponent,
      ),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./pages/contacto-form/contacto-form.component').then((m) => m.ContactoFormComponent),
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./pages/contacto-form/contacto-form.component').then((m) => m.ContactoFormComponent),
  },
  {
    path: 'detalle/:id',
    loadComponent: () =>
      import('./pages/contacto-detail/contacto-detail.component').then(
        (m) => m.ContactoDetailComponent,
      ),
  },
];
