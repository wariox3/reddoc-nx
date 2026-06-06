import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '@reddoc/core';
import type {
  CalcularPrecioSupervigilanciaPayload,
  CalcularPrecioSupervigilanciaResult,
  ContratoServicioDetallePayload,
  ContratoServicioDetalleRead,
} from './contrato-servicio.model';

/** Endpoint CRUD de líneas de detalle. */
const DOCUMENTO_DETALLE_ENDPOINT = '/general/documento-detalle/';

/**
 * Servicio HTTP auxiliar de Contrato servicio.
 *
 * El documento en sí se persiste vía `ENTITY_DATA_GATEWAY` (camino A), pero el
 * tarifador de supervigilancia es un cálculo puntual sobre la cobertura de una
 * línea, así que vive en su propio endpoint y servicio.
 */
@Injectable({ providedIn: 'root' })
export class ContratoServicioService extends BaseHttpService {
  /** Tarifa una línea según su cobertura (horario · modalidad · sector · días). */
  calcularPrecioSupervigilancia(
    payload: CalcularPrecioSupervigilanciaPayload,
  ): Observable<CalcularPrecioSupervigilanciaResult> {
    return this.post<CalcularPrecioSupervigilanciaResult>(
      `${DOCUMENTO_DETALLE_ENDPOINT}calcular-precio-supervigilancia/`,
      payload,
    );
  }

  /**
   * Crea una línea de detalle de un documento existente (edición). Se pasa el
   * `documento` (id) para que el backend la asocie. Devuelve la línea creada con su `id`.
   */
  crearDetalle(
    payload: ContratoServicioDetallePayload & { documento: number },
  ): Observable<ContratoServicioDetalleRead> {
    return this.post<ContratoServicioDetalleRead>(DOCUMENTO_DETALLE_ENDPOINT, payload);
  }

  /** Actualiza una línea de detalle existente por su `id`. */
  actualizarDetalle(
    id: number,
    payload: ContratoServicioDetallePayload,
  ): Observable<ContratoServicioDetalleRead> {
    return this.patch<ContratoServicioDetalleRead>(`${DOCUMENTO_DETALLE_ENDPOINT}${id}/`, payload);
  }
}
