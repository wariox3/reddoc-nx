import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap, tap, map } from 'rxjs/operators';
import { BaseHttpService, UserAvatarService } from '@reddoc/core';
import { AuthService } from '../../auth/services/auth.service';
import { UpdatePerfilRequest } from '../models/perfil.model';

@Injectable({ providedIn: 'root' })
export class PerfilService extends BaseHttpService {
  private readonly authService = inject(AuthService);
  private readonly userAvatar = inject(UserAvatarService);

  updatePerfil(data: UpdatePerfilRequest): Observable<unknown> {
    const userId = this.authService.currentUser()?.id;
    return this.patch(`/seguridad/usuario/${userId}/`, data).pipe(
      switchMap(() => this.authService.me()),
    );
  }

  uploadFoto(blob: Blob): Observable<void> {
    const form = new FormData();
    form.append('foto', blob, 'foto.jpg');
    return this.post<void>('/seguridad/usuario/foto/', form).pipe(
      switchMap(() => this.authService.me()),
      tap(() => this.userAvatar.markUploaded()),
      map(() => void 0),
    );
  }
}
