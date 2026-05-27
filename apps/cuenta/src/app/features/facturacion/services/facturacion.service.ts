import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService, PaginatedResponse } from '@reddoc/core';
import { Movimiento } from '../models/movimiento.model';

@Injectable({ providedIn: 'root' })
export class FacturacionService extends BaseHttpService {
  getMovimientos(page = 1): Observable<PaginatedResponse<Movimiento>> {
    return this.get<PaginatedResponse<Movimiento>>('/contenedor/movimiento/lista-usuario/', {
      page,
    });
  }
}
