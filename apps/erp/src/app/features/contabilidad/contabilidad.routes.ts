import type { Route } from '@angular/router';
import { erpModuleResolver } from '@erp/core/erp-modules';

export const CONTABILIDAD_ROUTES: Route[] = [
  {
    path: '',
    resolve: { _module: erpModuleResolver('contabilidad') },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'centros-costo' },
      {
        path: 'centros-costo',
        loadChildren: () =>
          import('./masters/centro-costo/centro-costo.routes').then((m) => m.CENTRO_COSTO_ROUTES),
      },
      {
        path: 'cuentas',
        loadChildren: () => import('./masters/cuenta/cuenta.routes').then((m) => m.CUENTA_ROUTES),
      },
    ],
  },
];
