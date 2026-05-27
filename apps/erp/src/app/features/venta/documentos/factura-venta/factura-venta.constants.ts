import type { ColumnDef, FilterField } from '@reddoc/core';

/**
 * Columnas visibles del listado de Factura de venta.
 *
 * Los campos asumen el shape canónico del endpoint `general/documento/`:
 * `numero`, `fecha`, `contacto_nombre`, `total`, `estado_nombre`. Si la
 * respuesta real difiere, basta ajustar `field` aquí — la tabla y el
 * gateway no se enteran.
 */
export const FACTURA_VENTA_COLUMNS: readonly ColumnDef[] = [
  {
    field: 'numero',
    headerKey: 'entities.facturaVenta.columns.numero',
    type: 'text',
    width: '120px',
    sortable: true,
  },
  {
    field: 'fecha',
    headerKey: 'entities.facturaVenta.columns.fecha',
    type: 'date',
    width: '110px',
    sortable: true,
  },
  {
    field: 'contacto_nombre',
    headerKey: 'entities.facturaVenta.columns.contacto',
    type: 'text',
    sortable: true,
  },
  {
    field: 'total',
    headerKey: 'entities.facturaVenta.columns.total',
    type: 'currency',
    width: '140px',
    align: 'right',
    sortable: true,
  },
  {
    field: 'estado_nombre',
    headerKey: 'entities.facturaVenta.columns.estado',
    type: 'text',
    width: '120px',
  },
];

/**
 * Filtros visibles del listado.
 *
 * Vacío por ahora: el único filtro que viaja al backend es
 * `documento_tipo_id = FACTURA_VENTA`, y eso lo inyecta el gateway
 * automáticamente desde `documentTypeId` del config. Sumar acá cuando
 * agreguemos un filter panel.
 */
export const FACTURA_VENTA_FILTERS: readonly FilterField[] = [];
