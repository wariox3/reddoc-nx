# @reddoc/feature-base

Building blocks compartidos de listados/tablas para todas las apps del monorepo.

## Qué expone

| Export                                                        | Propósito                                                                                                                                                                                                     |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DataTableComponent` (`<lib-data-table>`)                     | Tabla "tonta": recibe `columns` + `items` + acciones, emite eventos. Sin HTTP, sin config, sin navegación. La usan masters directos del ERP y cualquier otra app que necesite una tabla paginada y filtrable. |
| Tipos `RowAction`, `RowActionInvokedEvent`, `PageChangeEvent` | Contratos de eventos de la tabla.                                                                                                                                                                             |

## Qué NO está aquí

El framework configuracional de documentos del ERP (`BaseDocumentListComponent`, registry de módulos, resolvers, gateway, errores) vive en `apps/erp/src/app/core/module-config/`. Es código ERP-específico — no tiene sentido en una lib cross-app.

Ver `docs/architecture/erp-module-architecture.md` para el detalle del enfoque híbrido.
