import type { Route } from '@angular/router';
import { erpModuleResolver } from '@erp/core/erp-modules';

export const HUMANO_ROUTES: Route[] = [
  {
    path: '',
    resolve: { _module: erpModuleResolver('humano') },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'contratos' },
      {
        path: 'contratos',
        loadChildren: () =>
          import('./masters/contrato/contrato.routes').then((m) => m.CONTRATO_ROUTES),
      },
      {
        path: 'cargos',
        loadChildren: () => import('./masters/cargo/cargo.routes').then((m) => m.CARGO_ROUTES),
      },
      {
        path: 'grupos',
        loadChildren: () => import('./masters/grupo/grupo.routes').then((m) => m.GRUPO_ROUTES),
      },
    ],
  },
];
