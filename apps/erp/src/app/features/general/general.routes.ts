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
 * El componente `BaseListComponent` recibe la entidad resuelta vía
 * `withComponentInputBinding()` y se auto-configura: columnas, capacidades,
 * llamadas al gateway, etc.
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
            loadComponent: () => import('@reddoc/feature-base').then((m) => m.BaseListComponent),
          },
        ],
      },
    ],
  },
];
