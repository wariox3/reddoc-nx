import type { Route } from '@angular/router';
import { erpModuleResolver, moduleIndexRoute } from '@erp/core/erp-modules';
import { TURNO_MODULE } from './turno.module-descriptor';

/**
 * Rutas del módulo Turno.
 *
 * Resuelve `erpModuleResolver('turno')` en la ruta raíz para que el topbar y el
 * sidebar se sincronicen al activar este módulo. Delega cada master a su propio
 * archivo de rutas dentro de `masters/<entity>/<entity>.routes.ts` — cada master
 * es un bounded context auto-contenido (modelo, servicio, páginas y utilidades
 * específicas viven juntos).
 *
 * Camino B del enfoque híbrido (ver docs/architecture/erp-module-architecture.md).
 */
export const TURNO_ROUTES: Route[] = [
  {
    path: '',
    resolve: { _module: erpModuleResolver('turno') },
    children: [
      moduleIndexRoute(TURNO_MODULE),
      {
        path: 'puestos',
        loadChildren: () => import('./masters/puesto/puesto.routes').then((m) => m.PUESTO_ROUTES),
      },
      {
        path: 'programadores',
        loadChildren: () =>
          import('./masters/programador/programador.routes').then((m) => m.PROGRAMADOR_ROUTES),
      },
      {
        path: 'secuencias',
        loadChildren: () =>
          import('./masters/secuencia/secuencia.routes').then((m) => m.SECUENCIA_ROUTES),
      },
      {
        path: 'turnos',
        loadChildren: () =>
          import('./masters/turno/turno.routes').then((m) => m.TURNO_MASTER_ROUTES),
      },
    ],
  },
];
