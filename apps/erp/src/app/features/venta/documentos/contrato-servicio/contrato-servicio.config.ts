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
 * Soporta **alta y edición** (`canCreate` / `canEdit`): el
 * `BaseDocumentListComponent` muestra el botón "Nuevo" y la acción de fila
 * "Editar", que navegan a las rutas `new` / `edit` (el
 * `ServicioDocumentoFormComponent` compartido, parametrizado por esta config).
 * `detail` se declara porque el tipo lo exige pero no se usa.
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
  defaultSort: [{ field: 'id', direction: 'desc' }],
  routes: {
    list: 'contrato-servicio/list',
    new: 'contrato-servicio/nuevo',
    edit: 'contrato-servicio/editar',
    detail: 'contrato-servicio/detalle',
  },
  capabilities: {
    canCreate: true,
    canEdit: true,
    canDelete: true,
    canSelectRows: false,
    canImport: false,
    canExportExcel: false,
    canExportZip: false,
    canGenerate: false,
  },
};
