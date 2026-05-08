import { Component, DestroyRef, computed, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { I18nService, ToastService } from '@reddoc/core';
import { Contenedor } from '../../models/contenedor.model';
import { ContenedorService } from '../../services/contenedor.service';
import type { AppDict } from '../../../../i18n';

@Component({
  selector: 'app-contenedores-delete-dialog',
  standalone: true,
  imports: [DialogModule, ButtonModule, InputTextModule],
  templateUrl: './contenedores-delete-dialog.component.html',
  styleUrl: './contenedores-delete-dialog.component.scss',
})
export class ContenedoresDeleteDialogComponent {
  private readonly contenedorService = inject(ContenedorService);
  private readonly toastService = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly i18n = inject<I18nService<AppDict>>(I18nService);

  protected readonly t = this.i18n.t;

  readonly visible = input<boolean>(false);
  readonly visibleChange = output<boolean>();
  readonly contenedor = input<Contenedor | null>(null);
  readonly deleted = output<void>();

  readonly isDeleting = signal(false);
  readonly confirmValue = signal('');
  readonly confirmTouched = signal(false);

  readonly canDelete = computed(() => this.confirmValue().trim() === this.contenedor()?.nombre);

  onConfirmInput(event: Event): void {
    this.confirmValue.set((event.target as HTMLInputElement).value);
  }

  onSubmit(): void {
    if (!this.canDelete() || this.isDeleting()) return;
    const id = this.contenedor()!.id;
    this.isDeleting.set(true);
    this.contenedorService
      .deleteContenedor(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isDeleting.set(false);
          const toasts = this.t().contenedores.delete.toasts;
          this.toastService.success(toasts.success.title, toasts.success.desc);
          this.deleted.emit();
          this.visibleChange.emit(false);
          this.reset();
        },
        error: () => {
          this.isDeleting.set(false);
          const toasts = this.t().contenedores.delete.toasts;
          this.toastService.error(toasts.error.title, toasts.error.desc);
        },
      });
  }

  onCancel(): void {
    this.visibleChange.emit(false);
    this.reset();
  }

  private reset(): void {
    this.confirmValue.set('');
    this.confirmTouched.set(false);
  }
}
