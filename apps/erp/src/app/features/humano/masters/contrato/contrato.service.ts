import { Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import {
  BaseHttpService,
  buildListBody,
  buildListParams,
  type ListQuery,
  type PaginatedResponse,
} from '@reddoc/core';
import type { Contrato, ContratoPayload } from './contrato.model';

@Injectable({ providedIn: 'root' })
export class ContratoService extends BaseHttpService {
  private readonly resourcePath = '/humano/contrato/';

  list(query: ListQuery): Observable<PaginatedResponse<Contrato>> {
    return this.post<PaginatedResponse<Contrato>>(
      this.resourcePath + 'lista/',
      buildListBody(query),
      buildListParams(query),
    );
  }

  getById(id: number): Observable<Contrato> {
    return this.get<Contrato>(`${this.resourcePath}${id}/`);
  }

  create(payload: ContratoPayload): Observable<Contrato> {
    return this.post<Contrato>(this.resourcePath, payload);
  }

  update(id: number, payload: ContratoPayload): Observable<Contrato> {
    return this.put<Contrato>(`${this.resourcePath}${id}/`, payload);
  }

  remove(ids: readonly number[]): Observable<void> {
    if (ids.length === 0) {
      return new Observable<void>((subscriber) => {
        subscriber.next();
        subscriber.complete();
      });
    }
    const deletions = ids.map((id) => this.delete<void>(`${this.resourcePath}${id}/`));
    return forkJoin(deletions).pipe(map(() => undefined));
  }
}
