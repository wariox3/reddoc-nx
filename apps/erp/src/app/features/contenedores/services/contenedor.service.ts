import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '@reddoc/core';
import {
  Contenedor,
  ContenedoresResponse,
  CreateContenedorRequest,
} from '../models/contenedor.model';

export interface UpdateContenedorRequest {
  nombre: string;
  telefono?: string;
  correo?: string;
}

@Injectable({ providedIn: 'root' })
export class ContenedorService extends BaseHttpService {
  getAccesos(): Observable<ContenedoresResponse> {
    return this.get<ContenedoresResponse>('/contenedor/cliente/lista-usuario/');
  }

  createContenedor(payload: CreateContenedorRequest): Observable<unknown> {
    return this.post('/contenedor/cliente/', payload);
  }

  updateContenedor(id: number, payload: UpdateContenedorRequest): Observable<Contenedor> {
    return this.patch<Contenedor>(`/contenedor/cliente/${id}/`, payload);
  }

  deleteContenedor(id: number): Observable<unknown> {
    return this.delete(`/contenedor/cliente/${id}/`);
  }
}
