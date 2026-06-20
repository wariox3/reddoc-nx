import type { Route } from '@angular/router';

/**
 * Rutas del master de resolución.
 *
 * Master compartido: el código vive en `general/masters/resolucion`, pero se
 * enruta desde los módulos Venta y Compra (cada uno con `data: { tipo }`). El
 * `tipo` (venta/compra) no se lee aquí — los componentes lo derivan del módulo
 * activo (`ActiveModuleStore`) para fijar el flag, filtrar la lista y navegar.
 */
export const RESOLUCION_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/resoluciones-list/resoluciones-list.component').then(
        (m) => m.ResolucionesListComponent,
      ),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./pages/resolucion-form/resolucion-form.component').then(
        (m) => m.ResolucionFormComponent,
      ),
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./pages/resolucion-form/resolucion-form.component').then(
        (m) => m.ResolucionFormComponent,
      ),
  },
  {
    path: 'detalle/:id',
    loadComponent: () =>
      import('./pages/resolucion-detail/resolucion-detail.component').then(
        (m) => m.ResolucionDetailComponent,
      ),
  },
];
