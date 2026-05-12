import type { Route } from '@angular/router';
import { activeEntityResolver, activeModuleResolver } from '@reddoc/core';

/**
 * Rutas del módulo General.
 *
 * - **Camino B (masters directos)**: `general/contactos`, `general/items`, etc.
 *   Cada uno apunta a su propia página componiendo building blocks.
 *
 * - **Camino A (legacy, en migración)**: `general/master/:entityKey/list`
 *   apunta al `BaseListComponent` del framework. Se elimina en pasos posteriores
 *   cuando todos los masters tengan su feature directo.
 */
export const GENERAL_ROUTES: Route[] = [
  // ── Camino B: feature directo ──────────────────────────────────────────────
  {
    path: 'contactos',
    loadComponent: () =>
      import('./pages/contactos-list/contactos-list.component').then(
        (m) => m.ContactosListComponent,
      ),
  },

  // ── Camino A: registry/resolver legacy (a remover en pasos 6-8) ────────────
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
