import { Component, inject, signal, computed } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { AuthService } from '../auth/services/auth.service';
import { PerfilService } from './services/perfil.service';
import { PerfilFormComponent } from './components/perfil-form/perfil-form.component';
import { ImageCropperComponent } from './components/image-cropper/image-cropper.component';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    DialogModule,
    ButtonModule,
    AvatarModule,
    TooltipModule,
    PerfilFormComponent,
    ImageCropperComponent,
  ],
  templateUrl: './perfil.component.html',
})
export class PerfilComponent {
  private readonly authService = inject(AuthService);
  private readonly perfilService = inject(PerfilService);
  private readonly messageService = inject(MessageService);

  readonly user = this.authService.currentUser;
  readonly profileImage = this.perfilService.profileImage;
  readonly fullImage = computed(() => this.user()?.imagen ?? this.profileImage());
  readonly imageDialogVisible = signal(false);
  readonly uploading = signal(false);

  readonly initials = computed(() => {
    const u = this.user();
    if (!u) return '?';
    const name = u.nombre_corto?.trim();
    return name ? name[0].toUpperCase() : u.email[0].toUpperCase();
  });

  readonly displayName = computed(() => {
    const u = this.user();
    if (!u) return '';
    return u.nombre_corto?.trim() || u.email;
  });

  openImageCropper(): void {
    this.imageDialogVisible.set(true);
  }

  deleteImage(): void {
    this.perfilService.setLocalPreview(null);
    this.messageService.add({ severity: 'success', summary: 'Foto eliminada', life: 3000 });
  }

  onProfileSaved(): void {
    this.messageService.add({ severity: 'success', summary: 'Perfil actualizado', life: 3000 });
  }

  onImageSaved(blob: Blob): void {
    this.imageDialogVisible.set(false);
    const previewUrl = URL.createObjectURL(blob);
    this.perfilService.setLocalPreview(previewUrl);
    this.uploading.set(true);
    this.perfilService.uploadFoto(blob).subscribe({
      next: () => {
        URL.revokeObjectURL(previewUrl);
        this.uploading.set(false);
        this.messageService.add({ severity: 'success', summary: 'Foto actualizada', life: 3000 });
      },
      error: () => {
        URL.revokeObjectURL(previewUrl);
        this.perfilService.setLocalPreview(null);
        this.uploading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error al subir la foto',
          life: 4000,
        });
      },
    });
  }
}
