import { Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { I18nService, ToastService } from '@reddoc/core';
import { AuthService } from '../../../auth/services/auth.service';
import { ContenedorService } from '../../services/contenedor.service';
import type { AppDict } from '../../../../i18n';

@Component({
  selector: 'app-contenedores-create-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule],
  templateUrl: './contenedores-create-dialog.component.html',
  styleUrl: './contenedores-create-dialog.component.scss',
})
export class ContenedoresCreateDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly contenedorService = inject(ContenedorService);
  private readonly toastService = inject(ToastService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly i18n = inject<I18nService<AppDict>>(I18nService);

  protected readonly t = this.i18n.t;

  readonly visible = input<boolean>(false);
  readonly visibleChange = output<boolean>();
  readonly created = output<void>();

  readonly isSaving = signal(false);

  readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    schema_name: ['', [Validators.required, Validators.pattern(/^[a-z0-9][a-z0-9_]*$/)]],
    telefono: ['', [Validators.required]],
    correo: ['', [Validators.required, Validators.email]],
  });

  constructor() {
    const user = this.authService.currentUser();
    this.form.patchValue({
      correo: user?.email ?? '',
      telefono: user?.celular ?? '',
    });

    this.form.controls.nombre.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      const slug = (value ?? '')
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
      this.form.controls.schema_name.setValue(slug, { emitEvent: false });
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSaving()) return;
    this.isSaving.set(true);
    this.contenedorService
      .createContenedor(
        this.form.getRawValue() as Parameters<ContenedorService['createContenedor']>[0],
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          const toasts = this.t().contenedores.create.toasts;
          this.toastService.success(toasts.success.title, toasts.success.desc);
          this.created.emit();
          this.visibleChange.emit(false);
          this.form.reset();
        },
        error: () => {
          this.isSaving.set(false);
          const toasts = this.t().contenedores.create.toasts;
          this.toastService.error(toasts.error.title, toasts.error.desc);
        },
      });
  }

  onCancel(): void {
    this.visibleChange.emit(false);
    this.form.reset();
  }
}
