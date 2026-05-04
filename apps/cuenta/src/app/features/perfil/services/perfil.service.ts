import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ENVIRONMENT } from '@reddoc/core';
import { AuthService } from '../../auth/services/auth.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints.constants';
import { UpdatePerfilRequest } from '../models/perfil.model';

@Injectable({ providedIn: 'root' })
export class PerfilService {
  private readonly http = inject(HttpClient);
  private readonly env = inject(ENVIRONMENT);
  private readonly authService = inject(AuthService);

  readonly profileImage = signal<string | null>(null);

  loadPerfil(): Observable<unknown> {
    const userId = this.authService.currentUser()?.id;
    return this.http
      .get(`${this.env.apiUrl}${API_ENDPOINTS.perfil.update}${userId}/`)
      .pipe(tap((data) => console.log('[PerfilService] GET usuario:', data)));
  }

  // TODO: connect to backend once endpoint is ready
  updatePerfil(data: UpdatePerfilRequest): Observable<unknown> {
    const userId = this.authService.currentUser()?.id;
    return this.http
      .patch(`${this.env.apiUrl}${API_ENDPOINTS.perfil.update}${userId}/`, data)
      .pipe(tap(() => this.authService.me().subscribe()));
  }

  // TODO: connect to backend once endpoint is ready
  uploadImage(base64: string): void {
    this.profileImage.set(base64);
    // this.http.post(`${this.env.apiUrl}${API_ENDPOINTS.perfil.uploadImage}`, { imagen: base64 })
    //   .subscribe();
  }

  deleteImage(): void {
    this.profileImage.set(null);
    // const userId = this.authService.currentUser()?.id;
    // this.http.delete(`${this.env.apiUrl}${API_ENDPOINTS.perfil.deleteImage}${userId}/`)
    //   .subscribe();
  }
}
