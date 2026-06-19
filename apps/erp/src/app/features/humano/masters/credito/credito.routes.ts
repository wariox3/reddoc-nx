import type { Route } from '@angular/router';

export const CREDITO_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/creditos-list/creditos-list.component').then((m) => m.CreditosListComponent),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./pages/credito-form/credito-form.component').then((m) => m.CreditoFormComponent),
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./pages/credito-form/credito-form.component').then((m) => m.CreditoFormComponent),
  },
];
