import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap, tap, map } from 'rxjs/operators';
import { BaseHttpService } from '@reddoc/core';
import { AuthService } from '../../auth/services/auth.service';
import { API_ENDPOINTS } from '../../../core/constants/api-endpoints.constants';
import { UpdatePerfilRequest } from '../models/perfil.model';

@Injectable({ providedIn: 'root' })
export class PerfilService extends BaseHttpService {
  private readonly authService = inject(AuthService);

  private readonly localImage = signal<string | null>(null);

  readonly profileImage = computed(
    () => this.localImage() ?? this.authService.currentUser()?.imagen_thumbnail ?? null,
  );

  updatePerfil(data: UpdatePerfilRequest): Observable<unknown> {
    const userId = this.authService.currentUser()?.id;
    return this.patch(`${API_ENDPOINTS.perfil.update}${userId}/`, data).pipe(
      switchMap(() => this.authService.me()),
    );
  }

  uploadFoto(blob: Blob): Observable<void> {
    const form = new FormData();
    form.append('foto', blob, 'foto.jpg');
    return this.post<void>(API_ENDPOINTS.perfil.foto, form).pipe(
      switchMap(() => this.authService.me()),
      tap(() => this.localImage.set(null)),
      map(() => void 0),
    );
  }

  setLocalPreview(url: string | null): void {
    this.localImage.set(url);
  }
}
