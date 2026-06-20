import { InjectionToken } from '@angular/core';
import type { EntityActionStrategy } from './entity-action-strategy';

/**
 * Multi-provider token de los strategies de acciones extra del ERP.
 *
 * Cada acción se registra con
 * `{ provide: ENTITY_ACTION_STRATEGY, useClass: XActionStrategy, multi: true }`
 * (ver `ENTITY_ACTION_PROVIDERS`). El `BaseDocumentListComponent` inyecta el
 * array completo y lo filtra por `document.extraActionIds`.
 *
 * Se usa un token multi-provider — y no una constante tipo `ERP_MODULE_REGISTRY` —
 * porque los strategies son servicios con dependencias (inyectan `DialogService`,
 * su servicio HTTP, `ToastService`, `I18nService`): necesitan pasar por DI.
 */
export const ENTITY_ACTION_STRATEGY = new InjectionToken<readonly EntityActionStrategy[]>(
  'ENTITY_ACTION_STRATEGY',
);
