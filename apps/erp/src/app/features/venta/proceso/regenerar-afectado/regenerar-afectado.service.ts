import { Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { BaseHttpService } from '@reddoc/core';
import type { RegenerarAfectadoResult } from './regenerar-afectado.model';

/** Endpoint del proceso: recalcula la afectación de las líneas de documento. */
export const REGENERAR_AFECTADO_ENDPOINT = '/general/documento-detalle/regenerar-afectado/';

/**
 * Servicio HTTP del proceso **Regenerar afectado**.
 *
 * Dispara un `POST` sin payload que pide al backend recalcular el estado de
 * afectación de las líneas de `documento-detalle` — el insumo del informe
 * "Pendiente por facturar". Es una operación de mantenimiento idempotente.
 *
 * `tenantScoped` queda en su default `true`: el endpoint vive en el schema del
 * tenant, igual que el resto de `/general/...`.
 */
@Injectable({ providedIn: 'root' })
export class RegenerarAfectadoService extends BaseHttpService {
  regenerar(): Observable<RegenerarAfectadoResult> {
    return this.post<RegenerarAfectadoResult>(REGENERAR_AFECTADO_ENDPOINT, {});
  }
}
