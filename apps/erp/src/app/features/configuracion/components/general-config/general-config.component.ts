import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { FieldErrorComponent } from '@reddoc/ui';
import { FormErrorService, I18nService, ToastService } from '@reddoc/core';
import type { AppDict } from '@erp/i18n';
import { ConfiguracionService } from '../../configuracion.service';
import { GENERAL_CAMPOS } from '../../configuracion.constants';
import { configuracionToGeneralForm, generalFormToPayload } from '../../configuracion.mapper';

/** Campos del backend (prefijados) → controles del form (sin prefijo). */
const GENERAL_FIELD_MAP = { gen_uvt: 'uvt' };

/**
 * Área "General" de la configuración: la UVT (`gen_uvt`).
 *
 * Auto-contenida: lee y guarda solo sus campos (`GENERAL_CAMPOS`). La UVT es la
 * base de los cálculos fiscales, por eso vive en su propia sección destacada.
 */
@Component({
  selector: 'app-general-config',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, InputNumberModule, FieldErrorComponent],
  templateUrl: './general-config.component.html',
})
export class GeneralConfigComponent {
  private readonly fb = inject(FormBuilder);
  private readonly configuracionService = inject(ConfiguracionService);
  private readonly toast = inject(ToastService);
  private readonly formErrors = inject(FormErrorService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly i18n = inject<I18nService<AppDict>>(I18nService);

  protected readonly t = this.i18n.t;

  protected readonly loading = signal(true);
  protected readonly loadFailed = signal(false);
  protected readonly isSaving = signal(false);

  protected readonly form = this.fb.group({
    uvt: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
  });

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    this.loading.set(true);
    this.loadFailed.set(false);
    this.configuracionService
      .obtener(GENERAL_CAMPOS)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (config) => {
          this.form.reset(configuracionToGeneralForm(config));
          this.form.markAsPristine();
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.loadFailed.set(true);
          const toasts = this.t().configuracion.toasts;
          this.toast.error(toasts.loadError.title, toasts.loadError.desc);
        },
      });
  }

  protected onSave(): void {
    if (this.form.invalid || this.isSaving()) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);

    const toasts = this.t().configuracion.toasts;
    const payload = generalFormToPayload(this.form.getRawValue());

    this.configuracionService
      .actualizar(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.form.markAsPristine();
          this.toast.success(toasts.saveSuccess.title, toasts.saveSuccess.desc);
        },
        error: (err: unknown) => {
          this.isSaving.set(false);
          this.formErrors.handle(this.form, err, toasts.saveError.title, GENERAL_FIELD_MAP);
        },
      });
  }
}
