import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import {
  getPlanDescription,
  getPlanFeatures,
  resolvePlanCategory,
  resolvePlanTier,
} from '@reddoc/core';
import type { PlanFeature } from '@reddoc/core';
import { SuscripcionTipo } from '../../../../models/suscripcion-tipo.model';
import {
  annualTotal as computeAnnualTotal,
  displayedMonthly,
  formatCop,
} from '../../utils/plan-pricing';

@Component({
  selector: 'app-plan-card',
  standalone: true,
  templateUrl: './plan-card.component.html',
  host: { class: 'block h-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanCardComponent {
  readonly plan = input.required<SuscripcionTipo>();
  readonly annual = input<boolean>(false);
  readonly selected = input<boolean>(false);
  readonly current = input<boolean>(false);
  readonly popular = input<boolean>(false);

  readonly planSelected = output<SuscripcionTipo>();

  readonly tierName = computed(() => {
    const nombre = this.plan().nombre;
    const space = nombre.indexOf(' ');
    return space === -1 ? nombre : nombre.slice(0, space);
  });

  readonly description = computed(() => {
    const tier = resolvePlanTier(this.plan().nombre);
    return tier ? getPlanDescription('es', tier) : '';
  });

  readonly features = computed<readonly PlanFeature[]>(() => {
    const tier = resolvePlanTier(this.plan().nombre);
    const category = resolvePlanCategory(this.plan().suscripcion_categoria_id);
    if (!tier || !category) return [];
    return getPlanFeatures('es', category, tier);
  });

  readonly monthlyLabel = computed(() =>
    formatCop(displayedMonthly(this.plan().precio, this.annual())),
  );

  readonly annualTotalLabel = computed(() => formatCop(computeAnnualTotal(this.plan().precio)));

  onClick(): void {
    if (this.current()) return;
    this.planSelected.emit(this.plan());
  }
}
