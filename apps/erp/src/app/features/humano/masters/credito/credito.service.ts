import { Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import {
  BaseHttpService,
  buildListBody,
  buildListParams,
  type ListQuery,
  type PaginatedResponse,
} from '@reddoc/core';
import type { Credito, CreditoPayload } from './credito.model';

@Injectable({ providedIn: 'root' })
export class CreditoService extends BaseHttpService {
  private readonly resourcePath = '/humano/credito/';

  list(query: ListQuery): Observable<PaginatedResponse<Credito>> {
    return this.post<PaginatedResponse<Credito>>(
      this.resourcePath + 'lista/',
      buildListBody(query),
      buildListParams(query),
    );
  }

  getById(id: number): Observable<Credito> {
    return this.get<Credito>(`${this.resourcePath}${id}/`);
  }

  create(payload: CreditoPayload): Observable<Credito> {
    return this.post<Credito>(this.resourcePath, payload);
  }

  update(id: number, payload: CreditoPayload): Observable<Credito> {
    return this.put<Credito>(`${this.resourcePath}${id}/`, payload);
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
