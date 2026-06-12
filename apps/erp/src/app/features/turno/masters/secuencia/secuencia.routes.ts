import type { Route } from '@angular/router';

/**
 * Rutas del master Secuencia del módulo Turno.
 *
 * Por ahora solo el listado está implementado. Las rutas nuevo/editar/detalle
 * se agregan cuando se construya el formulario de secuencia. El componente se
 * carga lazy para mantener el bundle del master por separado.
 *
 * URL: `/t/:tenantSlug/turno/secuencias`
 */
export const SECUENCIA_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/secuencias-list/secuencias-list.component').then(
        (m) => m.SecuenciasListComponent,
      ),
  },
];
