import { Route } from '@angular/router';

export const SUSCRIPCIONES_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () => import('./suscripciones.component').then((m) => m.SuscripcionesComponent),
  },
  {
    path: 'planes/:id',
    loadComponent: () => import('./pages/planes/planes.component').then((m) => m.PlanesComponent),
  },
];
