import { Injectable, inject } from '@angular/core';
import { ENVIRONMENT } from '@reddoc/core';
import { MetodoPago, IniciarPagoResponse, WompiCheckoutError } from '../models/pago.model';

const WOMPI_CHECKOUT_BASE = 'https://checkout.wompi.co/p/';

interface OpenCheckoutInput {
  readonly intencion: IniciarPagoResponse;
  readonly metodoPago: MetodoPago;
}

const METODO_PAGO_TO_WOMPI: Record<MetodoPago, string> = {
  tarjeta: 'CARD',
  pse: 'PSE',
};

@Injectable({ providedIn: 'root' })
export class WompiCheckoutService {
  private readonly environment = inject(ENVIRONMENT);

  /**
   * Construye la URL del Web Checkout sin redirigir. Útil para tests y para
   * inspeccionarla antes de mandar al usuario.
   */
  buildCheckoutUrl(input: OpenCheckoutInput): string {
    const publicKey = input.intencion.public_key?.trim() || this.environment.wompiPublicKey?.trim();
    if (!publicKey) {
      throw new WompiCheckoutError('Wompi no está configurado: falta wompiPublicKey.');
    }
    if (!input.intencion.hash) {
      throw new WompiCheckoutError('El backend no devolvió la firma de integridad.');
    }
    if (!input.intencion.referencia) {
      throw new WompiCheckoutError('El backend no devolvió la referencia del pago.');
    }
    if (!Number.isFinite(input.intencion.monto_cents) || input.intencion.monto_cents <= 0) {
      throw new WompiCheckoutError('Monto inválido para iniciar el pago.');
    }

    const params = new URLSearchParams();
    params.set('public-key', publicKey);
    params.set('currency', input.intencion.moneda);
    params.set('amount-in-cents', String(input.intencion.monto_cents));
    params.set('reference', input.intencion.referencia);
    params.set('signature:integrity', input.intencion.hash);
    params.set('redirect-url', input.intencion.redirect_url);
    params.set('payment-method-type', METODO_PAGO_TO_WOMPI[input.metodoPago]);

    const customer = input.intencion.customer_data;
    if (customer?.email) params.set('customer-data:email', customer.email);
    if (customer?.full_name) params.set('customer-data:full-name', customer.full_name);
    if (customer?.phone_number) params.set('customer-data:phone-number', customer.phone_number);
    if (customer?.legal_id) params.set('customer-data:legal-id', customer.legal_id);
    if (customer?.legal_id_type) params.set('customer-data:legal-id-type', customer.legal_id_type);

    return `${WOMPI_CHECKOUT_BASE}?${params.toString()}`;
  }

  /**
   * Construye la URL y redirige el navegador. Mismo tab — Wompi devuelve por
   * `redirect-url` con `?id=<transactionId>`.
   */
  redirectToCheckout(input: OpenCheckoutInput): void {
    const url = this.buildCheckoutUrl(input);
    window.location.assign(url);
  }
}
