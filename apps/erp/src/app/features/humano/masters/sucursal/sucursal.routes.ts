import type { Route } from '@angular/router';

export const SUCURSAL_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/sucursales-list/sucursales-list.component').then(
        (m) => m.SucursalesListComponent,
      ),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./pages/sucursal-form/sucursal-form.component').then((m) => m.SucursalFormComponent),
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./pages/sucursal-form/sucursal-form.component').then((m) => m.SucursalFormComponent),
  },
  {
    path: 'detalle/:id',
    loadComponent: () =>
      import('./pages/sucursal-detail/sucursal-detail.component').then(
        (m) => m.SucursalDetailComponent,
      ),
  },
];
