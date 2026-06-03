import { DOCUMENT_TYPE_ID, type DocumentEntityConfig } from '@erp/core/module-config';
import {
  CONTRATO_SERVICIO_COLUMNS,
  CONTRATO_SERVICIO_FILTERS,
} from './contrato-servicio.constants';

/**
 * Configuración declarativa de **Contrato servicio** (movimiento de venta).
 *
 * Camino A del enfoque híbrido: vive sobre el endpoint genérico
 * `/api/general/documento` discriminado por `documento_tipo_id`.
 *
 * Es un documento **solo lista**: todas las `capabilities` están en `false`,
 * de modo que el `BaseDocumentListComponent` renderiza únicamente la tabla
 * (sin crear, ver, editar ni eliminar). Las rutas `new` / `edit` / `detail`
 * se declaran porque el tipo `EntityRoutes` las exige, pero nunca se navegan.
 *
 * - `documentTypeId` proviene de `DOCUMENT_TYPE_ID.CONTRATO_SERVICIO` (id 34)
 *   para evitar magic numbers; el gateway lo inyecta como filtro implícito.
 * - `inventoryEffect` es metadata para forms/inventario; la lista no la usa.
 */
export const CONTRATO_SERVICIO_CONFIG: DocumentEntityConfig = {
  kind: 'document',
  id: 'contrato-servicio',
  displayNameKey: 'entities.contratoServicio.name',
  endpoint: '/api/general/documento',
  documentTypeId: DOCUMENT_TYPE_ID.CONTRATO_SERVICIO,
  inventoryEffect: 'outflow',
  schemaVersion: 1,
  columns: CONTRATO_SERVICIO_COLUMNS,
  filters: CONTRATO_SERVICIO_FILTERS,
  routes: {
    list: 'contrato-servicio/list',
    new: 'contrato-servicio/nuevo',
    edit: 'contrato-servicio/editar',
    detail: 'contrato-servicio/detalle',
  },
  capabilities: {
    canCreate: false,
    canEdit: false,
    canDelete: false,
    canSelectRows: false,
    canImport: false,
    canExportExcel: false,
    canExportZip: false,
    canGenerate: false,
  },
};
