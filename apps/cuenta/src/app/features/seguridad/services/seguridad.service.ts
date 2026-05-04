import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseHttpService } from '@reddoc/core';
import { AuthService } from '../../auth/services/auth.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints.constants';

@Injectable({ providedIn: 'root' })
export class SeguridadService extends BaseHttpService {
  private readonly authService = inject(AuthService);

  cambiarClave(password: string): Observable<{ cambio: boolean }> {
    const usuarioId = this.authService.currentUser()!.id;
    return this.post<{ cambio: boolean }>(API_ENDPOINTS.seguridad.cambiarClave, {
      usuario_id: usuarioId,
      password,
    });
  }
}
