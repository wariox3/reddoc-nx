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
import { I18nService, ToastService, anioMesDeIso, diasDelMes } from '@reddoc/core';
import { DocumentoDetalleService } from '@erp/core/module-config';
import type { AppDict } from '@erp/i18n';
import {
  ContratoAutocompleteComponent,
  type ContratoOption,
} from '@erp/core/components/contrato-autocomplete/contrato-autocomplete.component';
import { ErpApiAutocompleteComponent } from '@erp/core/components/api-autocomplete/erp-api-autocomplete.component';
import type { ErpSelectOption } from '@erp/core/data/erp-select-data.service';
import {
  FestivoService,
  type Festivo,
} from '@erp/features/general/masters/festivo/festivo.service';
import {
  SecuenciaService,
  type SecuenciaMesCalculado,
} from '@erp/features/turno/masters/secuencia/secuencia.service';
import type { Secuencia } from '@erp/features/turno/masters/secuencia/secuencia.model';
import type { ProgramacionGrupoRef } from '../programacion-grid/programacion-grid.component';
import { ProgramacionService } from '../../programacion.service';
import type {
  CrearProgramacionPayload,
  CrearProgramacionConflicto,
  ProgramacionExistente,
  ProgramacionLineaRead,
} from '../../programacion.model';

/**
 * Modal para **aplicar la programación de un contrato a un puesto**.
 *
 * Se abre desde el botón de cada banda de grupo del grid (un puesto =
 * `documento_detalle_id`). Permite elegir un contrato y poner el código de turno
 * de cada día del mes actual, y envía `POST .../crear-programacion`. Al éxito
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
  ],
  templateUrl: './programacion-agregar-contrato-modal.component.html',
  styleUrl: './programacion-agregar-contrato-modal.component.scss',
})
export class ProgramacionAgregarContratoModalComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(ProgramacionService);
  private readonly detalleService = inject(DocumentoDetalleService);
  private readonly festivoService = inject(FestivoService);
  private readonly secuenciaService = inject(SecuenciaService);
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
   * Período (mes/año) a programar. Se **deriva de la línea del documento** (su
   * `fecha_desde`) al abrir el modal — no del mes actual. `null` mientras carga o
   * si la línea no trae fecha. `etiqueta` es el nombre del mes + año del header.
   */
  protected readonly periodo = signal<{
    readonly anio: number;
    readonly mes: number;
    readonly etiqueta: string;
  } | null>(null);

  /** `true` mientras se resuelve el período (carga de la línea de documento). */
  protected readonly cargandoPeriodo = signal(false);

  /**
   * Días del período (1..N) con la inicial del día de la semana (`1 L`, `2 M`,
   * `3 X`…). Define las columnas del header y la cantidad de inputs. Vacío
   * mientras no hay período resuelto.
   */
  protected readonly dias = computed(() => {
    const p = this.periodo();
    return p ? diasDelMes(p.anio, p.mes) : [];
  });

  /** Endpoint `seleccionar` de secuencias para el `<app-api-autocomplete>`. */
  protected readonly secuenciaEndpoint = '/turno/secuencia/seleccionar/';

  /**
   * Form: contrato elegido + un input de día (texto/código de turno) por día del
   * mes. El `FormArray` de días arranca vacío y se reconstruye al resolver el
   * período (`rebuildDiasArray`), ya que cada mes tiene distinto número de días.
   */
  protected readonly form = this.fb.group({
    contrato: this.fb.control<ContratoOption | null>(null),
    secuencia: this.fb.control<ErpSelectOption | null>(null),
    posicionInicial: this.fb.control<number | null>(null),
    dias: this.fb.array<FormControl<string>>([]),
  });

  protected get diasArray(): FormArray<FormControl<string>> {
    return this.form.controls.dias;
  }

  protected readonly isSubmitting = signal(false);

  /** Festivos del mes del período actual (`/general/festivo/mes/`). */
  private readonly festivos = signal<readonly Festivo[]>([]);

  /** Detalle completo de la secuencia elegida (`getById`). */
  private readonly secuenciaDetalle = signal<Secuencia | null>(null);

  /** Posiciones activas de la secuencia (1..dias), para el picker visual. */
  protected readonly posicionesSecuencia = computed<readonly { pos: number; codigo: string }[]>(
    () => {
      const s = this.secuenciaDetalle();
      if (!s || !s.dias) return [];
      const result: { pos: number; codigo: string }[] = [];
      for (let i = 1; i <= s.dias; i++) {
        const codigo = s[`dia_${i}` as keyof Secuencia] as string | null;
        if (codigo !== null) result.push({ pos: i, codigo });
      }
      return result;
    },
  );

  /**
   * Días del mes que ya tienen programación (devueltos por el backend al fallar
   * `crear-programacion`). Se usan para resaltar las columnas en conflicto; el
   * valor guarda el día existente (turno ya programado) por si se muestra luego.
   */
  protected readonly diasOcupados = signal<ReadonlyMap<number, ProgramacionExistente>>(new Map());

  /**
   * Días del mes (1..N) que son festivos → su nombre, para resaltarlos en la
   * tabla y mostrar el nombre del festivo en el `title`. Filtra por el
   * `anio`/`mes` del período parseando la `fecha` ISO `YYYY-MM-DD`.
   */
  protected readonly festivoPorDia = computed<ReadonlyMap<number, string>>(() => {
    const mapa = new Map<number, string>();
    const p = this.periodo();
    if (!p) return mapa;
    for (const f of this.festivos()) {
      const [anio, mes, dia] = f.fecha.split('-').map(Number);
      if (anio !== p.anio || mes !== p.mes) continue;
      // Si el festivo cae sábado, no se marca como festivo (queda como fin de semana).
      if (new Date(anio, mes - 1, dia).getDay() === 6) continue;
      mapa.set(dia, f.nombre);
    }
    return mapa;
  });

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

  protected readonly isCalculating = signal(false);

  private readonly secuenciaValue = toSignal(this.form.controls.secuencia.valueChanges, {
    initialValue: this.form.controls.secuencia.value,
  });
  protected readonly posicionValue = toSignal(this.form.controls.posicionInicial.valueChanges, {
    initialValue: this.form.controls.posicionInicial.value,
  });

  /** Para calcular: período resuelto + secuencia + posición inicial válida y sin cálculo en curso. */
  protected readonly puedeCalcular = computed(
    () =>
      this.periodo() !== null &&
      this.secuenciaValue() !== null &&
      this.posicionValue() != null &&
      !this.isCalculating(),
  );

  constructor() {
    // Form limpio cada vez que se abre (puede abrirse para otro puesto). Se
    // limpia el período previo y se carga el de la línea (deriva mes/festivos).
    effect(() => {
      if (!this.visible()) return;
      this.form.reset();
      this.periodo.set(null);
      this.cargarDetalleLinea();
    });

    // Al elegir una secuencia, traer su detalle completo (getById).
    this.form.controls.secuencia.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((sel) => this.cargarSecuenciaDetalle(sel));

    // Al tocar cualquier campo, retira el resaltado de días ya programados.
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (this.diasOcupados().size) this.diasOcupados.set(new Map());
    });
  }

  /**
   * Trae el detalle completo de la secuencia elegida
   * (`GET /turno/secuencia/:id/`) y lo guarda para uso posterior.
   */
  private cargarSecuenciaDetalle(sel: ErpSelectOption | null): void {
    if (!sel) {
      this.secuenciaDetalle.set(null);
      return;
    }
    this.secuenciaService
      .getById(sel.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (secuencia) => this.secuenciaDetalle.set(secuencia),
        error: () => this.secuenciaDetalle.set(null),
      });
  }

  /**
   * Carga la línea de documento del puesto (`documento_detalle_id`) para derivar
   * el **período** a programar de su `fecha_desde`. Al resolver, fija `periodo`,
   * reconstruye el `FormArray` de días y trae los festivos de ese mes.
   */
  private cargarDetalleLinea(): void {
    const grupo = this.grupo();
    if (!grupo) return;

    this.cargandoPeriodo.set(true);
    this.detalleService
      .obtenerPorId<ProgramacionLineaRead>(grupo.documentoDetalleId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargandoPeriodo.set(false)),
      )
      .subscribe({
        next: (linea) => {
          const ym = anioMesDeIso(linea.fecha_desde);
          if (!ym) {
            this.periodo.set(null);
            return;
          }
          this.periodo.set({
            ...ym,
            etiqueta: new Date(ym.anio, ym.mes - 1, 1).toLocaleDateString('es-CO', {
              month: 'long',
              year: 'numeric',
            }),
          });
          this.rebuildDiasArray();
          this.cargarFestivos();
        },
        error: () => {
          this.periodo.set(null);
          const ts = this.t().common.toasts.loadError;
          this.toast.error(ts.title, ts.desc);
        },
      });
  }

  /**
   * Sincroniza el `FormArray` de días con el período actual: lo vacía y crea un
   * control de texto por día del mes. `emitEvent: false` para no disparar el
   * `valueChanges` que limpia los días ocupados.
   */
  private rebuildDiasArray(): void {
    const arr = this.form.controls.dias;
    arr.clear({ emitEvent: false });
    const total = this.dias().length;
    for (let i = 0; i < total; i++) arr.push(this.fb.control(''), { emitEvent: false });
  }

  /**
   * Trae los festivos del mes del período (`GET /general/festivo/mes/?anio=&mes=`)
   * para resaltarlos en la tabla. Sin período resuelto, no consulta.
   */
  private cargarFestivos(): void {
    const p = this.periodo();
    if (!p) {
      this.festivos.set([]);
      return;
    }
    this.festivoService
      .getDelMes(p.anio, p.mes)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (festivos) => this.festivos.set(festivos),
        error: () => this.festivos.set([]),
      });
  }

  /** Fecha ISO `YYYY-MM-DD` del día indicado dentro del período dado. */
  private fechaIso(periodo: { readonly anio: number; readonly mes: number }, dia: number): string {
    const mes = String(periodo.mes).padStart(2, '0');
    const d = String(dia).padStart(2, '0');
    return `${periodo.anio}-${mes}-${d}`;
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
        fecha: this.fechaIso(periodo, i + 1),
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
          if (this.handleProgramacionExistente(err, ts.title)) return;
          this.toast.error(ts.title, ts.desc);
        },
      });
  }

  /**
   * Maneja el 400 de `crear-programacion` cuando ya existe programación para una
   * o más fechas (`{ detail, existentes: [{ fecha, … }] }`): resalta las columnas
   * de esos días y muestra el `detail` en un toast. Devuelve `true` si el error
   * tenía esta forma (ya manejado); `false` para que el caller siga con el toast
   * genérico.
   */
  private handleProgramacionExistente(err: unknown, fallbackTitle: string): boolean {
    if (!(err instanceof HttpErrorResponse)) return false;
    const body = err.error as Partial<CrearProgramacionConflicto> | null;
    if (!body || !Array.isArray(body.existentes)) return false;

    const p = this.periodo();
    if (!p) return false;
    const mapa = new Map<number, ProgramacionExistente>();
    for (const e of body.existentes) {
      const [anio, mes, dia] = e.fecha.split('-').map(Number);
      if (anio === p.anio && mes === p.mes) mapa.set(dia, e);
    }
    if (mapa.size === 0) return false;

    this.diasOcupados.set(mapa);
    this.toast.error(fallbackTitle, body.detail);
    return true;
  }

  /**
   * Calcula los turnos del mes a partir de la secuencia y la posición inicial
   * (`POST /turno/secuencia/calcular-mes/`) y vuelca cada `turno_codigo` en el
   * input del día correspondiente de la tabla.
   */
  protected onAplicarSecuencia(): void {
    const secuencia = this.form.controls.secuencia.value;
    const posicionInicial = this.form.controls.posicionInicial.value;
    const periodo = this.periodo();
    if (!secuencia || posicionInicial == null || !periodo || this.isCalculating()) return;

    this.isCalculating.set(true);
    this.secuenciaService
      .calcularMes({
        secuencia_id: secuencia.id,
        posicion_inicial: posicionInicial,
        anio: periodo.anio,
        mes: periodo.mes,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isCalculating.set(false)),
      )
      .subscribe({
        next: (res) => this.volcarCalculo(res),
        error: (err) => console.error('Error al calcular el mes de la secuencia', err),
      });
  }

  /** Escribe el `turno_codigo` de cada día calculado en su input de la tabla. */
  private volcarCalculo(res: SecuenciaMesCalculado): void {
    const controls = this.diasArray.controls;
    for (const d of res.dias) {
      controls[d.dia - 1]?.setValue(d.turno_codigo);
    }
  }

  /** Selecciona una posición inicial haciendo clic en el picker de la secuencia. */
  protected onSeleccionarPosicion(pos: number): void {
    this.form.controls.posicionInicial.setValue(pos);
  }

  protected onClose(): void {
    this.visible.set(false);
  }
}
