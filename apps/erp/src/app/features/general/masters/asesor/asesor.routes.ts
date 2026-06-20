import type { Route } from '@angular/router';

export const ASESOR_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/asesores-list/asesores-list.component').then((m) => m.AsesoresListComponent),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./pages/asesor-form/asesor-form.component').then((m) => m.AsesorFormComponent),
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./pages/asesor-form/asesor-form.component').then((m) => m.AsesorFormComponent),
  },
  {
    path: 'detalle/:id',
    loadComponent: () =>
      import('./pages/asesor-detail/asesor-detail.component').then((m) => m.AsesorDetailComponent),
  },
];
