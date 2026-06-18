import type { Route } from '@angular/router';

export const CUENTA_BANCO_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/cuentas-banco-list/cuentas-banco-list.component').then(
        (m) => m.CuentasBancoListComponent,
      ),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./pages/cuenta-banco-form/cuenta-banco-form.component').then(
        (m) => m.CuentaBancoFormComponent,
      ),
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./pages/cuenta-banco-form/cuenta-banco-form.component').then(
        (m) => m.CuentaBancoFormComponent,
      ),
  },
  {
    path: 'detalle/:id',
    loadComponent: () =>
      import('./pages/cuenta-banco-detail/cuenta-banco-detail.component').then(
        (m) => m.CuentaBancoDetailComponent,
      ),
  },
];
