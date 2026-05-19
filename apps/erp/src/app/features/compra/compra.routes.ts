import type { Route } from '@angular/router';
import { erpModuleResolver } from '@erp/core/erp-modules';

export const COMPRA_ROUTES: Route[] = [
  {
    path: '',
    resolve: { _module: erpModuleResolver('compra') },
    loadComponent: () =>
      import('@erp/layouts/module-placeholder/module-placeholder.component').then(
        (m) => m.ModulePlaceholderComponent,
      ),
  },
];
