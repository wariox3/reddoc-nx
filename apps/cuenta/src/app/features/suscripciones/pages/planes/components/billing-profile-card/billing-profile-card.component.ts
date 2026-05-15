import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { BillingProfile } from '../../../../models/billing-profile.model';

@Component({
  selector: 'app-billing-profile-card',
  standalone: true,
  templateUrl: './billing-profile-card.component.html',
  host: { class: 'block h-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingProfileCardComponent {
  readonly profile = input.required<BillingProfile>();
  readonly selected = input<boolean>(false);

  readonly profileSelected = output<BillingProfile>();

  readonly tipoHint = computed(() =>
    this.profile().tipo === 'NIT' ? 'Persona jurídica' : 'Persona natural',
  );

  onClick(): void {
    this.profileSelected.emit(this.profile());
  }
}
