# @reddoc/feature-base

Building blocks compartidos para construir listados/formularios/detalles
en cualquier feature del ERP, más el componente base del framework
configuracional de documentos.

## Qué expone

| Export                                                        | Propósito                                                                                                                                                                               |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DataTableComponent` (`<lib-data-table>`)                     | Tabla "tonta": recibe `columns` + `items` + acciones, emite eventos. Sin HTTP, sin config, sin navegación. La usan tanto features directos (camino B) como `BaseDocumentListComponent`. |
| `BaseDocumentListComponent` (`<lib-base-document-list>`)      | Componente del framework para listar documentos transaccionales. Recibe `DocumentEntityConfig` por input (resuelto por `activeDocumentResolver`), delega I/O al `EntityDataGateway`.    |
| Tipos `RowAction`, `RowActionInvokedEvent`, `PageChangeEvent` | Contratos de eventos de la tabla.                                                                                                                                                       |

## Cuándo usar qué

- **Master administrativo** (contacto, ítem, sede, etc.) → escribir un componente página propio que componga `<lib-data-table>` con inputs concretos. **No** usar `BaseDocumentListComponent`.
- **Documento transaccional** (factura, nota crédito, etc.) → usar `BaseDocumentListComponent` resolviendo `DocumentEntityConfig` desde el `MODULE_REGISTRY` del app.

Ver `docs/architecture/erp-module-architecture.md` para la decisión arquitectónica y el plan completo del enfoque híbrido.
