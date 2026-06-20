import type { Route } from '@angular/router';

/**
 * Rutas del informe **Pendiente por facturar** del módulo Venta.
 *
 * Informe de solo lectura: una única página de listado. El componente se carga
 * lazy para mantener su bundle separado del resto del módulo.
 *
 * URL: `/t/:tenantSlug/venta/informes/pendiente-facturar`
 */
export const PENDIENTE_FACTURAR_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/pendiente-facturar-list/pendiente-facturar-list.component').then(
        (m) => m.PendienteFacturarListComponent,
      ),
  },
];
