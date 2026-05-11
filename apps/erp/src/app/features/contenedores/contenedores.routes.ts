import { Routes } from '@angular/router';

export const CONTENEDORES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/list/contenedores-list.component').then((m) => m.ContenedoresListComponent),
  },
  {
    path: 'crear',
    loadComponent: () =>
      import('./pages/crear/contenedores-crear.component').then(
        (m) => m.ContenedoresCrearComponent,
      ),
  },
];
