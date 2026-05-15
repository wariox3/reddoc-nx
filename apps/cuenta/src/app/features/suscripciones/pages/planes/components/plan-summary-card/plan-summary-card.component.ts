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

  /** Monto del ciclo actual: año en modo anual, mes en mensual. Es el número grande. */
  readonly chargeAmountLabel = computed(() =>
    this.annual()
      ? formatCop(computeAnnualTotal(this.plan().precio))
      : formatCop(displayedMonthly(this.plan().precio, false)),
  );

  readonly chargeSuffix = computed(() => (this.annual() ? '/año' : '/mes'));

  /** Equivalente mensual; solo se muestra en modo anual como referencia secundaria. */
  readonly monthlyEquivalentLabel = computed(() =>
    formatCop(displayedMonthly(this.plan().precio, this.annual())),
  );

  readonly frecuenciaLabel = computed(() => (this.annual() ? 'Anual · 10% off' : 'Mensual'));
}
