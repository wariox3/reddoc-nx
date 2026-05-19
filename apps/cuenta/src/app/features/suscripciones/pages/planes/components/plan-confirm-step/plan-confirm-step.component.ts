import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import {
  getPlanDescription,
  getPlanFeatures,
  resolvePlanCategory,
  resolvePlanTier,
} from '@reddoc/core';
import type { PlanFeature } from '@reddoc/core';
import { BillingProfile } from '../../../../models/billing-profile.model';
import { SuscripcionTipo } from '../../../../models/suscripcion-tipo.model';
import {
  annualTotal as computeAnnualTotal,
  displayedMonthly,
  formatCop,
} from '../../utils/plan-pricing';

@Component({
  selector: 'app-plan-confirm-step',
  standalone: true,
  templateUrl: './plan-confirm-step.component.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanConfirmStepComponent {
  readonly plan = input.required<SuscripcionTipo>();
  readonly billingProfile = input<BillingProfile | null>(null);
  readonly annual = input<boolean>(false);

  readonly cambiarPlan = output<void>();
  readonly cambiarFacturacion = output<void>();

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

  readonly includedFeatures = computed(() => this.features().filter((f) => f.included));

  readonly esRecomendado = computed(() => this.plan().nombre.startsWith('Expansión'));

  readonly categoriaLabel = computed(() => {
    const c = resolvePlanCategory(this.plan().suscripcion_categoria_id);
    if (c === 'facturacion') return 'Facturación';
    if (c === 'erp') return 'ERP';
    return '';
  });

  readonly frecuenciaLabel = computed(() => (this.annual() ? 'Anual' : 'Mensual'));

  readonly chargeAmountLabel = computed(() =>
    this.annual()
      ? formatCop(computeAnnualTotal(this.plan().precio))
      : formatCop(displayedMonthly(this.plan().precio, false)),
  );

  readonly chargeSuffix = computed(() => (this.annual() ? '/año' : '/mes'));

  readonly subtotalLabel = computed(() =>
    formatCop(
      this.annual()
        ? displayedMonthly(this.plan().precio, false) * 12
        : displayedMonthly(this.plan().precio, false),
    ),
  );

  readonly descuentoAnualLabel = computed(() => {
    if (!this.annual()) return null;
    const base = displayedMonthly(this.plan().precio, false) * 12;
    const total = computeAnnualTotal(this.plan().precio);
    return formatCop(Math.max(0, base - total));
  });

  readonly monthlyEquivalentLabel = computed(() =>
    formatCop(displayedMonthly(this.plan().precio, this.annual())),
  );

  readonly proximaRenovacionLabel = computed(() => {
    const now = new Date();
    const next = new Date(now);
    if (this.annual()) {
      next.setFullYear(now.getFullYear() + 1);
    } else {
      next.setMonth(now.getMonth() + 1);
    }
    return next.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  });

  onCambiarPlan(): void {
    this.cambiarPlan.emit();
  }

  onCambiarFacturacion(): void {
    this.cambiarFacturacion.emit();
  }
}
