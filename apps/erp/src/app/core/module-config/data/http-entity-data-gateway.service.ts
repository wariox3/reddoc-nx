import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import {
  buildHttpParams,
  buildListParams,
  parseFilename,
  triggerBrowserDownload,
  type FilterCondition,
  type FilterOperator,
  type ListQuery,
  type ListResponse,
  type SortSpec,
} from '@reddoc/core';
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
 * Filtro tal como lo espera el backend de documentos en `POST /lista/`.
 * Operadores en español (`=`, `!=`, `>=`, …) y array de objetos en vez de
 * query params Django-style. El gateway traduce desde el contrato genérico
 * (`FilterCondition`) a este shape concreto.
 */
interface BackendDocumentFilter {
  readonly propiedad: string;
  readonly operador: string;
  readonly valor: string | number | boolean;
}

/**
 * Body del endpoint `POST <endpoint>/lista/`. La paginación viaja como query
 * params (`buildListParams`), no en el body.
 */
interface DocumentListBody {
  readonly filtros: readonly BackendDocumentFilter[];
  readonly ordenamientos: readonly string[];
}

/**
 * Mapeo de operadores genéricos (`FilterOperator`) a string que el backend
 * de documentos espera en `operador`. `=` para igualdad fue confirmado;
 * el resto sigue convención del legacy y se ajusta aquí si algún filtro
 * real lo contradice.
 */
const BACKEND_OPERATOR: Readonly<Record<FilterOperator, string>> = {
  eq: '=',
  neq: '!=',
  gt: '>',
  gte: '>=',
  lt: '<',
  lte: '<=',
  contains: 'icontains',
  startsWith: 'istartswith',
  endsWith: 'iendswith',
  in: 'in',
  isNull: 'isnull',
};

/**
 * Implementación HTTP default del `EntityDataGateway` para documentos
 * transaccionales del framework configuracional.
 *
 * Convenciones del backend de documentos (`/api/general/documento`):
 *  - **Listado**: POST `<endpoint>/lista/` con body `{ filtros, ordenamientos }`
 *    y la paginación como query params (`?page=…&limit=…`). El filtro por
 *    `documento_tipo_id` se inyecta automáticamente desde
 *    `DocumentEntityConfig.documentTypeId` — el componente nunca lo declara.
 *  - **Batch delete**: POST `<endpoint>/eliminar/` con `{ ids: [...] }`.
 *  - **Lectura individual / mutaciones**: REST estándar (`GET/POST/PATCH /<id>/`).
 *  - **Paginación de respuesta**: `count` (total) y `results` (página actual).
 *
 * Si una convención cambia, basta proveer otra implementación de
 * `EntityDataGateway` — los componentes base no se enteran.
 */
@Injectable({ providedIn: 'root' })
export class HttpEntityDataGateway implements EntityDataGateway {
  private readonly http = inject(HttpClient);

  list(entity: EntityConfig, query: ListQuery): Observable<ListResponse> {
    const body = this.buildListBody(entity, query);
    return this.http
      .post<PaginatedApiResponse>(`${entity.endpoint}/lista/`, body, {
        params: buildHttpParams(buildListParams(query)),
      })
      .pipe(
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

  /**
   * Exporta a Excel vía `POST <endpoint>/excel/`. Reusa el mismo `buildListBody`
   * que el listado: el Excel respeta el filtro implícito `documento_tipo_id`, los
   * `defaultFilters` y los filtros/orden activos del usuario (sin paginar). El
   * blob se consume disparando la descarga del navegador.
   */
  exportExcel(entity: EntityConfig, query: ListQuery): Observable<void> {
    const body = this.buildListBody(entity, query);
    return this.http
      .post(`${entity.endpoint}/excel/`, body, { observe: 'response', responseType: 'blob' })
      .pipe(
        map((response) => {
          const blob = response.body;
          if (!blob || blob.size === 0) {
            throw new Error('Respuesta vacía del servidor');
          }
          const filename = parseFilename(
            response.headers.get('content-disposition'),
            `${entity.id}.xlsx`,
          );
          triggerBrowserDownload(blob, filename);
        }),
      );
  }

  /**
   * Arma el body de `POST <endpoint>/lista/` a partir del `ListQuery` genérico.
   * El filtro por `documento_tipo_id` se inyecta como primer elemento —
   * es responsabilidad del framework, no del consumidor.
   */
  private buildListBody(entity: EntityConfig, query: ListQuery): DocumentListBody {
    const baseFilter: BackendDocumentFilter = {
      propiedad: 'documento_tipo_id',
      operador: '=',
      valor: entity.documentTypeId,
    };
    const userFilters = query.filters.map(toBackendFilter);
    // Filtros implícitos del documento: siempre activos, junto al baseFilter.
    const implicitFilters = (entity.defaultFilters ?? []).map(toBackendFilter);
    // Sin orden del usuario, cae al orden por defecto del documento (si lo declara).
    const sort = query.sort.length > 0 ? query.sort : (entity.defaultSort ?? []);
    return {
      filtros: [baseFilter, ...implicitFilters, ...userFilters],
      ordenamientos: sort.map(encodeSort),
    };
  }
}

function toBackendFilter(condition: FilterCondition): BackendDocumentFilter {
  return {
    propiedad: condition.field,
    operador: BACKEND_OPERATOR[condition.operator],
    valor: normalizeFilterValue(condition.value),
  };
}

function normalizeFilterValue(value: FilterCondition['value']): string | number | boolean {
  // `Array.isArray` no estrecha sobre `readonly`; el chequeo explícito por
  // ausencia de `join` también devolvería una unión, por lo que serializamos
  // explícitamente listas a CSV.
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  return value.join(',');
}

function encodeSort(spec: SortSpec): string {
  return spec.direction === 'desc' ? `-${spec.field}` : spec.field;
}
