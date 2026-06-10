import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { I18nService, startOfToday } from '@reddoc/core';
import type { AppDict } from '@erp/i18n';

/**
 * Modal de la acción "generar": un único input de fecha.
 *
 * Se abre con `DialogService.open(...)` desde `GenerarDocumentoActionStrategy`.
 * No conoce el endpoint ni el payload: al confirmar cierra el dialog emitiendo
 * el `Date` elegido por `ref.onClose`; al cancelar emite `null`. El strategy es
 * quien decide qué hacer con la fecha.
 */
@Component({
  selector: 'app-generar-documento-modal',
  standalone: true,
  imports: [FormsModule, DatePickerModule, ButtonModule],
  templateUrl: './generar-documento-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenerarDocumentoModalComponent {
  private readonly ref = inject(DynamicDialogRef);
  private readonly i18n = inject<I18nService<AppDict>>(I18nService);

  protected readonly t = this.i18n.t;

  /** Fecha seleccionada; arranca en hoy a medianoche local. */
  protected readonly fecha = signal<Date | null>(startOfToday());

  protected confirm(): void {
    const fecha = this.fecha();
    if (!fecha) return;
    this.ref.close(fecha);
  }

  protected cancel(): void {
    this.ref.close(null);
  }
}
