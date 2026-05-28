import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ENVIRONMENT, resolvePlanCategory } from '@reddoc/core';
import { BillingProfile } from '../models/billing-profile.model';
import { PeriodoPago, WompiCheckoutPayload } from '../models/pago.model';
import { SuscripcionTipo } from '../models/suscripcion-tipo.model';
import {
  WOMPI_REF_STORAGE_KEY,
  armarCustomerData,
  calcularMontoCents,
  savePagoIntent,
} from '../utils/wompi-payload';
import { SuscripcionPagoService } from './suscripcion-pago.service';
import { WompiCheckoutService } from './wompi-checkout.service';

export interface IniciarPagoInput {
  readonly suscripcionId: number;
  readonly clienteId: number;
  readonly plan: SuscripcionTipo;
  readonly billingProfile: BillingProfile;
  readonly periodo: PeriodoPago;
  /** Saldo a favor del plan vigente en COP. El backend revalida. */
  readonly saldoNoConsumido?: number;
}

function categoriaLabel(categoriaId: number): string {
  const c = resolvePlanCategory(categoriaId);
  if (c === 'facturacion') return 'Facturación';
  if (c === 'erp') return 'ERP';
  return '—';
}

@Injectable({ providedIn: 'root' })
export class WompiPaymentOrchestrator {
  private readonly pagoService = inject(SuscripcionPagoService);
  private readonly wompiCheckout = inject(WompiCheckoutService);
  private readonly environment = inject(ENVIRONMENT);

  iniciarPago(input: IniciarPagoInput): Observable<void> {
    const { suscripcionId, clienteId, plan, billingProfile, periodo, saldoNoConsumido } = input;
    const baseCents = calcularMontoCents(plan.precio, periodo === 'A');
    const saldoCents = Math.round((saldoNoConsumido ?? 0) * 100);
    const monto_cents = Math.max(baseCents - saldoCents, 0);

    return this.pagoService
      .firmarIntegridad({
        suscripcion_id: suscripcionId,
        suscripcion_tipo_id: plan.id,
        periodo,
        contacto_id: billingProfile.id,
        cliente_id: clienteId,
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
          savePagoIntent({
            referencia,
            plan_id: plan.id,
            plan_nombre: plan.nombre,
            plan_categoria_label: categoriaLabel(plan.suscripcion_categoria_id),
            periodo,
            monto_cents,
            billing_nombre: billingProfile.nombre,
            billing_tipo: billingProfile.tipo,
            billing_numero: billingProfile.numero,
            billing_email: billingProfile.email,
            started_at: new Date().toISOString(),
          });
          this.wompiCheckout.redirectToCheckout({ intencion: payload });
        }),
      );
  }
}
