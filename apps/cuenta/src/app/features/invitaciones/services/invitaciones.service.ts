import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '@reddoc/core';
import { InvitacionesPendientesResponse } from '../models/invitacion.model';

@Injectable({ providedIn: 'root' })
export class InvitacionesService extends BaseHttpService {
  getPendientes(): Observable<InvitacionesPendientesResponse> {
    return this.get<InvitacionesPendientesResponse>('/contenedor/invitacion/pendiente-usuario/');
  }

  aceptar(id: number): Observable<unknown> {
    return this.post(`/contenedor/invitacion/${id}/aceptar/`, {});
  }

  rechazar(id: number): Observable<void> {
    return this.post(`/contenedor/invitacion/${id}/rechazar/`, {});
  }
}
