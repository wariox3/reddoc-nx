import { Route } from '@angular/router';
import { authGuard, tenantGuard } from '@reddoc/core';
import { AUTH_ROUTES } from './features/auth/auth.routes';
import { rootRedirectGuard } from './core/guards/root-redirect.guard';

export const appRoutes: Route[] = [
  { path: '', pathMatch: 'full', canActivate: [rootRedirectGuard], children: [] },

  // Auth — own layout
  {
    path: 'auth',
    loadChildren: () => AUTH_ROUTES,
  },

  // Shell layout (simple nav, no sidebar) — selección de contenedor
  {
    path: '',
    canActivate: [authGuard],
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

  // Workspace layout (sidebar + main) — anidado bajo el tenant slug
  {
    path: 't/:tenantSlug',
    canActivate: [authGuard, tenantGuard],
    loadComponent: () =>
      import('./layouts/workspace-layout/workspace-layout.component').then(
        (m) => m.WorkspaceLayoutComponent,
      ),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'general',
        loadChildren: () =>
          import('./features/general/general.routes').then((m) => m.GENERAL_ROUTES),
      },
    ],
  },

  { path: '**', redirectTo: '' },
];
