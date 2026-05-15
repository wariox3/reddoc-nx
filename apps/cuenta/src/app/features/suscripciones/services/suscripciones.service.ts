import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService, PaginatedResponse } from '@reddoc/core';
import { Suscripcion } from '../models/suscripcion.model';

@Injectable({ providedIn: 'root' })
export class SuscripcionesService extends BaseHttpService {
  getSuscripciones(): Observable<PaginatedResponse<Suscripcion>> {
    return this.get<PaginatedResponse<Suscripcion>>('/contenedor/suscripcion/lista-usuario/');
  }
}
