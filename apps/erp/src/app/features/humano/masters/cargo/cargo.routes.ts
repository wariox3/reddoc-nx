import type { Route } from '@angular/router';

export const CARGO_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/cargos-list/cargos-list.component').then((m) => m.CargosListComponent),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./pages/cargo-form/cargo-form.component').then((m) => m.CargoFormComponent),
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./pages/cargo-form/cargo-form.component').then((m) => m.CargoFormComponent),
  },
  {
    path: 'detalle/:id',
    loadComponent: () =>
      import('./pages/cargo-detail/cargo-detail.component').then((m) => m.CargoDetailComponent),
  },
];
