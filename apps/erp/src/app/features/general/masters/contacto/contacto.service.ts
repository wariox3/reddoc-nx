import { Injectable } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { BaseHttpService, buildListBody, type ListQuery } from '@reddoc/core';
import type {
  ConsultaDianResponse,
  Contacto,
  ContactoImportResult,
  ContactoListResponse,
  ContactoPayload,
} from './contacto.model';

/**
 * Servicio HTTP de contactos.
 *
 * Master administrativo del módulo General. Vive como feature directo
 * (camino B del enfoque híbrido — ver docs/architecture).
 *
 * Reutiliza `buildListBody` de `@reddoc/core` para enviar el body
 * `{ filtros, ordenamientos, pagina, tamano_pagina }` — la misma convención de
 * filtros y ordenamiento que esperan todos los endpoints listables del backend.
 */
@Injectable({ providedIn: 'root' })
export class ContactoService extends BaseHttpService {
  private readonly resourcePath = '/general/contacto/';

  list(query: ListQuery): Observable<ContactoListResponse> {
    return this.post<ContactoListResponse>(this.resourcePath + 'lista/', buildListBody(query));
  }

  getById(id: number): Observable<Contacto> {
    return this.get<Contacto>(`${this.resourcePath}${id}/`);
  }

  create(payload: ContactoPayload): Observable<Contacto> {
    return this.post<Contacto>(this.resourcePath, payload);
  }

  update(id: number, payload: ContactoPayload): Observable<Contacto> {
    return this.put<Contacto>(`${this.resourcePath}${id}/`, payload);
  }

  /**
   * Pregunta al backend si la combinación tipo de identificación + número
   * ya existe en otro contacto. Respuesta: `existe: true` ⇒ ya existe.
   */
  validar(data: {
    identificacion_id: number;
    numero_identificacion: string;
  }): Observable<{ existe: boolean }> {
    return this.post<{ existe: boolean }>(`${this.resourcePath}validar/`, data);
  }

  /**
   * Consulta el registro de la DIAN por tipo + número de identificación.
   * Si `encontrado` es `true`, devuelve nombre y correo para autocompletar el
   * formulario de alta.
   */
  consultarDian(params: {
    identificacion_id: number;
    numero_identificacion: string;
  }): Observable<ConsultaDianResponse> {
    return this.get<ConsultaDianResponse>(`${this.resourcePath}consulta-dian/`, params);
  }

  /**
   * Importación masiva desde un archivo Excel.
   *
   * HttpClient detecta el `FormData` y arma el `multipart/form-data` con el
   * boundary correcto — no hay que setear `Content-Type` manualmente. El campo
   * `archivo` es el contrato que espera el backend.
   */
  importar(file: File): Observable<ContactoImportResult> {
    const form = new FormData();
    form.append('archivo', file, file.name);
    return this.post<ContactoImportResult>(`${this.resourcePath}importar/`, form);
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
}
