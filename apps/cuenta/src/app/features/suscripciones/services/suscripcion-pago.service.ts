import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '@reddoc/core';
import { EstadoPagoResponse, IniciarPagoRequest, IniciarPagoResponse } from '../models/pago.model';

@Injectable({ providedIn: 'root' })
export class SuscripcionPagoService extends BaseHttpService {
  iniciarPago(suscripcionId: number, payload: IniciarPagoRequest): Observable<IniciarPagoResponse> {
    return this.post<IniciarPagoResponse>(
      `/contenedor/suscripcion/${suscripcionId}/iniciar-pago/`,
      payload,
    );
  }

  consultarPago(referencia: string): Observable<EstadoPagoResponse> {
    return this.get<EstadoPagoResponse>(
      `/contenedor/suscripcion/pago/${encodeURIComponent(referencia)}/`,
    );
  }
}
