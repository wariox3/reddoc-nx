import type { Provider } from '@angular/core';
import { ENTITY_ACTION_STRATEGY } from './entity-action.token';
import { GenerarDocumentoActionStrategy } from './generar/generar-documento-action.strategy';

/**
 * Providers de TODAS las acciones extra del ERP. Se spreadea en `app.config.ts`.
 *
 * Agregar una acción nueva = una línea aquí (+ sus archivos en `actions/<nueva>/`
 * + el id en el `extraActionIds` del documento que la quiera). Ni el
 * `BaseDocumentListComponent` ni el toolbar se tocan.
 */
export const ENTITY_ACTION_PROVIDERS: readonly Provider[] = [
  { provide: ENTITY_ACTION_STRATEGY, useClass: GenerarDocumentoActionStrategy, multi: true },
];
