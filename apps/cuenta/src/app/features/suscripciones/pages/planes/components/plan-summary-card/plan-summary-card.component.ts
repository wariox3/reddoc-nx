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

  readonly monthlyLabel = computed(() =>
    formatCop(displayedMonthly(this.plan().precio, this.annual())),
  );

  readonly annualTotalLabel = computed(() => formatCop(computeAnnualTotal(this.plan().precio)));

  readonly frecuenciaLabel = computed(() => (this.annual() ? 'Anual · 10% off' : 'Mensual'));
}
