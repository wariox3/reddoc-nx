import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BaseHttpService, buildListBody, buildListParams, type ListQuery } from '@reddoc/core';
import type { LineaPendienteApi } from './importar-documento.types';

/** Endpoint de líneas pendientes por afectar (origen del "importar desde documento"). */
const PENDIENTE_ENDPOINT = '/general/documento-detalle/pendiente/';

/** Respuesta paginada cruda del backend (Django REST). */
interface PendienteApiResponse {
  readonly count: number;
  readonly results: readonly LineaPendienteApi[];
}

/** Página de líneas pendientes ya normalizada para la tabla del modal. */
export interface PendientesPage {
  readonly results: readonly LineaPendienteApi[];
  readonly totalCount: number;
}

/**
 * Acceso a las **líneas pendientes** que alimentan el modal de "importar desde
 * documento". Usa la misma convención de listas del ERP (body
 * `{ filtros, ordenamientos }` + paginación por query params), reutilizando los
 * helpers autoritativos de `@reddoc/core` para no inventar vocabulario propio.
 */
@Injectable({ providedIn: 'root' })
export class ImportarDocumentoService extends BaseHttpService {
  /**
   * Lista líneas pendientes con filtros/orden/paginación.
   * `POST /general/documento-detalle/pendiente/` → traduce `count` a `totalCount`.
   */
  listarPendientes(query: ListQuery): Observable<PendientesPage> {
    return this.post<PendienteApiResponse>(
      PENDIENTE_ENDPOINT,
      buildListBody(query),
      buildListParams(query),
    ).pipe(map((res) => ({ results: res.results, totalCount: res.count })));
  }
}
