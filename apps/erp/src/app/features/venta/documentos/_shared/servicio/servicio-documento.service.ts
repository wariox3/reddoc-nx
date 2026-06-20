import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '@reddoc/core';
import type {
  CalcularPrecioSupervigilanciaPayload,
  CalcularPrecioSupervigilanciaResult,
} from './servicio-documento.model';

/** Endpoint del tarifador de supervigilancia (vive sobre documento-detalle). */
const DOCUMENTO_DETALLE_ENDPOINT = '/general/documento-detalle/';

/**
 * Servicio HTTP **específico** de los documentos de servicio (vigilancia).
 *
 * El documento se persiste vía `ENTITY_DATA_GATEWAY` (cabecera) y las líneas vía
 * `DocumentoDetalleService` (CRUD genérico del framework). Lo único propio de la
 * familia es el **tarifador de supervigilancia**: un cálculo puntual sobre la
 * cobertura de una línea, así que vive aquí.
 */
@Injectable({ providedIn: 'root' })
export class ServicioDocumentoService extends BaseHttpService {
  /** Tarifa una línea según su cobertura (horario · modalidad · sector · días). */
  calcularPrecioSupervigilancia(
    payload: CalcularPrecioSupervigilanciaPayload,
  ): Observable<CalcularPrecioSupervigilanciaResult> {
    return this.post<CalcularPrecioSupervigilanciaResult>(
      `${DOCUMENTO_DETALLE_ENDPOINT}calcular-precio-supervigilancia/`,
      payload,
    );
  }
}
