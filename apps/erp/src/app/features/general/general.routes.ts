import type { Route } from '@angular/router';
import { erpModuleResolver } from '@erp/core/erp-modules';

/**
 * Rutas del módulo General.
 *
 * Resuelve `erpModuleResolver('general')` en la ruta raíz para que el topbar
 * y el sidebar se sincronicen al activar este módulo. Delega cada master a
 * su propio archivo de rutas dentro de `masters/<entity>/<entity>.routes.ts`
 * — cada master es un bounded context auto-contenido (modelo, servicio,
 * páginas, componentes y utilidades específicas viven juntos).
 *
 * Camino B del enfoque híbrido (ver docs/architecture/erp-module-architecture.md).
 */
export const GENERAL_ROUTES: Route[] = [
  {
    path: '',
    resolve: { _module: erpModuleResolver('general') },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'contactos' },
      {
        path: 'contactos',
        loadChildren: () =>
          import('./masters/contacto/contacto.routes').then((m) => m.CONTACTO_ROUTES),
      },
      // Futuros: asesores, items, sedes, almacenes, cuentas-banco,
      // formas-pago, precios, resoluciones. Cada uno delega a su
      // `masters/<entity>/<entity>.routes.ts`.
    ],
  },
];
