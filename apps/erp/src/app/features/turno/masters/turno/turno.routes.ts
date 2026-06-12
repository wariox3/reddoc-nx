import type { Route } from '@angular/router';

/**
 * Rutas del master Turno (jornada) del módulo Turno.
 *
 * Por ahora solo el listado está implementado. Las rutas nuevo/editar/detalle
 * se agregan cuando se construya el formulario. El componente se carga lazy para
 * mantener el bundle del master por separado.
 *
 * Se exporta como `TURNO_MASTER_ROUTES` para no confundir con el `TURNO_ROUTES`
 * del dispatcher del módulo (`features/turno/turno.routes.ts`).
 *
 * URL: `/t/:tenantSlug/turno/turnos`
 */
export const TURNO_MASTER_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/turnos-list/turnos-list.component').then((m) => m.TurnosListComponent),
  },
];
