import type { Route } from '@angular/router';

/**
 * Rutas del master Turno (jornada) del módulo Turno.
 *
 * Listado + formulario de alta/edición (la misma página cubre crear y editar).
 * El detalle se agregará después. Los componentes se cargan lazy para mantener
 * el bundle del master por separado.
 *
 * Se exporta como `TURNO_MASTER_ROUTES` para no confundir con el `TURNO_ROUTES`
 * del dispatcher del módulo (`features/turno/turno.routes.ts`).
 *
 * URL: `/t/:tenantSlug/turno/turnos[/nuevo|/editar/:id]`
 */
export const TURNO_MASTER_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/turnos-list/turnos-list.component').then((m) => m.TurnosListComponent),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./pages/turno-form/turno-form.component').then((m) => m.TurnoFormComponent),
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./pages/turno-form/turno-form.component').then((m) => m.TurnoFormComponent),
  },
];
