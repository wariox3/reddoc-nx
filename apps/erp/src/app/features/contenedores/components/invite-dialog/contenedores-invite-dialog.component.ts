import { Component, inject, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { I18nService } from '@reddoc/core';
import { Contenedor } from '../../models/contenedor.model';
import { ContenedorInviteFormComponent } from './contenedor-invite-form.component';
import type { AppDict } from '../../../../i18n';

@Component({
  selector: 'app-contenedores-invite-dialog',
  standalone: true,
  imports: [DialogModule, ButtonModule, ContenedorInviteFormComponent],
  templateUrl: './contenedores-invite-dialog.component.html',
  styleUrl: './contenedores-invite-dialog.component.scss',
})
export class ContenedoresInviteDialogComponent {
  private readonly i18n = inject<I18nService<AppDict>>(I18nService);

  protected readonly t = this.i18n.t;

  readonly visible = input<boolean>(false);
  readonly contenedor = input<Contenedor | null>(null);
  readonly visibleChange = output<boolean>();

  onClose(): void {
    this.visibleChange.emit(false);
  }
}
