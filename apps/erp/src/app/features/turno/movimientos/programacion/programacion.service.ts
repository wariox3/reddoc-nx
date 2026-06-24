import { Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import {
  BaseHttpService,
  buildListBody,
  buildListParams,
  type ListQuery,
  type PaginatedResponse,
} from '@reddoc/core';
import type { Programacion } from './programacion.model';

/**
 * Servicio HTTP de programaciones.
 *
 * Movimiento del módulo Turno (sección Movimientos). Vive como feature directo
 * (mismo patrón que camino B del enfoque híbrido — ver docs/architecture).
 *
 * Reutiliza `buildListBody` de `@reddoc/core` para enviar el body
 * `{ filtros, ordenamientos }`. La paginación va como query params
 * (`buildListParams`), que es donde el backend la lee.
 */
@Injectable({ providedIn: 'root' })
export class ProgramacionService extends BaseHttpService {
  private readonly resourcePath = '/turno/programacion/';

  list(query: ListQuery): Observable<PaginatedResponse<Programacion>> {
    return this.post<PaginatedResponse<Programacion>>(
      this.resourcePath + 'lista/',
      buildListBody(query),
      buildListParams(query),
    );
  }

  getById(id: number): Observable<Programacion> {
    return this.get<Programacion>(`${this.resourcePath}${id}/`);
  }

  /**
   * Elimina una o varias programaciones.
   * El backend no expone batch-delete, así que paralelizamos DELETEs
   * individuales con `forkJoin`.
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
