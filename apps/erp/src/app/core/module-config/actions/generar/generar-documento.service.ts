import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { BaseHttpService } from '@reddoc/core';

/** Endpoint genérico de generación de documentos a partir de otro tipo. */
const GENERAR_ENDPOINT = '/general/documento/generar/';

/**
 * Payload de `POST /general/documento/generar/`.
 * Genera un documento de `documento_tipo_id_destino` a partir de los documentos
 * de `documento_tipo_id` con fecha `fecha` (formato `yyyy-MM-dd`).
 */
export interface GenerarDocumentoPayload {
  readonly documento_tipo_id: number;
  readonly documento_tipo_id_destino: number;
  readonly fecha: string;
}

/**
 * Servicio HTTP de la acción "generar".
 *
 * `tenantScoped` queda en su default `true`: el endpoint vive en el schema del
 * tenant, igual que el resto del framework de documentos (`/general/...`).
 */
@Injectable({ providedIn: 'root' })
export class GenerarDocumentoService extends BaseHttpService {
  generar(payload: GenerarDocumentoPayload): Observable<unknown> {
    return this.post<unknown>(GENERAR_ENDPOINT, payload);
  }
}
