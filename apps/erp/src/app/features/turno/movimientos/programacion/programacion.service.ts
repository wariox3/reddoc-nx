import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '@reddoc/core';
import type { CrearProgramacionPayload } from './programacion.model';

/**
 * Servicio HTTP de programaciones (endpoints propios de turno).
 *
 * El **listado** y el **borrado** NO viven acá: la programación es una vista de
 * los documentos de pedido servicio (tipo 35), así que el shell del listado
 * reusa el `ENTITY_DATA_GATEWAY` del framework de documentos
 * (ver `PROGRAMACION_DOCUMENT_CONFIG`). Este servicio queda para los endpoints
 * específicos de turno que no cubre ese gateway.
 */
@Injectable({ providedIn: 'root' })
export class ProgramacionService extends BaseHttpService {
  private readonly resourcePath = '/turno/programacion/';

  /**
   * Detalle de una programación por id del documento.
   *
   * `GET /turno/programacion/detalle/?documento=<id_del_documento>` — el
   * `documento` es el id del documento de la fila (no el `documento_tipo_id`).
   *
   * TODO: tipar la respuesta cuando se confirme el shape.
   */
  getDetalle(documentoId: number): Observable<unknown> {
    return this.get<unknown>(`${this.resourcePath}detalle/`, { documento: documentoId });
  }

  /**
   * Crea la programación de un contrato en un puesto
   * (`POST /turno/programacion/crear-programacion/`).
   *
   * TODO: tipar la respuesta cuando se confirme el shape.
   */
  crearProgramacion(payload: CrearProgramacionPayload): Observable<unknown> {
    return this.post<unknown>(`${this.resourcePath}crear-programacion/`, payload);
  }
}
