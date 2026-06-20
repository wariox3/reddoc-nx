import type { Route } from '@angular/router';

export const PRECIO_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/precios-list/precios-list.component').then((m) => m.PreciosListComponent),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./pages/precio-form/precio-form.component').then((m) => m.PrecioFormComponent),
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./pages/precio-form/precio-form.component').then((m) => m.PrecioFormComponent),
  },
  {
    path: 'detalle/:id',
    loadComponent: () =>
      import('./pages/precio-detail/precio-detail.component').then((m) => m.PrecioDetailComponent),
  },
];
