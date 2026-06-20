import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { BillingProfile } from '../../../../models/billing-profile.model';
import { SuscripcionTipo } from '../../../../models/suscripcion-tipo.model';
import {
  annualTotal as computeAnnualTotal,
  displayedMonthly,
  formatCop,
} from '../../utils/plan-pricing';

@Component({
  selector: 'app-plan-summary-card',
  standalone: true,
  templateUrl: './plan-summary-card.component.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanSummaryCardComponent {
  readonly plan = input.required<SuscripcionTipo>();
  readonly annual = input<boolean>(false);
  readonly billingProfile = input<BillingProfile | null>(null);
  readonly saldoNoConsumido = input<number>(0);
  readonly totalAPagar = input<number | null>(null);

  readonly costoNuevoPlan = computed(() =>
    this.annual()
      ? computeAnnualTotal(this.plan().precio)
      : displayedMonthly(this.plan().precio, false),
  );

  readonly totalEfectivo = computed(() => this.totalAPagar() ?? this.costoNuevoPlan());

  /** Monto del ciclo actual con el saldo aplicado. */
  readonly chargeAmountLabel = computed(() => formatCop(this.totalEfectivo()));

  readonly chargeSuffix = computed(() => (this.annual() ? '/año' : '/mes'));

  /** Equivalente mensual; solo se muestra en modo anual como referencia secundaria. */
  readonly monthlyEquivalentLabel = computed(() =>
    formatCop(displayedMonthly(this.plan().precio, this.annual())),
  );

  readonly frecuenciaLabel = computed(() => (this.annual() ? 'Anual · 10% off' : 'Mensual'));

  readonly subtotalLabel = computed(() => formatCop(this.costoNuevoPlan()));

  readonly saldoLabel = computed(() => formatCop(this.saldoNoConsumido()));

  readonly mostrarSaldo = computed(() => this.saldoNoConsumido() > 0);

  readonly cubiertoConSaldo = computed(() => this.totalEfectivo() === 0);
}
