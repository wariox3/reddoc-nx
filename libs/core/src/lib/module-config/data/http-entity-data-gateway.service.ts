import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import type {
  DocumentEntityConfig,
  EntityConfig,
  MasterEntityConfig,
} from '../types/entity-config.types';
import type { EntityDataGateway } from './entity-data-gateway';
import type { FilterCondition, ListQuery, ListResponse, SortSpec } from './list-query.types';

/**
 * Forma de la respuesta paginada cruda del backend.
 * El gateway la traduce a `ListResponse` (el contrato del framework).
 */
interface PaginatedApiResponse {
  readonly count: number;
  readonly results: readonly unknown[];
}

/**
 * Implementación HTTP default del `EntityDataGateway`.
 *
 * Convenciones que asume:
 *  - El backend pagina con `count` (total) y `results` (página actual).
 *  - Documentos transaccionales soportan batch-delete vía POST a `<endpoint>/eliminar/`.
 *  - Masters usan DELETE individual por id (paralelizado con forkJoin).
 *  - Filtros se serializan como query params usando la convención `field__operator=value`.
 *
 * Si el backend cambia estas convenciones, basta proveer otra implementación de
 * `EntityDataGateway` — los componentes base no se enteran.
 */
@Injectable({ providedIn: 'root' })
export class HttpEntityDataGateway implements EntityDataGateway {
  private readonly http = inject(HttpClient);

  list(entity: EntityConfig, query: ListQuery): Observable<ListResponse> {
    this.assertOperatesOnData(entity, 'list');
    const params = this.buildListParams(query);
    return this.http.get<PaginatedApiResponse>(entity.endpoint, { params }).pipe(
      map((response) => ({
        results: response.results,
        totalCount: response.count,
      })),
    );
  }

  getById(entity: EntityConfig, id: string | number): Observable<unknown> {
    this.assertOperatesOnData(entity, 'getById');
    return this.http.get(`${entity.endpoint}/${id}/`);
  }

  create(entity: EntityConfig, payload: unknown): Observable<unknown> {
    this.assertOperatesOnData(entity, 'create');
    return this.http.post(`${entity.endpoint}/`, payload);
  }

  update(entity: EntityConfig, id: string | number, payload: unknown): Observable<unknown> {
    this.assertOperatesOnData(entity, 'update');
    return this.http.patch(`${entity.endpoint}/${id}/`, payload);
  }

  remove(entity: EntityConfig, ids: readonly (string | number)[]): Observable<void> {
    this.assertOperatesOnData(entity, 'remove');

    // Documentos: el backend acepta un solo POST con la lista de ids.
    if (entity.kind === 'document') {
      return this.http
        .post<void>(`${entity.endpoint}/eliminar/`, { ids })
        .pipe(map(() => undefined));
    }

    // Masters: DELETE individual por id en paralelo.
    const deletions = ids.map((id) => this.http.delete<void>(`${entity.endpoint}/${id}/`));
    return forkJoin(deletions).pipe(map(() => undefined));
  }

  /**
   * Construye los `HttpParams` para una consulta de listado.
   * Convención: `field__operator=value` para filtros, `ordering=field` o
   * `ordering=-field` para sort (Django REST style, alineado con el backend).
   */
  private buildListParams(query: ListQuery): HttpParams {
    let params = new HttpParams()
      .set('page', String(query.page + 1)) // backend es 1-based, el framework 0-based
      .set('page_size', String(query.pageSize));

    for (const filter of query.filters) {
      params = this.appendFilter(params, filter);
    }

    if (query.sort.length > 0) {
      params = params.set('ordering', this.encodeSort(query.sort));
    }

    return params;
  }

  private appendFilter(params: HttpParams, filter: FilterCondition): HttpParams {
    const key = filter.operator === 'eq' ? filter.field : `${filter.field}__${filter.operator}`;
    const serialized = Array.isArray(filter.value) ? filter.value.join(',') : String(filter.value);
    return params.set(key, serialized);
  }

  private encodeSort(sort: readonly SortSpec[]): string {
    return sort
      .map((spec) => (spec.direction === 'desc' ? `-${spec.field}` : spec.field))
      .join(',');
  }

  /**
   * Garantiza que la entidad soporte CRUD genérico. Las utilities son
   * pantallas custom sin endpoint y no admiten estas operaciones.
   *
   * Declarada como `asserts` para que TypeScript propague el narrowing
   * y los métodos públicos puedan acceder a `entity.endpoint` con seguridad.
   */
  private assertOperatesOnData(
    entity: EntityConfig,
    operation: string,
  ): asserts entity is DocumentEntityConfig | MasterEntityConfig {
    if (entity.kind === 'utility') {
      throw new Error(
        `Operation '${operation}' is not supported on utility entity '${entity.id}'.`,
      );
    }
  }
}
