import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { serializeListQuery, type ListQuery, type ListResponse } from '@reddoc/core';
import type { EntityConfig } from '../types/entity-config.types';
import type { EntityDataGateway } from './entity-data-gateway';

/**
 * Forma de la respuesta paginada cruda del backend.
 * El gateway la traduce a `ListResponse` (contrato del framework).
 */
interface PaginatedApiResponse {
  readonly count: number;
  readonly results: readonly unknown[];
}

/**
 * Implementación HTTP default del `EntityDataGateway` para documentos
 * transaccionales del framework configuracional.
 *
 * Convenciones del backend (alineadas con Django REST framework):
 *  - Paginación: `count` (total) y `results` (página actual).
 *  - Batch delete: POST `<endpoint>/eliminar/` con `{ ids: [...] }`.
 *  - Filtros: query params `field__operator=value` (helper compartido).
 *  - Ordering: `?ordering=field` o `?ordering=-field` para descendente.
 *
 * Si una convención cambia, basta proveer otra implementación de
 * `EntityDataGateway` — los componentes base no se enteran.
 */
@Injectable({ providedIn: 'root' })
export class HttpEntityDataGateway implements EntityDataGateway {
  private readonly http = inject(HttpClient);

  list(entity: EntityConfig, query: ListQuery): Observable<ListResponse> {
    const params = serializeListQuery(query);
    return this.http.get<PaginatedApiResponse>(entity.endpoint, { params }).pipe(
      map((response) => ({
        results: response.results,
        totalCount: response.count,
      })),
    );
  }

  getById(entity: EntityConfig, id: string | number): Observable<unknown> {
    return this.http.get(`${entity.endpoint}/${id}/`);
  }

  create(entity: EntityConfig, payload: unknown): Observable<unknown> {
    return this.http.post(`${entity.endpoint}/`, payload);
  }

  update(entity: EntityConfig, id: string | number, payload: unknown): Observable<unknown> {
    return this.http.patch(`${entity.endpoint}/${id}/`, payload);
  }

  /**
   * Elimina uno o varios documentos en batch.
   * El backend acepta un solo POST con la lista de ids — más eficiente que
   * paralelizar DELETEs y consistente con la convención de documentos.
   */
  remove(entity: EntityConfig, ids: readonly (string | number)[]): Observable<void> {
    return this.http.post<void>(`${entity.endpoint}/eliminar/`, { ids }).pipe(map(() => undefined));
  }
}
