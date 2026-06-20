import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { BaseHttpService } from '@reddoc/core';

/** Endpoint genérico de generación de documentos a partir de otro tipo. */
const GENERAR_ENDPOINT = '/general/documento/generar/';

/**
 * Payload de `POST /general/documento/generar/`.
 * Genera un documento de `documento_tipo_id_destino` a partir de los documentos
 * de `documento_tipo_id` del período `mes` (1-12) / `anio`.
 */
export interface GenerarDocumentoPayload {
  readonly documento_tipo_id: number;
  readonly documento_tipo_id_destino: number;
  readonly mes: number;
  readonly anio: number;
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
