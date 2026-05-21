import { Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { BaseHttpService, serializeListQuery, type ListQuery } from '@reddoc/core';
import type { Contacto, ContactoListResponse, ContactoPayload } from './contacto.model';

/**
 * Servicio HTTP de contactos.
 *
 * Master administrativo del módulo General. Vive como feature directo
 * (camino B del enfoque híbrido — ver docs/architecture).
 *
 * Reutiliza `serializeListQuery` de `@reddoc/core` para mantener la misma
 * convención de paginación, filtros y ordenamiento que usan los documentos
 * — el backend espera el mismo shape para todos los endpoints listables.
 */
@Injectable({ providedIn: 'root' })
export class ContactoService extends BaseHttpService {
  private readonly resourcePath = '/general/contacto/';

  list(query: ListQuery): Observable<ContactoListResponse> {
    const body = this.paramsToRecord(serializeListQuery(query));
    return this.post<ContactoListResponse>(this.resourcePath + 'lista/', body);
  }

  getById(id: number): Observable<Contacto> {
    return this.get<Contacto>(`${this.resourcePath}${id}/`);
  }

  create(payload: ContactoPayload): Observable<Contacto> {
    return this.post<Contacto>(this.resourcePath, payload);
  }

  update(id: number, payload: ContactoPayload): Observable<Contacto> {
    return this.patch<Contacto>(`${this.resourcePath}${id}/`, payload);
  }

  /**
   * Elimina uno o varios contactos.
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

  /**
   * `BaseHttpService.get` espera `Record<string, ParamValue>`, no `HttpParams`.
   * Convertimos preservando los pares clave/valor que produjo `serializeListQuery`.
   */
  private paramsToRecord(params: ReturnType<typeof serializeListQuery>): Record<string, string> {
    const record: Record<string, string> = {};
    for (const key of params.keys()) {
      const value = params.get(key);
      if (value !== null) record[key] = value;
    }
    return record;
  }
}
