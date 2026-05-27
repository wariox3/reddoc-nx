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
    canActivate: [authGuard],
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
      {
        path: 'invitaciones',
        loadComponent: () =>
          import('./features/invitaciones/invitaciones.component').then(
            (m) => m.InvitacionesComponent,
          ),
      },
      {
        path: 'suscripciones',
        loadChildren: () =>
          import('./features/suscripciones/suscripciones.routes').then(
            (m) => m.SUSCRIPCIONES_ROUTES,
          ),
      },
      {
        path: 'facturacion',
        loadComponent: () =>
          import('./features/facturacion/facturacion.component').then(
            (m) => m.FacturacionComponent,
          ),
      },
    ],
  },

  {
    path: 'suscripciones/pago/resultado',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/suscripciones/pages/pago-resultado/pago-resultado.component').then(
        (m) => m.PagoResultadoComponent,
      ),
  },

  { path: '**', redirectTo: 'auth/login' },
];
