import { DOCUMENT_TYPE_ID, type DocumentEntityConfig } from '@erp/core/module-config';
import { PEDIDO_SERVICIO_COLUMNS, PEDIDO_SERVICIO_FILTERS } from './pedido-servicio.constants';

/**
 * Configuración declarativa de **Pedido servicio** (movimiento de venta).
 *
 * Camino A del enfoque híbrido: vive sobre el endpoint genérico
 * `/api/general/documento` discriminado por `documento_tipo_id`. Pertenece a la
 * misma familia que Contrato servicio: comparte el form, la tabla de detalles y
 * el tarifador de supervigilancia (`ServicioDocumentoFormComponent`), que se
 * parametriza con esta config.
 *
 * - `documentTypeId` proviene de `DOCUMENT_TYPE_ID.PEDIDO_SERVICIO` (id 35)
 *   para evitar magic numbers; el gateway lo inyecta como filtro implícito.
 * - `inventoryEffect` es metadata para forms/inventario; la lista no la usa.
 */
export const PEDIDO_SERVICIO_CONFIG: DocumentEntityConfig = {
  kind: 'document',
  id: 'pedido-servicio',
  displayNameKey: 'entities.pedidoServicio.name',
  endpoint: '/api/general/documento',
  documentTypeId: DOCUMENT_TYPE_ID.PEDIDO_SERVICIO,
  inventoryEffect: 'outflow',
  schemaVersion: 1,
  columns: PEDIDO_SERVICIO_COLUMNS,
  filters: PEDIDO_SERVICIO_FILTERS,
  defaultSort: [{ field: 'id', direction: 'desc' }],
  routes: {
    list: 'pedido-servicio/list',
    new: 'pedido-servicio/nuevo',
    edit: 'pedido-servicio/editar',
    detail: 'pedido-servicio/detalle',
  },
  capabilities: {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canSelectRows: false,
    canImport: false,
    canExportExcel: false,
    canExportZip: false,
    canGenerate: true,
  },
  // Acción extra "generar": botón de toolbar que abre un modal de fecha y genera
  // pedidos servicio a partir de los contratos servicio de esa fecha. La lógica
  // vive en `GenerarDocumentoActionStrategy` (registrada en ENTITY_ACTION_PROVIDERS).
  extraActionIds: ['generar'],
};
