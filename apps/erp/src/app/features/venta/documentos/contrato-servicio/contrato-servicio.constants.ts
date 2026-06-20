import {
  buildServicioColumns,
  buildServicioFilters,
} from '../_shared/servicio/servicio-documento.constants';

/**
 * Columnas y filtros del listado de **Contrato servicio**.
 *
 * Se construyen con las factories compartidas de la familia de documentos de
 * servicio (vigilancia): la estructura es idéntica entre documentos, solo cambia
 * el namespace i18n (`contratoServicio`). Si este documento necesita divergir de
 * la familia, deja de usar la factory para la columna/filtro en cuestión.
 */
export const CONTRATO_SERVICIO_COLUMNS = buildServicioColumns('contratoServicio');
export const CONTRATO_SERVICIO_FILTERS = buildServicioFilters('contratoServicio');
