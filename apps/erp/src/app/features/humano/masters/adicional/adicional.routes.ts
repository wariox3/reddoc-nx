import type { Route } from '@angular/router';

export const ADICIONAL_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/adicionales-list/adicionales-list.component').then(
        (m) => m.AdicionalesListComponent,
      ),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./pages/adicional-form/adicional-form.component').then(
        (m) => m.AdicionalFormComponent,
      ),
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./pages/adicional-form/adicional-form.component').then(
        (m) => m.AdicionalFormComponent,
      ),
  },
  {
    path: 'detalle/:id',
    loadComponent: () =>
      import('./pages/adicional-detail/adicional-detail.component').then(
        (m) => m.AdicionalDetailComponent,
      ),
  },
];
