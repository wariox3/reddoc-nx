import { Route } from '@angular/router';
import { authGuard } from '@reddoc/core';
import { AUTH_ROUTES } from './features/auth/auth.routes';

export const appRoutes: Route[] = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },

  {
    path: 'auth',
    loadChildren: () => AUTH_ROUTES,
  },

  {
    path: '',
    canActivate: [],
    loadComponent: () =>
      import('./layouts/workspace-layout/workspace-layout.component').then(
        (m) => m.WorkspaceLayoutComponent,
      ),
    children: [
      {
        path: 'perfil',
        loadComponent: () =>
          import('./features/perfil/perfil.component').then((m) => m.PerfilComponent),
      },
      {
        path: 'seguridad',
        loadComponent: () =>
          import('./features/seguridad/seguridad.component').then((m) => m.SeguridadComponent),
      },
    ],
  },

  { path: '**', redirectTo: 'auth/login' },
];
