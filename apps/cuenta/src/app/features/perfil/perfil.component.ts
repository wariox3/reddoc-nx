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
  styleUrl: './perfil.component.scss',
})
export class PerfilComponent {
  private readonly authService = inject(AuthService);
  private readonly perfilService = inject(PerfilService);
  private readonly messageService = inject(MessageService);

  readonly user = this.authService.currentUser;
  readonly profileImage = this.perfilService.profileImage;

  readonly editDialogVisible = signal(false);
  readonly imageDialogVisible = signal(false);

  readonly initials = computed(() => {
    const u = this.user();
    if (!u) return '?';
    const parts = [u.name, u.apellidos].filter(Boolean);
    return (
      parts
        .map((p) => p![0].toUpperCase())
        .join('')
        .slice(0, 2) || u.email[0].toUpperCase()
    );
  });

  readonly displayName = computed(() => {
    const u = this.user();
    if (!u) return '';
    return [u.name, u.apellidos].filter(Boolean).join(' ') || u.email;
  });

  openEdit(): void {
    this.editDialogVisible.set(true);
  }

  openImageCropper(): void {
    this.imageDialogVisible.set(true);
  }

  deleteImage(): void {
    this.perfilService.deleteImage();
    this.messageService.add({ severity: 'success', summary: 'Foto eliminada' });
  }

  onProfileSaved(): void {
    this.editDialogVisible.set(false);
    this.messageService.add({ severity: 'success', summary: 'Perfil actualizado' });
  }

  onImageSaved(base64: string): void {
    this.perfilService.uploadImage(base64);
    this.imageDialogVisible.set(false);
    this.messageService.add({ severity: 'success', summary: 'Foto actualizada' });
  }

  onImageCancelled(): void {
    this.imageDialogVisible.set(false);
  }
}
