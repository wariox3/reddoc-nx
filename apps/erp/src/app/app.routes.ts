import { Route } from '@angular/router';
import { authGuard } from '@reddoc/core';
import { AUTH_ROUTES } from './features/auth/auth.routes';

export const appRoutes: Route[] = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },

  // Auth — own layout
  {
    path: 'auth',
    loadChildren: () => AUTH_ROUTES,
  },

  // Shell layout (simple nav, no sidebar)
  {
    path: '',
    canActivate: [],
    loadComponent: () =>
      import('./layouts/shell-layout/shell-layout.component').then((m) => m.ShellLayoutComponent),
    children: [
      {
        path: 'contenedores',
        loadChildren: () =>
          import('./features/contenedores/contenedores.routes').then((m) => m.CONTENEDORES_ROUTES),
      },
    ],
  },

  // Workspace layout (sidebar + main)
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/workspace-layout/workspace-layout.component').then(
        (m) => m.WorkspaceLayoutComponent,
      ),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
    ],
  },

  { path: '**', redirectTo: 'auth/login' },
];
