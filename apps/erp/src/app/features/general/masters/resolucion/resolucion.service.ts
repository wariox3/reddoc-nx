import { Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import {
  BaseHttpService,
  buildListBody,
  buildListParams,
  type ListQuery,
  type PaginatedResponse,
} from '@reddoc/core';
import type { Resolucion, ResolucionPayload } from './resolucion.model';

@Injectable({ providedIn: 'root' })
export class ResolucionService extends BaseHttpService {
  private readonly resourcePath = '/general/resolucion/';

  list(query: ListQuery): Observable<PaginatedResponse<Resolucion>> {
    return this.post<PaginatedResponse<Resolucion>>(
      this.resourcePath + 'lista/',
      buildListBody(query),
      buildListParams(query),
    );
  }

  getById(id: number): Observable<Resolucion> {
    return this.get<Resolucion>(`${this.resourcePath}${id}/`);
  }

  create(payload: ResolucionPayload): Observable<Resolucion> {
    return this.post<Resolucion>(this.resourcePath, payload);
  }

  update(id: number, payload: ResolucionPayload): Observable<Resolucion> {
    return this.put<Resolucion>(`${this.resourcePath}${id}/`, payload);
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
