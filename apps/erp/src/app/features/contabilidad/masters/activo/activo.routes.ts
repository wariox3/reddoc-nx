import type { Route } from '@angular/router';

export const ACTIVO_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/activos-list/activos-list.component').then((m) => m.ActivosListComponent),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./pages/activo-form/activo-form.component').then((m) => m.ActivoFormComponent),
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./pages/activo-form/activo-form.component').then((m) => m.ActivoFormComponent),
  },
  {
    path: 'detalle/:id',
    loadComponent: () =>
      import('./pages/activo-detail/activo-detail.component').then((m) => m.ActivoDetailComponent),
  },
];
