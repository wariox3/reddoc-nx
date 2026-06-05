import { Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { BaseHttpService, buildListBody, type ListQuery } from '@reddoc/core';
import type {
  CentroCosto,
  CentroCostoListResponse,
  CentroCostoPayload,
} from './centro-costo.model';

@Injectable({ providedIn: 'root' })
export class CentroCostoService extends BaseHttpService {
  private readonly resourcePath = '/contabilidad/centro-costo/';

  list(query: ListQuery): Observable<CentroCostoListResponse> {
    return this.post<CentroCostoListResponse>(this.resourcePath + 'lista/', buildListBody(query));
  }

  getById(id: number): Observable<CentroCosto> {
    return this.get<CentroCosto>(`${this.resourcePath}${id}/`);
  }

  create(payload: CentroCostoPayload): Observable<CentroCosto> {
    return this.post<CentroCosto>(this.resourcePath, payload);
  }

  update(id: number, payload: CentroCostoPayload): Observable<CentroCosto> {
    return this.put<CentroCosto>(`${this.resourcePath}${id}/`, payload);
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
