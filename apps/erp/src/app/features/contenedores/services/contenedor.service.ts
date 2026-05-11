import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '@reddoc/core';
import {
  ContenedoresResponse,
  CreateContenedorRequest,
  TiposSuscripcionResponse,
} from '../models/contenedor.model';

@Injectable({ providedIn: 'root' })
export class ContenedorService extends BaseHttpService {
  getAccesos(): Observable<ContenedoresResponse> {
    return this.get<ContenedoresResponse>('/contenedor/cliente/lista-usuario/');
  }

  createContenedor(payload: CreateContenedorRequest): Observable<unknown> {
    return this.post('/contenedor/cliente/', payload);
  }

  deleteContenedor(id: number): Observable<unknown> {
    return this.delete(`/contenedor/cliente/${id}/`);
  }

  getTiposSuscripcion(): Observable<TiposSuscripcionResponse> {
    return this.get<TiposSuscripcionResponse>('/contenedor/suscripcion-tipo/');
  }
}
