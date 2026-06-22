/**
 * Método de pago. Master administrativo del módulo General (camino B),
 * cableado en el módulo Compra. Nombre y código son obligatorios.
 */
export interface MetodoPago {
  readonly id: number;
  readonly nombre: string;
  readonly codigo: string;
}

/** Write-model para crear/editar un método de pago. */
export interface MetodoPagoPayload {
  readonly nombre: string;
  readonly codigo: string;
}
