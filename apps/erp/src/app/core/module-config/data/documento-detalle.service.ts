import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '@reddoc/core';

/** Endpoint CRUD de líneas de documento (compartido por todos los documentos). */
const DOCUMENTO_DETALLE_ENDPOINT = '/general/documento-detalle/';

/**
 * CRUD de **líneas de documento** (`/api/general/documento-detalle/`).
 *
 * Las líneas son transversales a todo documento transaccional del framework
 * (camino A): factura, nota crédito, nota débito, contrato servicio, etc. Todas
 * transaccionan igual (POST con el `documento` FK, PATCH por `id`), así que el
 * CRUD vive aquí —en el framework— y no duplicado en cada feature.
 *
 * Es **agnóstico del documento**: el body viaja como `object` genérico y el tipo
 * de lectura se parametriza por llamada (`crear<MiDetalleRead>(…)`); los tipos
 * concretos de cada documento se quedan en su feature.
 */
@Injectable({ providedIn: 'root' })
export class DocumentoDetalleService extends BaseHttpService {
  /** Crea una línea asociada al documento `documentoId`. Devuelve la línea creada. */
  crear<TRead = unknown>(documentoId: number, payload: object): Observable<TRead> {
    return this.post<TRead>(DOCUMENTO_DETALLE_ENDPOINT, { ...payload, documento: documentoId });
  }

  /** Actualiza una línea existente por su `id`. */
  actualizar<TRead = unknown>(id: number, payload: object): Observable<TRead> {
    return this.patch<TRead>(`${DOCUMENTO_DETALLE_ENDPOINT}${id}/`, payload);
  }
}
