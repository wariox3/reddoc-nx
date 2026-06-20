import { Injectable, computed, inject, signal } from '@angular/core';
import { AUTH_SERVICE } from '../tokens';

@Injectable({ providedIn: 'root' })
export class UserAvatarService {
  private readonly auth = inject(AUTH_SERVICE);

  private readonly _localImage = signal<string | null>(null);
  private readonly _uploadTimestamp = signal<number | null>(null);

  private withBuster(url: string | null | undefined): string | null {
    if (!url) return null;
    const ts = this._uploadTimestamp();
    return ts ? `${url}?t=${ts}` : url;
  }

  readonly profileImage = computed(
    () => this._localImage() ?? this.withBuster(this.auth.currentUser()?.imagen_thumbnail),
  );

  readonly fullProfileImage = computed(
    () =>
      this._localImage() ?? this.withBuster(this.auth.currentUser()?.imagen) ?? this.profileImage(),
  );

  readonly initials = computed(() => {
    const user = this.auth.currentUser();
    if (!user) return '?';
    const parts = user.nombre_corto?.trim().split(/\s+/) ?? [];
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    if (parts.length === 1 && parts[0]) return parts[0][0].toUpperCase();
    return user.email.charAt(0).toUpperCase();
  });

  setLocalPreview(url: string | null): void {
    this._localImage.set(url);
  }

  markUploaded(): void {
    this._localImage.set(null);
    this._uploadTimestamp.set(Date.now());
  }
}
