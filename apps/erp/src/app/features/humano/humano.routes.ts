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
    ],
  },
];
