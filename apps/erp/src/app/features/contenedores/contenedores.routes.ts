import { Routes } from '@angular/router';

export const CONTENEDORES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/list/contenedores-list.component').then((m) => m.ContenedoresListComponent),
  },
];
