import type { Route } from '@angular/router';

/**
 * Rutas del master Secuencia del módulo Turno.
 *
 * Listado + formulario de alta/edición (la misma página cubre crear y editar).
 * El detalle se agregará después. Los componentes se cargan lazy para mantener
 * el bundle del master por separado.
 *
 * URL: `/t/:tenantSlug/turno/secuencias[/nuevo|/editar/:id]`
 */
export const SECUENCIA_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/secuencias-list/secuencias-list.component').then(
        (m) => m.SecuenciasListComponent,
      ),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./pages/secuencia-form/secuencia-form.component').then(
        (m) => m.SecuenciaFormComponent,
      ),
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./pages/secuencia-form/secuencia-form.component').then(
        (m) => m.SecuenciaFormComponent,
      ),
  },
];
