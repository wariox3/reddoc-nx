import type { Route } from '@angular/router';

export const GRUPO_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/grupos-list/grupos-list.component').then((m) => m.GruposListComponent),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./pages/grupo-form/grupo-form.component').then((m) => m.GrupoFormComponent),
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./pages/grupo-form/grupo-form.component').then((m) => m.GrupoFormComponent),
  },
  {
    path: 'detalle/:id',
    loadComponent: () =>
      import('./pages/grupo-detail/grupo-detail.component').then((m) => m.GrupoDetailComponent),
  },
];
