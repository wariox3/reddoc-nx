import type { ColumnDef, FilterField } from '@reddoc/core';

/**
 * Columnas visibles del listado de Contrato servicio.
 *
 * Los `field` mapean el shape real del endpoint `general/documento/lista/`:
 * la identificación y el nombre del contacto llegan con doble guion bajo
 * (`contacto__numero_identificacion`, `contacto__nombre_corto`), los montos
 * como `currency` y los estados como flags booleanos.
 */
export const CONTRATO_SERVICIO_COLUMNS: readonly ColumnDef[] = [
  {
    field: 'id',
    headerKey: 'entities.contratoServicio.columns.id',
    type: 'number',
    width: '80px',
    align: 'right',
    sortable: true,
  },
  {
    field: 'numero',
    headerKey: 'entities.contratoServicio.columns.numero',
    type: 'text',
    width: '130px',
    sortable: true,
  },
  {
    field: 'fecha',
    headerKey: 'entities.contratoServicio.columns.fecha',
    type: 'date',
    width: '110px',
    sortable: true,
  },
  {
    field: 'contacto__numero_identificacion',
    headerKey: 'entities.contratoServicio.columns.identificacion',
    type: 'text',
    width: '140px',
  },
  {
    field: 'contacto__nombre_corto',
    headerKey: 'entities.contratoServicio.columns.contacto',
    type: 'text',
    sortable: true,
  },
  {
    field: 'subtotal',
    headerKey: 'entities.contratoServicio.columns.subtotal',
    type: 'currency',
    width: '130px',
    align: 'right',
    sortable: true,
  },
  {
    field: 'impuesto',
    headerKey: 'entities.contratoServicio.columns.impuesto',
    type: 'currency',
    width: '120px',
    align: 'right',
  },
  {
    field: 'total',
    headerKey: 'entities.contratoServicio.columns.total',
    type: 'currency',
    width: '140px',
    align: 'right',
    sortable: true,
  },
  {
    field: 'estado_aprobado',
    headerKey: 'entities.contratoServicio.columns.aprobado',
    type: 'boolean',
    width: '70px',
    align: 'center',
  },
  {
    field: 'estado_anulado',
    headerKey: 'entities.contratoServicio.columns.anulado',
    type: 'boolean',
    width: '70px',
    align: 'center',
  },
  {
    field: 'estado_electronico',
    headerKey: 'entities.contratoServicio.columns.electronico',
    type: 'boolean',
    width: '70px',
    align: 'center',
  },
  {
    field: 'estado_contabilizado',
    headerKey: 'entities.contratoServicio.columns.contabilizado',
    type: 'boolean',
    width: '70px',
    align: 'center',
  },
];

/**
 * Filtros visibles del listado (encienden el botón "Filtros" + el modal).
 *
 * El filtro implícito `documento_tipo_id = CONTRATO_SERVICIO` lo inyecta el
 * gateway desde `documentTypeId` del config — acá solo van los del usuario.
 *
 * Los estados usan labels completos (sub-clave `filters.*`) en vez de las
 * cabeceras abreviadas (Apr/Anu/Ele/Con), que en el modal serían ambiguas.
 */
export const CONTRATO_SERVICIO_FILTERS: readonly FilterField[] = [
  { name: 'numero', displayNameKey: 'entities.contratoServicio.columns.numero', type: 'string' },
  { name: 'fecha', displayNameKey: 'entities.contratoServicio.columns.fecha', type: 'date' },
  {
    name: 'contacto__numero_identificacion',
    displayNameKey: 'entities.contratoServicio.columns.identificacion',
    type: 'string',
  },
  {
    name: 'contacto__nombre_corto',
    displayNameKey: 'entities.contratoServicio.columns.contacto',
    type: 'string',
  },
  {
    name: 'estado_aprobado',
    displayNameKey: 'entities.contratoServicio.filters.aprobado',
    type: 'boolean',
  },
  {
    name: 'estado_anulado',
    displayNameKey: 'entities.contratoServicio.filters.anulado',
    type: 'boolean',
  },
  {
    name: 'estado_electronico',
    displayNameKey: 'entities.contratoServicio.filters.electronico',
    type: 'boolean',
  },
  {
    name: 'estado_contabilizado',
    displayNameKey: 'entities.contratoServicio.filters.contabilizado',
    type: 'boolean',
  },
];
