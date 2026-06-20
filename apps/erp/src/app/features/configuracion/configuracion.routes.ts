import type { Routes } from '@angular/router';

/**
 * Rutas de Configuración de la empresa.
 *
 * Feature tradicional bajo `/t/:slug/configuracion` (hermana de `dashboard`,
 * fuera del framework de módulos). El shell aloja las pestañas por área; la
 * pestaña activa viaja en el query-param `?seccion=`.
 */
export const CONFIGURACION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/configuracion/configuracion.component').then((m) => m.ConfiguracionComponent),
  },
];
