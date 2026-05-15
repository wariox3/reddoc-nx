import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { getInitials } from '@reddoc/core';
import { I18nService } from '../../i18n/i18n.service';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestimonialsComponent {
  readonly t = inject(I18nService).t;

  initials(name: string): string {
    return getInitials(name);
  }
}
