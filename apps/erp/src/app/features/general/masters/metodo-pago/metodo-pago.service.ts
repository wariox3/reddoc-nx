import { Injectable } from '@angular/core';
import { Observable, forkJoin, map, of } from 'rxjs';
import {
  BaseHttpService,
  buildListBody,
  buildListParams,
  type ListQuery,
  type PaginatedResponse,
} from '@reddoc/core';
import type { MetodoPago, MetodoPagoPayload } from './metodo-pago.model';

@Injectable({ providedIn: 'root' })
export class MetodoPagoService extends BaseHttpService {
  private readonly resourcePath = '/general/metodo-pago/';

  list(query: ListQuery): Observable<PaginatedResponse<MetodoPago>> {
    return this.post<PaginatedResponse<MetodoPago>>(
      this.resourcePath + 'lista/',
      buildListBody(query),
      buildListParams(query),
    );
  }

  getById(id: number): Observable<MetodoPago> {
    return this.get<MetodoPago>(`${this.resourcePath}${id}/`);
  }

  create(payload: MetodoPagoPayload): Observable<MetodoPago> {
    return this.post<MetodoPago>(this.resourcePath, payload);
  }

  update(id: number, payload: MetodoPagoPayload): Observable<MetodoPago> {
    return this.put<MetodoPago>(`${this.resourcePath}${id}/`, payload);
  }

  remove(ids: readonly number[]): Observable<void> {
    if (ids.length === 0) return of(undefined);
    return forkJoin(ids.map((id) => this.delete<void>(`${this.resourcePath}${id}/`))).pipe(
      map(() => undefined),
    );
  }
}
