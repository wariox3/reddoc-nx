import {
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import {
  I18nService,
  ToastService,
  applyServerErrors,
  clearServerError,
  normalizeHttpError,
} from '@reddoc/core';
import { AuthService } from '../../../auth/services/auth.service';
import { Contenedor } from '../../models/contenedor.model';
import { ContenedorService } from '../../services/contenedor.service';
import type { AppDict } from '../../../../i18n';

@Component({
  selector: 'app-contenedor-create-form',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule],
  templateUrl: './contenedor-create-form.component.html',
  styleUrl: './contenedor-create-form.component.scss',
})
export class ContenedorCreateFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly contenedorService = inject(ContenedorService);
  private readonly toastService = inject(ToastService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly i18n = inject<I18nService<AppDict>>(I18nService);

  protected readonly t = this.i18n.t;

  readonly contenedor = input<Contenedor | null>(null);
  readonly created = output<void>();
  readonly updated = output<void>();
  readonly cancelled = output<void>();
  // Nombre de la empresa mientras se crea (overlay full-screen), o null al terminar.
  readonly creationOverlay = output<string | null>();

  readonly isSaving = signal(false);

  readonly isEditMode = computed(() => this.contenedor() !== null);

  readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    schema_name: ['', [Validators.required, Validators.pattern(/^[a-z0-9][a-z0-9_]*$/)]],
    telefono: ['', [Validators.required, Validators.maxLength(20)]],
    correo: ['', [Validators.required, Validators.email]],
    suscripcion_tipo_id: [13],
    frecuencia: ['P'],
  });

  constructor() {
    const user = this.authService.currentUser();
    this.form.patchValue({
      correo: user?.email ?? '',
      telefono: user?.celular ?? '',
    });

    this.form.controls.nombre.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      if (this.isEditMode()) return;
      const slug = (value ?? '')
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
      this.form.controls.schema_name.setValue(slug, { emitEvent: false });
    });

    // Limpia el error del servidor en cuanto el usuario edita el campo.
    (['nombre', 'telefono', 'correo'] as const).forEach((field) => {
      this.form.controls[field].valueChanges
        .pipe(takeUntilDestroyed())
        .subscribe(() => clearServerError(this.form.controls[field]));
    });

    effect(() => {
      const c = this.contenedor();
      if (!c) return;
      this.form.patchValue({
        nombre: c.nombre,
        schema_name: c.schema_name,
        telefono: c.telefono ?? '',
        correo: c.correo ?? '',
      });
      this.form.controls.schema_name.disable();
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSaving()) return;
    this.isSaving.set(true);

    const c = this.contenedor();
    if (this.isEditMode() && c) {
      const { nombre, telefono, correo } = this.form.getRawValue();
      this.contenedorService
        .updateContenedor(c.cliente_id, {
          nombre: nombre ?? '',
          telefono: telefono ?? undefined,
          correo: correo ?? undefined,
        })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.isSaving.set(false);
            const toasts = this.t().contenedores.edit.toasts;
            this.toastService.success(toasts.success.title, toasts.success.desc);
            this.updated.emit();
          },
          error: (err) => {
            this.isSaving.set(false);
            this.surfaceServerErrors(err, this.t().contenedores.edit.toasts.error.title);
          },
        });
    } else {
      this.creationOverlay.emit(this.form.controls.nombre.value ?? '');
      this.contenedorService
        .createContenedor(
          this.form.getRawValue() as Parameters<ContenedorService['createContenedor']>[0],
        )
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.isSaving.set(false);
            this.creationOverlay.emit(null);
            const toasts = this.t().contenedores.create.toasts;
            this.toastService.success(toasts.success.title, toasts.success.desc);
            this.created.emit();
          },
          error: (err) => {
            this.isSaving.set(false);
            this.creationOverlay.emit(null);
            this.surfaceServerErrors(err, this.t().contenedores.create.toasts.error.title);
          },
        });
    }
  }

  /**
   * Maneja el error de un submit: los errores de validación por campo se muestran inline
   * sobre cada control; lo que no se asocie a un campo (o un error general) va a un toast.
   * Los errores no-validación (500, 403, etc.) ya los muestra el interceptor.
   */
  private surfaceServerErrors(err: HttpErrorResponse, errorTitle: string): void {
    const normalized = normalizeHttpError(err);
    if (normalized.kind !== 'validation') return;

    const { unmatched, appliedToForm } = applyServerErrors(this.form, normalized);
    if (appliedToForm && unmatched.length === 0) return;

    const detail = unmatched.length > 0 ? unmatched.join(' ') : normalized.message;
    this.toastService.error(errorTitle, detail);
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
