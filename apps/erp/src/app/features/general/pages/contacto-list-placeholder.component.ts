import { JsonPipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { I18nService, type EntityConfig } from '@reddoc/core';
import type { AppDict } from '../../../i18n';

/**
 * Placeholder temporal de la lista de contactos.
 *
 * Existe para validar end-to-end que el routing + resolvers + sidebar funcionan:
 * el componente recibe la `entity` resuelta por `activeEntityResolver` vía
 * `withComponentInputBinding()` y la muestra en pantalla.
 *
 * Se reemplaza por `BaseListComponent` en la fase 4 del plan de implementación.
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
      @if (entity(); as resolvedEntity) {
        <pre
          class="mt-6 max-w-xl overflow-auto rounded-md bg-slate-50 p-3 text-left text-[0.65rem] text-brand-muted"
          >{{ resolvedEntity | json }}</pre
        >
      }
    </div>
  `,
  imports: [JsonPipe],
})
export class ContactoListPlaceholderComponent {
  private readonly i18n = inject<I18nService<AppDict>>(I18nService);
  protected readonly t = this.i18n.t;

  /**
   * Entidad inyectada por `activeEntityResolver`.
   * Disponible gracias a `withComponentInputBinding()` en `provideRouter`.
   */
  readonly entity = input.required<EntityConfig>();
}
