import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '@reddoc/core';
import { EstadoPagoResponse, IntegridadRequest, IntegridadResponse } from '../models/pago.model';

@Injectable({ providedIn: 'root' })
export class SuscripcionPagoService extends BaseHttpService {
  firmarIntegridad(payload: IntegridadRequest): Observable<IntegridadResponse> {
    return this.post<IntegridadResponse>('/contenedor/suscripcion/integridad/', payload);
  }

  consultarPago(referencia: string): Observable<EstadoPagoResponse> {
    return this.get<EstadoPagoResponse>(
      `/contenedor/suscripcion/pago/${encodeURIComponent(referencia)}/`,
    );
  }
}
