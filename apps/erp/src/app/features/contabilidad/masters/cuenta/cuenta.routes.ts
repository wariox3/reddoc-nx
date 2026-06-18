import type { Route } from '@angular/router';

export const CUENTA_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/cuentas-list/cuentas-list.component').then((m) => m.CuentasListComponent),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./pages/cuenta-form/cuenta-form.component').then((m) => m.CuentaFormComponent),
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./pages/cuenta-form/cuenta-form.component').then((m) => m.CuentaFormComponent),
  },
  {
    path: 'detalle/:id',
    loadComponent: () =>
      import('./pages/cuenta-detail/cuenta-detail.component').then((m) => m.CuentaDetailComponent),
  },
];
