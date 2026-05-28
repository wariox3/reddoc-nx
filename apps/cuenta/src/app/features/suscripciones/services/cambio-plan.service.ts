import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '@reddoc/core';
import { PeriodoPago } from '../models/pago.model';
import { Suscripcion } from '../models/suscripcion.model';

export interface ActualizarPlanRequest {
  readonly suscripcion_id: number;
  readonly suscripcion_tipo_id: number;
  readonly frecuencia: PeriodoPago;
}

@Injectable({ providedIn: 'root' })
export class CambioPlanService extends BaseHttpService {
  actualizarPlan(payload: ActualizarPlanRequest): Observable<Suscripcion> {
    return this.post<Suscripcion>('/contenedor/suscripcion/actualizar/', payload);
  }
}
