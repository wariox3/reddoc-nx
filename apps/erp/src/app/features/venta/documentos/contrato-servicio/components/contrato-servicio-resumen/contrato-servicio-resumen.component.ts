import { Component, inject, input } from '@angular/core';
import { I18nService, formatCop, type ResumenDocumento } from '@reddoc/core';
import type { AppDict } from '@erp/i18n';

@Component({
  selector: 'app-contrato-servicio-resumen',
  standalone: true,
  templateUrl: './contrato-servicio-resumen.component.html',
})
export class ContratoServicioResumenComponent {
  private readonly i18n = inject<I18nService<AppDict>>(I18nService);
  protected readonly t = this.i18n.t;
  readonly resumen = input.required<ResumenDocumento>();
  protected readonly formatMoney = formatCop;
}
