import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '@reddoc/core';
import type {
  CalcularPrecioSupervigilanciaPayload,
  CalcularPrecioSupervigilanciaResult,
} from './contrato-servicio.model';

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
      '/general/documento-detalle/calcular-precio-supervigilancia/',
      payload,
    );
  }
}
