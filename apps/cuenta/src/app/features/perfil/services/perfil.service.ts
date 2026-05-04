import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BaseHttpService } from '@reddoc/core';
import { AuthService } from '../../auth/services/auth.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints.constants';
import { UpdatePerfilRequest } from '../models/perfil.model';

@Injectable({ providedIn: 'root' })
export class PerfilService extends BaseHttpService {
  private readonly authService = inject(AuthService);

  readonly profileImage = signal<string | null>(null);

  updatePerfil(data: UpdatePerfilRequest): Observable<unknown> {
    const userId = this.authService.currentUser()?.id;
    return this.patch(`${API_ENDPOINTS.perfil.update}${userId}/`, data).pipe(
      tap(() => this.authService.me().subscribe()),
    );
  }

  uploadImage(base64: string): void {
    this.profileImage.set(base64);
  }

  deleteImage(): void {
    this.profileImage.set(null);
  }
}
