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
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { I18nService, ToastService } from '@reddoc/core';
import { AuthService } from '../../../auth/services/auth.service';
import { Contenedor } from '../../models/contenedor.model';
import { ContenedorService } from '../../services/contenedor.service';
import { ContenedorCreationOverlayComponent } from '../creation-overlay/contenedor-creation-overlay.component';
import type { AppDict } from '../../../../i18n';

@Component({
  selector: 'app-contenedores-create-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    ContenedorCreationOverlayComponent,
  ],
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
  readonly contenedor = input<Contenedor | null>(null);
  readonly visibleChange = output<boolean>();
  readonly created = output<void>();
  readonly updated = output<void>();

  readonly isSaving = signal(false);

  readonly isEditMode = computed(() => this.contenedor() !== null);

  readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    schema_name: ['', [Validators.required, Validators.pattern(/^[a-z0-9][a-z0-9_]*$/)]],
    telefono: ['', [Validators.required]],
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

    effect(() => {
      const c = this.contenedor();
      if (c) {
        this.form.patchValue({
          nombre: c.nombre,
          schema_name: c.schema_name,
          telefono: c.telefono ?? '',
          correo: c.correo ?? '',
        });
        this.form.controls.schema_name.disable();
      } else {
        this.form.controls.schema_name.enable();
        const u = this.authService.currentUser();
        this.form.reset({
          nombre: '',
          schema_name: '',
          correo: u?.email ?? '',
          telefono: u?.celular ?? '',
          suscripcion_tipo_id: 13,
          frecuencia: 'P',
        });
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSaving()) return;
    this.isSaving.set(true);

    const c = this.contenedor();
    if (this.isEditMode() && c) {
      const { nombre, telefono, correo } = this.form.getRawValue();
      this.contenedorService
        .updateContenedor(c.id, {
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
            this.visibleChange.emit(false);
          },
          error: () => {
            this.isSaving.set(false);
            const toasts = this.t().contenedores.edit.toasts;
            this.toastService.error(toasts.error.title, toasts.error.desc);
          },
        });
    } else {
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
            const u = this.authService.currentUser();
            this.form.reset({
              nombre: '',
              schema_name: '',
              correo: u?.email ?? '',
              telefono: u?.celular ?? '',
              suscripcion_tipo_id: 13,
              frecuencia: 'P',
            });
          },
          error: () => {
            this.isSaving.set(false);
            const toasts = this.t().contenedores.create.toasts;
            this.toastService.error(toasts.error.title, toasts.error.desc);
          },
        });
    }
  }

  onCancel(): void {
    this.visibleChange.emit(false);
    if (!this.isEditMode()) {
      this.form.reset();
    }
  }
}
