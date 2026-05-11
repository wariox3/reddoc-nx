import type { Route } from '@angular/router';
import { activeEntityResolver, activeModuleResolver } from '@reddoc/core';

/**
 * Rutas del módulo General.
 *
 * Estructura:
 *   /t/:slug/general                                  → resuelve `module`
 *     └── /master/:entityKey                          → resuelve `entity` (kind master)
 *           └── /list, /new, /edit/:id, /detail/:id  → componentes base
 *
 * Por ahora solo cuelga el placeholder bajo `/list`. Cuando exista
 * `BaseListComponent`, esta misma estructura cargará el componente base con
 * `entity` inyectada vía `withComponentInputBinding()`.
 */
export const GENERAL_ROUTES: Route[] = [
  {
    path: '',
    resolve: { module: activeModuleResolver('general') },
    children: [
      {
        path: 'master/:entityKey',
        resolve: { entity: activeEntityResolver('master') },
        children: [
          {
            path: 'list',
            loadComponent: () =>
              import('./pages/contacto-list-placeholder.component').then(
                (m) => m.ContactoListPlaceholderComponent,
              ),
          },
        ],
      },
    ],
  },
];
