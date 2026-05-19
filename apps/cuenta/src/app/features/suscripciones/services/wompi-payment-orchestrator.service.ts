import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ENVIRONMENT } from '@reddoc/core';
import { BillingProfile } from '../models/billing-profile.model';
import { PeriodoPago, WompiCheckoutPayload } from '../models/pago.model';
import { SuscripcionTipo } from '../models/suscripcion-tipo.model';
import {
  WOMPI_REF_STORAGE_KEY,
  armarCustomerData,
  calcularMontoCents,
} from '../utils/wompi-payload';
import { SuscripcionPagoService } from './suscripcion-pago.service';
import { WompiCheckoutService } from './wompi-checkout.service';

export interface IniciarPagoInput {
  readonly suscripcionId: number;
  readonly plan: SuscripcionTipo;
  readonly billingProfile: BillingProfile;
  readonly periodo: PeriodoPago;
}

@Injectable({ providedIn: 'root' })
export class WompiPaymentOrchestrator {
  private readonly pagoService = inject(SuscripcionPagoService);
  private readonly wompiCheckout = inject(WompiCheckoutService);
  private readonly environment = inject(ENVIRONMENT);

  iniciarPago(input: IniciarPagoInput): Observable<void> {
    const { suscripcionId, plan, billingProfile, periodo } = input;
    const monto_cents = calcularMontoCents(plan.precio, periodo === 'A');

    return this.pagoService
      .firmarIntegridad({
        suscripcion_id: suscripcionId,
        suscripcion_tipo_id: plan.id,
        periodo,
        contacto_id: billingProfile.id,
        monto_cents,
        moneda: 'COP',
      })
      .pipe(
        map(({ hash, referencia }) => {
          const redirectOrigin = this.environment.wompiRedirectOrigin || window.location.origin;
          const payload: WompiCheckoutPayload = {
            referencia,
            monto_cents,
            moneda: 'COP',
            hash,
            public_key: this.environment.wompiPublicKey,
            redirect_url: `${redirectOrigin}/suscripciones/pago/resultado?ref=${encodeURIComponent(referencia)}`,
            customer_data: armarCustomerData(billingProfile),
          };
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem(WOMPI_REF_STORAGE_KEY, referencia);
          }
          this.wompiCheckout.redirectToCheckout({ intencion: payload });
        }),
      );
  }
}
