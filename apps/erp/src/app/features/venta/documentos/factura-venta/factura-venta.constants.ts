import type { ColumnDef, FilterField } from '@reddoc/core';

/** Endpoint `seleccionar` del plazo de pago (alimenta el autocálculo de vencimiento). */
export const PLAZO_PAGO_ENDPOINT = '/general/plazo-pago/seleccionar/';
/** Endpoint `seleccionar` de sedes. */
export const SEDE_ENDPOINT = '/general/sede/seleccionar/';
/** Endpoint `seleccionar` de métodos de pago. */
export const METODO_PAGO_ENDPOINT = '/general/metodo-pago/seleccionar/';

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
  },
  {
    field: 'fecha',
    headerKey: 'entities.facturaVenta.columns.fecha',
    type: 'date',
    width: '110px',
  },
  {
    field: 'contacto_nombre',
    headerKey: 'entities.facturaVenta.columns.contacto',
    type: 'text',
  },
  {
    field: 'total',
    headerKey: 'entities.facturaVenta.columns.total',
    type: 'currency',
    width: '140px',
    align: 'right',
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
