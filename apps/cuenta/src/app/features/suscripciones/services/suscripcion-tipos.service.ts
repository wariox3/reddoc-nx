import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService, PaginatedResponse } from '@reddoc/core';
import { SuscripcionTipo } from '../models/suscripcion-tipo.model';

@Injectable({ providedIn: 'root' })
export class SuscripcionTiposService extends BaseHttpService {
  getClase(claseId: number): Observable<PaginatedResponse<SuscripcionTipo>> {
    return this.get<PaginatedResponse<SuscripcionTipo>>(
      `/contenedor/suscripcion-tipo/lista-clase/?clase_id=${claseId}`,
    );
  }
}
