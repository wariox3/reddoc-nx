import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '@reddoc/core';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints.constants';
import { InvitacionesPendientesResponse } from '../models/invitacion.model';

@Injectable({ providedIn: 'root' })
export class InvitacionesService extends BaseHttpService {
  getPendientes(): Observable<InvitacionesPendientesResponse> {
    return this.get<InvitacionesPendientesResponse>(API_ENDPOINTS.invitaciones.pendientes);
  }

  aceptar(id: number): Observable<unknown> {
    return this.post(`${API_ENDPOINTS.invitaciones.aceptar}${id}/aceptar/`, {});
  }
}
