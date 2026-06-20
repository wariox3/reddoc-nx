/**
 * IDs del catálogo `documento_tipo` del backend.
 *
 * El endpoint genérico `general/documento/` discrimina cada tipo de documento
 * por su `documento_tipo_id`. Centralizamos los ids aquí para que ningún
 * `DocumentEntityConfig` use magic numbers — cada documento del framework
 * referencia su tipo por nombre semántico desde este mapa.
 *
 * Agregar un id cuando el feature correspondiente se implemente; no enumerar
 * preventivamente los del legacy.
 */
export const DOCUMENT_TYPE_ID = {
  /** Factura electrónica de venta. */
  FACTURA_VENTA: 1,
  /** Contrato de servicio (movimiento de venta). */
  CONTRATO_SERVICIO: 34,
  /** Pedido de servicio (movimiento de venta; misma familia que contrato servicio). */
  PEDIDO_SERVICIO: 35,
} as const satisfies Readonly<Record<string, number>>;

/** Nombre semántico (clave) de un tipo de documento registrado. */
export type DocumentTypeKey = keyof typeof DOCUMENT_TYPE_ID;

/** Valor numérico (id del backend) de un tipo de documento registrado. */
export type DocumentTypeId = (typeof DOCUMENT_TYPE_ID)[DocumentTypeKey];
