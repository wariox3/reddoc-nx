import { Component, inject } from '@angular/core';
import { I18nService } from '@reddoc/core';
import type { AppDict } from '../../../i18n';

/**
 * Placeholder temporal de la lista de contactos.
 *
 * Existe para validar que el routing dinámico + sidebar + módulo registrado
 * funcionan end-to-end. Se reemplaza por `BaseListComponent` en la fase 4
 * del plan de implementación (ver docs/architecture/erp-module-architecture.md).
 */
@Component({
  selector: 'app-contacto-list-placeholder',
  standalone: true,
  template: `
    <div class="flex flex-col items-center justify-center p-8 text-center">
      <i class="pi pi-users mb-4 text-4xl text-brand-muted"></i>
      <h2 class="m-0 text-lg font-bold text-brand-navy">
        {{ t().modules.general.entities.contacto.name }}
      </h2>
      <p class="mt-2 max-w-sm text-sm text-brand-muted">
        {{ t().common.comingSoon }}
      </p>
    </div>
  `,
})
export class ContactoListPlaceholderComponent {
  private readonly i18n = inject<I18nService<AppDict>>(I18nService);
  protected readonly t = this.i18n.t;
}
