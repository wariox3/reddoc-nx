import type { Route } from '@angular/router';

/**
 * Rutas del módulo General.
 *
 * Módulo de masters administrativos (camino B del enfoque híbrido).
 * Cada master es una página dedicada que compone los building blocks
 * compartidos. Sin resolvers ni configs del framework.
 *
 * Agregar un master nuevo:
 *   1. Crear `services/<x>.service.ts` y `pages/<x>-list/...`.
 *   2. Agregar la ruta aquí.
 *   3. Agregar la entrada en `layouts/sidebar/sidebar-menu.ts`.
 */
export const GENERAL_ROUTES: Route[] = [
  {
    path: 'contactos',
    loadComponent: () =>
      import('./pages/contactos-list/contactos-list.component').then(
        (m) => m.ContactosListComponent,
      ),
  },
];
