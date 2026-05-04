import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ENVIRONMENT } from '@reddoc/core';
import { AuthService } from '../../auth/services/auth.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints.constants';

@Injectable({ providedIn: 'root' })
export class SeguridadService {
  private readonly http = inject(HttpClient);
  private readonly env = inject(ENVIRONMENT);
  private readonly authService = inject(AuthService);

  cambiarClave(password: string): Observable<{ cambio: boolean }> {
    const usuarioId = this.authService.currentUser()!.id;
    return this.http.post<{ cambio: boolean }>(
      `${this.env.apiUrl}${API_ENDPOINTS.seguridad.cambiarClave}`,
      { usuario_id: usuarioId, password },
    );
  }
}
