import type { Route } from '@angular/router';

/**
 * Rutas del proceso **Regenerar afectado** del módulo Venta.
 *
 * Proceso de una sola página (consola de disparo). El componente se carga lazy
 * para mantener su bundle separado del resto del módulo.
 *
 * URL: `/t/:tenantSlug/venta/proceso/regenerar-afectado`
 */
export const REGENERAR_AFECTADO_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/regenerar-afectado/regenerar-afectado.component').then(
        (m) => m.RegenerarAfectadoComponent,
      ),
  },
];
