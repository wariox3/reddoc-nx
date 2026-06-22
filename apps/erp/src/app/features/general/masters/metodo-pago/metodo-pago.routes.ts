import type { Route } from '@angular/router';

export const METODO_PAGO_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/metodos-pago-list/metodos-pago-list.component').then(
        (m) => m.MetodosPagoListComponent,
      ),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./pages/metodo-pago-form/metodo-pago-form.component').then(
        (m) => m.MetodoPagoFormComponent,
      ),
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./pages/metodo-pago-form/metodo-pago-form.component').then(
        (m) => m.MetodoPagoFormComponent,
      ),
  },
  {
    path: 'detalle/:id',
    loadComponent: () =>
      import('./pages/metodo-pago-detail/metodo-pago-detail.component').then(
        (m) => m.MetodoPagoDetailComponent,
      ),
  },
];
