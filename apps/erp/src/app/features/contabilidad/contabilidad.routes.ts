import type { Route } from '@angular/router';
import { erpModuleResolver } from '@erp/core/erp-modules';

export const CONTABILIDAD_ROUTES: Route[] = [
  {
    path: '',
    resolve: { _module: erpModuleResolver('contabilidad') },
    loadComponent: () =>
      import('@erp/layouts/module-placeholder/module-placeholder.component').then(
        (m) => m.ModulePlaceholderComponent,
      ),
  },
];
