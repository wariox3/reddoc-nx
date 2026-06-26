import {
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  FormArray,
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { finalize } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { I18nService, ToastService, diasDelMes } from '@reddoc/core';
import type { AppDict } from '@erp/i18n';
import {
  ContratoAutocompleteComponent,
  type ContratoOption,
} from '@erp/core/components/contrato-autocomplete/contrato-autocomplete.component';
import type { ProgramacionGrupoRef } from '../programacion-grid/programacion-grid.component';
import { ProgramacionService } from '../../programacion.service';
import type { AplicarProgramacionPayload } from '../../programacion.model';

/**
 * Modal para **aplicar la programación de un contrato a un puesto**.
 *
 * Se abre desde el botón de cada banda de grupo del grid (un puesto =
 * `documento_detalle_id`). Permite elegir un contrato y poner el código de turno
 * de cada día del mes actual, y envía `POST .../aplicar-programacion`. Al éxito
 * emite `applied` para que el padre refresque el grid.
 */
@Component({
  selector: 'app-programacion-aplicar-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    ContratoAutocompleteComponent,
  ],
  templateUrl: './programacion-aplicar-modal.component.html',
  styleUrl: './programacion-aplicar-modal.component.scss',
})
export class ProgramacionAplicarModalComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(ProgramacionService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly i18n = inject<I18nService<AppDict>>(I18nService);
  protected readonly t = this.i18n.t;

  /** Visibilidad del modal (two-way con el padre). */
  readonly visible = model<boolean>(false);

  /** Puesto sobre el que se aplica (emitido por el grid). */
  readonly grupo = input<ProgramacionGrupoRef | null>(null);

  /** Se emite tras aplicar con éxito; el padre recarga el detalle/grid. */
  readonly applied = output<void>();

  /**
   * Período = mes/año actual (el backend lo espera en el payload). Se calcula al
   * construir; `etiqueta` es el nombre del mes + año para mostrar en el header.
   */
  protected readonly periodo = (() => {
    const now = new Date();
    return {
      anio: now.getFullYear(),
      mes: now.getMonth() + 1,
      etiqueta: now.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }),
    };
  })();

  /**
   * Días del mes actual (1..N) con la inicial del día de la semana (`1 L`,
   * `2 M`, `3 X`…). Define las columnas del header y la cantidad de inputs.
   */
  protected readonly dias = diasDelMes(this.periodo.anio, this.periodo.mes);

  /** Form: contrato elegido + un input de día (texto/código de turno) por día del mes. */
  protected readonly form = this.fb.group({
    contrato: this.fb.control<ContratoOption | null>(null),
    dias: this.fb.array(this.dias.map(() => this.fb.control(''))),
  });

  protected get diasArray(): FormArray<FormControl<string>> {
    return this.form.controls.dias;
  }

  protected readonly isSubmitting = signal(false);

  /**
   * Contrato elegido como señal (el valor del form no lo es). Sin esto el
   * `computed` de habilitación no reaccionaría a la selección.
   */
  private readonly contratoValue = toSignal(this.form.controls.contrato.valueChanges, {
    initialValue: this.form.controls.contrato.value,
  });

  /** Solo se puede aplicar con un contrato elegido y sin envío en curso. */
  protected readonly puedeAplicar = computed(
    () => this.contratoValue() !== null && !this.isSubmitting(),
  );

  constructor() {
    // Form limpio cada vez que se abre (puede abrirse para otro puesto).
    effect(() => {
      if (this.visible()) this.form.reset();
    });
  }

  /** Arma el payload y envía `POST aplicar-programacion`. */
  protected onAplicar(): void {
    const grupo = this.grupo();
    const contrato = this.form.controls.contrato.value;
    if (!grupo || !contrato || this.isSubmitting()) return;

    const payload: AplicarProgramacionPayload = {
      contrato_id: contrato.id,
      anio: this.periodo.anio,
      mes: this.periodo.mes,
      documento_detalle_id: grupo.documentoDetalleId,
      dias: this.diasArray.controls.map((control, i) => ({
        dia: i + 1,
        turno_codigo: control.value.trim() || null,
      })),
    };

    this.isSubmitting.set(true);
    this.service
      .aplicarProgramacion(payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSubmitting.set(false)),
      )
      .subscribe({
        next: () => {
          const ts = this.t().entities.programacion.detail.empleadosModal.toasts.success;
          this.toast.success(ts.title, ts.desc);
          this.applied.emit();
          this.visible.set(false);
        },
        error: () => {
          const ts = this.t().entities.programacion.detail.empleadosModal.toasts.error;
          this.toast.error(ts.title, ts.desc);
        },
      });
  }

  protected onClose(): void {
    this.visible.set(false);
  }
}
