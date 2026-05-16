export type MetodoPago = 'tarjeta' | 'pse';

export type FrecuenciaPago = 'mensual' | 'anual';

export interface IniciarPagoRequest {
  readonly suscripcion_tipo_id: number;
  readonly billing_profile_id: number;
  readonly frecuencia: FrecuenciaPago;
  readonly auto_renovacion: boolean;
  readonly metodo_pago: MetodoPago;
}

export interface WompiCustomerData {
  readonly email: string;
  readonly full_name: string;
  readonly phone_number?: string;
  readonly legal_id?: string;
  readonly legal_id_type?: string;
}

export interface IniciarPagoResponse {
  readonly referencia: string;
  readonly monto_cents: number;
  readonly moneda: 'COP';
  readonly hash: string;
  readonly public_key?: string;
  readonly redirect_url: string;
  readonly customer_data?: WompiCustomerData;
}

export type EstadoPago = 'pending' | 'approved' | 'declined' | 'voided' | 'error';

export interface EstadoPagoResponse {
  readonly estado: EstadoPago;
  readonly transaction_id?: string;
  readonly referencia: string;
  readonly suscripcion_id?: number;
  readonly mensaje?: string;
}

export class WompiCheckoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WompiCheckoutError';
  }
}
