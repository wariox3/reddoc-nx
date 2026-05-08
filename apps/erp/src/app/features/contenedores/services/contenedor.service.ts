import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ENVIRONMENT } from '@reddoc/core';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints.constants';
import { ContenedoresResponse, CreateContenedorRequest } from '../models/contenedor.model';

@Injectable({ providedIn: 'root' })
export class ContenedorService {
  private readonly http = inject(HttpClient);
  private readonly env = inject(ENVIRONMENT);

  getAccesos(): Observable<ContenedoresResponse> {
    const url = `${this.env.apiUrl}${API_ENDPOINTS.contenedores.list}`;
    return this.http
      .get<ContenedoresResponse>(url)
      .pipe(tap((res) => console.log('[ContenedorService] getAccesos response:', res)));
  }

  createContenedor(payload: CreateContenedorRequest): Observable<unknown> {
    const url = `${this.env.apiUrl}${API_ENDPOINTS.contenedores.create}`;
    return this.http
      .post(url, payload)
      .pipe(tap((res) => console.log('[ContenedorService] createContenedor response:', res)));
  }
}
