import { Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import {
  BaseHttpService,
  buildListBody,
  buildListParams,
  type ListQuery,
  type PaginatedResponse,
} from '@reddoc/core';
import type { Secuencia } from './secuencia.model';

/**
 * Servicio HTTP de secuencias.
 *
 * Master administrativo del módulo Turno. Vive como feature directo
 * (camino B del enfoque híbrido — ver docs/architecture).
 *
 * Reutiliza `buildListBody` de `@reddoc/core` para enviar el body
 * `{ filtros, ordenamientos }`. La paginación va como query params
 * (`buildListParams`), que es donde el backend la lee.
 *
 * Tenant-scoped por default (`/turno/*` vive en el schema del tenant); no se
 * sobreescribe `tenantScoped`. `create`/`update` se agregarán con el formulario.
 */
@Injectable({ providedIn: 'root' })
export class SecuenciaService extends BaseHttpService {
  private readonly resourcePath = '/turno/secuencia/';

  list(query: ListQuery): Observable<PaginatedResponse<Secuencia>> {
    return this.post<PaginatedResponse<Secuencia>>(
      this.resourcePath + 'lista/',
      buildListBody(query),
      buildListParams(query),
    );
  }

  getById(id: number): Observable<Secuencia> {
    return this.get<Secuencia>(`${this.resourcePath}${id}/`);
  }

  /**
   * Elimina una o varias secuencias.
   * El backend de masters no expone batch-delete, así que paralelizamos
   * DELETEs individuales con `forkJoin`.
   */
  remove(ids: readonly number[]): Observable<void> {
    if (ids.length === 0) {
      // forkJoin con array vacío completa sin emitir; usamos un Observable que
      // emite inmediatamente para mantener el contrato.
      return new Observable<void>((subscriber) => {
        subscriber.next();
        subscriber.complete();
      });
    }
    const deletions = ids.map((id) => this.delete<void>(`${this.resourcePath}${id}/`));
    return forkJoin(deletions).pipe(map(() => undefined));
  }
}
