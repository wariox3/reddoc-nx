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
import { HttpErrorResponse } from '@angular/common/http';
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
import { I18nService, ToastService, toIsoDate } from '@reddoc/core';
import type { AppDict } from '@erp/i18n';
import {
  ContratoAutocompleteComponent,
  type ContratoOption,
} from '@erp/core/components/contrato-autocomplete/contrato-autocomplete.component';
import { ErpApiAutocompleteComponent } from '@erp/core/components/api-autocomplete/erp-api-autocomplete.component';
import { UppercaseDirective } from '@erp/core/directives/uppercase.directive';
import type { ErpSelectOption } from '@erp/core/data/erp-select-data.service';
import type { SecuenciaMesCalculado } from '@erp/features/turno/masters/secuencia/secuencia.service';
import type { ProgramacionGrupoRef } from '../programacion-grid/programacion-grid.component';
import { ProgramacionService } from '../../programacion.service';
import type {
  CrearProgramacionPayload,
  ProgramacionErroresResponse,
} from '../../programacion.model';
import { ProgramacionPeriodoStore } from './programacion-periodo.store';
import { ProgramacionSecuenciaPickerComponent } from './programacion-secuencia-picker.component';

/**
 * Modal para **aplicar la programación de un contrato a un puesto**.
 *
 * Se abre desde el botón de cada banda de grupo del grid (un puesto =
 * `documento_detalle_id`). El período (mes) a programar lo deriva de la línea del
 * documento (ver `ProgramacionPeriodoStore`); permite elegir un contrato y poner
 * el código de turno de cada día, y envía `POST .../crear-programacion`. Al éxito
 * emite `applied` para que el padre refresque el grid.
 */
@Component({
  selector: 'app-programacion-agregar-contrato-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    ContratoAutocompleteComponent,
    ErpApiAutocompleteComponent,
    ProgramacionSecuenciaPickerComponent,
    UppercaseDirective,
  ],
  templateUrl: './programacion-agregar-contrato-modal.component.html',
  styleUrl: './programacion-agregar-contrato-modal.component.scss',
  providers: [ProgramacionPeriodoStore],
})
export class ProgramacionAgregarContratoModalComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(ProgramacionService);
  private readonly periodoStore = inject(ProgramacionPeriodoStore);
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
   * Período/días/festivos viven en el store (deriva el mes de la línea del
   * documento). Se re-exponen como alias para que el template los consuma sin
   * conocer el store.
   */
  protected readonly periodo = this.periodoStore.periodo;
  protected readonly cargandoPeriodo = this.periodoStore.cargando;
  protected readonly dias = this.periodoStore.dias;
  protected readonly festivoPorDia = this.periodoStore.festivoPorDia;

  /** Endpoint `seleccionar` de secuencias para el `<app-api-autocomplete>`. */
  protected readonly secuenciaEndpoint = '/turno/secuencia/seleccionar/';

  /**
   * Form: contrato elegido + un input de día (texto/código de turno) por día del
   * mes. El `FormArray` de días arranca vacío y un `effect` lo reconstruye cuando
   * cambian los `dias()` del período, ya que cada mes tiene distinto número de días.
   */
  protected readonly form = this.fb.group({
    contrato: this.fb.control<ContratoOption | null>(null),
    secuencia: this.fb.control<ErpSelectOption | null>(null),
    dias: this.fb.array<FormControl<string>>([]),
  });

  protected get diasArray(): FormArray<FormControl<string>> {
    return this.form.controls.dias;
  }

  protected readonly isSubmitting = signal(false);

  /**
   * Casillas (día → mensaje) en error tras crear/actualizar. Se alimentan del
   * `errores` del 400 (anclado por `fecha`) y resaltan la columna con su tooltip
   * hasta que el usuario corrige la casilla.
   */
  protected readonly celdasError = signal<ReadonlyMap<number, string>>(new Map());

  /** Mensaje de error de la casilla del día (tooltip), o `null` si no tiene. */
  protected errorDia(dia: number): string | null {
    return this.celdasError().get(dia) ?? null;
  }

  /**
   * Contrato elegido como señal (el valor del form no lo es). Sin esto el
   * `computed` de habilitación no reaccionaría a la selección.
   */
  private readonly contratoValue = toSignal(this.form.controls.contrato.valueChanges, {
    initialValue: this.form.controls.contrato.value,
  });

  /** Solo se puede aplicar con período resuelto, contrato elegido y sin envío en curso. */
  protected readonly puedeAplicar = computed(
    () => this.periodo() !== null && this.contratoValue() !== null && !this.isSubmitting(),
  );

  /** Secuencia elegida como señal, para pasarla al picker de secuencia (hijo). */
  protected readonly secuenciaValue = toSignal(this.form.controls.secuencia.valueChanges, {
    initialValue: this.form.controls.secuencia.value,
  });

  constructor() {
    // Reconstruye el FormArray de días cuando cambia el período (cada mes tiene
    // distinto número de días). `emitEvent: false` para no disparar el
    // `valueChanges` que limpia los días ocupados.
    effect(() => {
      const total = this.dias().length;
      const arr = this.diasArray;
      arr.clear({ emitEvent: false });
      for (let i = 0; i < total; i++) arr.push(this.fb.control(''), { emitEvent: false });
    });

    // Al abrir (puede ser para otro puesto): form limpio y período recargado
    // desde la línea del documento (deriva mes + festivos en el store).
    effect(() => {
      if (!this.visible()) return;
      this.form.reset();
      this.periodoStore.reset();
      const grupo = this.grupo();
      if (grupo) {
        this.periodoStore.cargarDesdeLinea(grupo.documentoDetalleId, () => {
          const ts = this.t().common.toasts.loadError;
          this.toast.error(ts.title, ts.desc);
        });
      }
    });

    // Al tocar cualquier campo, retira el resaltado de casillas en error.
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (this.celdasError().size) this.celdasError.set(new Map());
    });
  }

  /**
   * Vuelca en los inputs de día los `turno_codigo` calculados por el picker de
   * secuencia (evento `calculado`).
   */
  protected onSecuenciaCalculada(res: SecuenciaMesCalculado): void {
    const controls = this.diasArray.controls;
    for (const d of res.dias) {
      controls[d.dia - 1]?.setValue(d.turno_codigo);
    }
  }

  /** Arma el payload y envía `POST crear-programacion`. */
  protected onAplicar(): void {
    const grupo = this.grupo();
    const periodo = this.periodo();
    const contrato = this.form.controls.contrato.value;
    if (!grupo || !periodo || !contrato || this.isSubmitting()) return;

    const payload: CrearProgramacionPayload = {
      contrato_id: contrato.id,
      documento_detalle_id: grupo.documentoDetalleId,
      items: this.diasArray.controls.map((control, i) => ({
        fecha: toIsoDate(new Date(periodo.anio, periodo.mes - 1, i + 1)),
        turno_codigo: control.value.trim() || null,
      })),
    };

    this.isSubmitting.set(true);
    this.service
      .crearProgramacion(payload)
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
        error: (err: unknown) => {
          const ts = this.t().entities.programacion.detail.empleadosModal.toasts.error;
          if (this.handleErroresProgramacion(err, ts.title)) return;
          this.toast.error(ts.title, ts.desc);
        },
      });
  }

  /**
   * Maneja el 400 normalizado de crear/actualizar-programacion
   * (`{ detail, errores: [{ fecha, codigo, mensaje, … }] }`): resalta las casillas
   * de los días con error (con su `mensaje` como tooltip) y muestra el `detail` en
   * un toast. Devuelve `true` si el error tenía esta forma (ya manejado); `false`
   * para que el caller siga con el toast genérico.
   */
  private handleErroresProgramacion(err: unknown, fallbackTitle: string): boolean {
    if (!(err instanceof HttpErrorResponse)) return false;
    const body = err.error as Partial<ProgramacionErroresResponse> | null;
    if (!body || !Array.isArray(body.errores)) return false;

    const p = this.periodo();
    if (!p) return false;
    const mapa = new Map<number, string>();
    for (const e of body.errores) {
      const [anio, mes, dia] = e.fecha.split('-').map(Number);
      if (anio === p.anio && mes === p.mes) mapa.set(dia, e.mensaje);
    }
    if (mapa.size === 0) return false;

    this.celdasError.set(mapa);
    this.toast.error(fallbackTitle, body.detail);
    return true;
  }

  protected onClose(): void {
    this.visible.set(false);
  }
}
