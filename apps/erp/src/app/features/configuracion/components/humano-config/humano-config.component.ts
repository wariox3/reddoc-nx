import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { FieldErrorComponent } from '@reddoc/ui';
import { FormErrorService, I18nService, ToastService } from '@reddoc/core';
import type { AppDict } from '@erp/i18n';
import { ConfiguracionService } from '../../configuracion.service';
import { HUMANO_CAMPOS } from '../../configuracion.constants';
import { configuracionToHumanoForm, humanoFormToPayload } from '../../configuracion.mapper';

/** Campos del backend (prefijados) → controles del form (sin prefijo). */
const HUMANO_FIELD_MAP = {
  hum_salario_minimo: 'salario_minimo',
  hum_factor: 'factor',
  hum_auxilio_transporte: 'auxilio_transporte',
};

/**
 * Área "Humano" de la configuración: parámetros de nómina
 * (`hum_salario_minimo`, `hum_factor`, `hum_auxilio_transporte`).
 *
 * Auto-contenida: lee y guarda solo sus campos (`HUMANO_CAMPOS`). Estos valores
 * alimentan los cálculos de prestaciones/nómina.
 */
@Component({
  selector: 'app-humano-config',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, InputNumberModule, FieldErrorComponent],
  templateUrl: './humano-config.component.html',
})
export class HumanoConfigComponent {
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
    salario_minimo: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
    factor: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
    auxilio_transporte: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(0),
    ]),
  });

  constructor() {
    this.cargar();
  }

  protected cargar(): void {
    this.loading.set(true);
    this.loadFailed.set(false);
    this.configuracionService
      .obtener(HUMANO_CAMPOS)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (config) => {
          this.form.reset(configuracionToHumanoForm(config));
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
    const payload = humanoFormToPayload(this.form.getRawValue());

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
          this.formErrors.handle(this.form, err, toasts.saveError.title, HUMANO_FIELD_MAP);
        },
      });
  }
}
