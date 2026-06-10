import type { Route } from '@angular/router';
import { erpModuleResolver } from '@erp/core/erp-modules';

export const HUMANO_ROUTES: Route[] = [
  {
    path: '',
    resolve: { _module: erpModuleResolver('humano') },
    loadComponent: () =>
      import('@erp/layouts/module-placeholder/module-placeholder.component').then(
        (m) => m.ModulePlaceholderComponent,
      ),
  },
];
