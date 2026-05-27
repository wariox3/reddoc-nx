import type { Route } from '@angular/router';
import { activeDocumentResolver } from '@erp/core/module-config';

/**
 * Rutas de **Factura electrónica de venta**.
 *
 * Cada documento del módulo es un bounded context auto-contenido: su config,
 * constantes, columnas, form y detalle viven juntos en
 * `features/venta/documentos/factura-venta/`. Esto permite agregar un
 * documento nuevo (nota crédito, nota débito, etc.) creando otra carpeta
 * hermana sin tocar este archivo.
 *
 * El `activeDocumentResolver('factura-venta')` deja la config en
 * `ModuleNavigationStore` antes de montar la lista — el módulo padre
 * (`venta.routes.ts`) ya cargó `VENTA_CONFIG`.
 *
 * Por ahora solo el listado está implementado. `nuevo` / `editar` / `detalle`
 * apuntan al placeholder común hasta que se implemente el form/detalle
 * específico de Factura de venta.
 */
export const FACTURA_VENTA_ROUTES: Route[] = [
  {
    path: '',
    resolve: { document: activeDocumentResolver('factura-venta') },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'list' },
      {
        path: 'list',
        loadComponent: () =>
          import('@erp/core/module-config/components/base-document-list/base-document-list.component').then(
            (m) => m.BaseDocumentListComponent,
          ),
      },
      {
        path: 'nuevo',
        loadComponent: () =>
          import('@erp/layouts/module-placeholder/module-placeholder.component').then(
            (m) => m.ModulePlaceholderComponent,
          ),
      },
      {
        path: 'editar/:id',
        loadComponent: () =>
          import('@erp/layouts/module-placeholder/module-placeholder.component').then(
            (m) => m.ModulePlaceholderComponent,
          ),
      },
      {
        path: 'detalle/:id',
        loadComponent: () =>
          import('@erp/layouts/module-placeholder/module-placeholder.component').then(
            (m) => m.ModulePlaceholderComponent,
          ),
      },
    ],
  },
];
