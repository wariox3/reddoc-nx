import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { BillingProfile } from '../../../../models/billing-profile.model';

@Component({
  selector: 'app-billing-profile-delete-dialog',
  standalone: true,
  imports: [DialogModule, ButtonModule],
  templateUrl: './billing-profile-delete-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingProfileDeleteDialogComponent {
  readonly visible = input<boolean>(false);
  readonly profile = input<BillingProfile | null>(null);
  readonly isSubmitting = input<boolean>(false);

  readonly visibleChange = output<boolean>();
  readonly confirm = output<BillingProfile>();

  onCancel(): void {
    if (this.isSubmitting()) return;
    this.visibleChange.emit(false);
  }

  onConfirm(): void {
    const p = this.profile();
    if (!p || this.isSubmitting()) return;
    this.confirm.emit(p);
  }
}
