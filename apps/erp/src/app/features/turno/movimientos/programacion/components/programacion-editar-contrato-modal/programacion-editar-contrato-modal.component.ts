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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import {
  FormArray,
  FormControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { forkJoin, of, finalize } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { I18nService, ToastService, fromIsoDate } from '@reddoc/core';
import type { AppDict } from '@erp/i18n';
import { UppercaseDirective } from '@erp/core/directives/uppercase.directive';
import type { ProgramacionContratoRef } from '../programacion-grid/programacion-grid.component';
import { ProgramacionService } from '../../programacion.service';
import type {
  ActualizarProgramacionPayload,
  ProgramacionErroresResponse,
  ProgramacionFecha,
  ProgramacionFila,
} from '../../programacion.model';

/**
 * Vista de un puesto (línea) del contrato para la banda del grid editable: solo lo
 * que se muestra a la izquierda (puesto + modalidad + horario). Cada puesto tiene
 * aquí una única fila: la del contrato en edición.
 */
interface PuestoView {
  readonly documentoDetalleId: number;
  readonly puestoId: number | null;
  readonly puestoNombre: string | null;
  readonly modalidadNombre: string | null;
  readonly horario: string | null;
}

/** Resultado de guardar un puesto: éxito, o error con la respuesta cruda del 400. */
type GuardarResult =
  | { readonly documentoDetalleId: number; readonly ok: true }
  | { readonly documentoDetalleId: number; readonly ok: false; readonly err: unknown };

/** `HH:mm:ss` → `HH:mm`; `null` si el valor no viene o no es válido. */
function horaCorta(hora: string | null): string | null {
  return hora && hora.length >= 5 ? hora.slice(0, 5) : null;
}

/** Franja `hora_desde`–`hora_hasta` formateada, o `null` si falta algún extremo. */
function formatHorario(desde: string | null, hasta: string | null): string | null {
  const d = horaCorta(desde);
  const h = horaCorta(hasta);
  return d && h ? `${d} - ${h}` : null;
}

/**
 * Modal para **editar la programación de un contrato en todos sus puestos a la vez**.
 *
 * Se abre desde el botón de editar del grid. Lista una banda por puesto (una línea
 * del contrato) con sus días **editables**, pre-llenados con los turnos actuales, y
 * guarda con una llamada `POST actualizar-programacion` por puesto (`forkJoin`). Las
 * `fechas` y las `filas` (ya filtradas por contrato) llegan del detalle, así que no
 * hay HTTP de carga. Al éxito total emite `applied` para que el padre recargue.
 */
@Component({
  selector: 'app-programacion-editar-contrato-modal',
  standalone: true,
  imports: [ReactiveFormsModule, DialogModule, ButtonModule, InputTextModule, UppercaseDirective],
  templateUrl: './programacion-editar-contrato-modal.component.html',
  styleUrl: './programacion-editar-contrato-modal.component.scss',
})
export class ProgramacionEditarContratoModalComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(ProgramacionService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly i18n = inject<I18nService<AppDict>>(I18nService);
  protected readonly t = this.i18n.t;

  /** Visibilidad del modal (two-way con el padre). */
  readonly visible = model<boolean>(false);

  /** Contrato en edición (identidad). `null` cuando el modal está cerrado. */
  readonly contrato = input<ProgramacionContratoRef | null>(null);

  /** Columnas de día del mes (compartidas por todos los puestos de la programación). */
  readonly fechas = input<readonly ProgramacionFecha[]>([]);

  /** Líneas del contrato (una por puesto) que se editan juntas. */
  readonly filas = input<readonly ProgramacionFila[]>([]);

  /** Claves ISO de fechas festivas — para resaltar columnas en el header. */
  readonly festivoClaves = input<ReadonlySet<string>>(new Set());

  /** Se emite tras guardar todos los puestos con éxito; el padre recarga el detalle. */
  readonly applied = output<void>();

  /**
   * Form: un `FormArray` de días (código de turno por día) por puesto, en el mismo
   * orden que `filas()`. Los metadatos de cada puesto para la banda van en
   * `puestosView` (paralelo por índice).
   */
  protected readonly form = this.fb.group({
    puestos: this.fb.array<FormArray<FormControl<string>>>([]),
  });

  protected get puestosArray(): FormArray<FormArray<FormControl<string>>> {
    return this.form.controls.puestos;
  }

  /** Metadatos de puesto para la banda (deriva de `filas()`, mismo orden). */
  protected readonly puestosView = computed<readonly PuestoView[]>(() =>
    this.filas().map((f) => ({
      documentoDetalleId: f.documento_detalle_id,
      puestoId: f.puesto_id,
      puestoNombre: f.puesto_nombre,
      modalidadNombre: f.modalidad_nombre,
      horario: formatHorario(f.hora_desde, f.hora_hasta),
    })),
  );

  /** Columnas totales de la tabla: solo los días (sin columna de empleado). */
  protected readonly colspan = computed(() => this.fechas().length);

  /** Etiqueta del mes (de la primera fecha), para el subtítulo del header. */
  protected readonly periodoEtiqueta = computed<string | null>(() => {
    const first = this.fechas()[0];
    const date = first ? fromIsoDate(first.clave) : null;
    return date ? date.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }) : null;
  });

  protected readonly isSubmitting = signal(false);

  /**
   * Casillas en error tras guardar, con scope de puesto: `documento_detalle_id →
   * (fecha ISO → mensaje)`. Se alimentan de los `errores` del 400 de cada puesto y
   * resaltan la celda con su tooltip hasta que el usuario corrige.
   */
  protected readonly celdasError = signal<ReadonlyMap<number, ReadonlyMap<string, string>>>(
    new Map(),
  );

  /** Mensaje de error de la casilla (puesto + día), o `null` si no tiene. */
  protected errorCelda(documentoDetalleId: number, clave: string): string | null {
    return this.celdasError().get(documentoDetalleId)?.get(clave) ?? null;
  }

  /**
   * Versión de los valores del form. Se incrementa en cada `valueChanges` para
   * disparar el recálculo de `conflictos` sin suscripciones por celda (el `computed`
   * lee los controles de forma imperativa; este signal es su gatillo al teclear).
   */
  private readonly valoresVersion = signal(0);

  /**
   * Celdas en conflicto por la regla "un turno por día entre puestos": si en una
   * fecha ≥2 puestos tienen código no vacío, esas celdas se marcan. Clave
   * `` `${documento_detalle_id}|${fecha ISO}` ``. Una sola pasada O(días × puestos),
   * memoizada; recalcula al teclear (`valoresVersion`) o al cambiar la estructura.
   */
  protected readonly conflictos = computed<ReadonlySet<string>>(() => {
    this.valoresVersion();
    const filas = this.filas();
    const fechas = this.fechas();
    const puestos = this.puestosArray;
    if (puestos.length !== filas.length) return new Set();

    const conflicto = new Set<string>();
    for (let j = 0; j < fechas.length; j++) {
      const llenos: number[] = [];
      for (let i = 0; i < filas.length; i++) {
        if (puestos.at(i).at(j).value.trim()) llenos.push(i);
      }
      if (llenos.length >= 2) {
        const clave = fechas[j].clave;
        for (const i of llenos) conflicto.add(`${filas[i].documento_detalle_id}|${clave}`);
      }
    }
    return conflicto;
  });

  /** `true` si la casilla (puesto + día) choca con otro puesto la misma fecha. */
  protected conflictoCelda(documentoDetalleId: number, clave: string): boolean {
    return this.conflictos().has(`${documentoDetalleId}|${clave}`);
  }

  /**
   * Solo se puede guardar con líneas cargadas, sin conflictos de "un turno por día
   * entre puestos" y sin envío en curso. Reactivo: se rehabilita al corregir la
   * casilla en conflicto.
   */
  protected readonly puedeGuardar = computed(
    () => this.filas().length > 0 && this.conflictos().size === 0 && !this.isSubmitting(),
  );

  constructor() {
    // Reconstruye el form (un FormArray de días por puesto) cuando cambian las filas
    // del contrato o las fechas del mes. Pre-llena cada día con su turno actual.
    // `emitEvent: false` para no disparar el valueChanges que limpia los errores.
    effect(() => {
      const filas = this.filas();
      const fechas = this.fechas();
      const arr = this.puestosArray;
      arr.clear({ emitEvent: false });
      for (const fila of filas) {
        const dias = this.fb.array<FormControl<string>>([]);
        for (const fecha of fechas) {
          dias.push(this.fb.control(fila.dias[fecha.clave]?.turno_codigo ?? ''), {
            emitEvent: false,
          });
        }
        arr.push(dias, { emitEvent: false });
      }
      // Nuevo contrato/mes: limpia los resaltados de un guardado anterior.
      this.celdasError.set(new Map());
    });

    // Al tocar cualquier casilla: bumpea la versión (recalcula conflictos) y retira
    // el resaltado de errores del backend.
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.valoresVersion.update((v) => v + 1);
      if (this.celdasError().size) this.celdasError.set(new Map());
    });
  }

  /**
   * Guarda cada puesto con su propia llamada `actualizar-programacion` (el endpoint
   * es por `documento_detalle_id`) y agrega los resultados con `forkJoin`. Si todos
   * pasan, cierra y avisa al padre; si alguno falla, mantiene el modal abierto,
   * resalta las celdas en error de ese puesto y muestra un toast.
   */
  protected onGuardar(): void {
    const contrato = this.contrato();
    const filas = this.filas();
    const fechas = this.fechas();
    if (!contrato || filas.length === 0 || this.isSubmitting()) return;

    const requests = filas.map((fila, i) => {
      const payload: ActualizarProgramacionPayload = {
        contrato_id: contrato.id,
        documento_detalle_id: fila.documento_detalle_id,
        items: fechas.map((fecha, j) => ({
          fecha: fecha.clave,
          turno_codigo: this.puestosArray.at(i).at(j).value.trim() || null,
        })),
      };
      return this.service.actualizarProgramacion(payload).pipe(
        map((): GuardarResult => ({ documentoDetalleId: fila.documento_detalle_id, ok: true })),
        catchError((err: unknown) =>
          of<GuardarResult>({ documentoDetalleId: fila.documento_detalle_id, ok: false, err }),
        ),
      );
    });

    this.isSubmitting.set(true);
    forkJoin(requests)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSubmitting.set(false)),
      )
      .subscribe((results) => this.procesarResultados(results));
  }

  /** Cierra con éxito si no hubo fallos; si los hubo, resalta y deja el modal abierto. */
  private procesarResultados(results: readonly GuardarResult[]): void {
    const ts = this.t().entities.programacion.detail.empleadosModal.toasts;
    const fallidos = results.filter((r) => !r.ok);

    if (fallidos.length === 0) {
      this.toast.success(ts.success.title, ts.success.desc);
      this.applied.emit();
      this.visible.set(false);
      return;
    }

    const mapa = new Map<number, ReadonlyMap<string, string>>();
    for (const r of fallidos) {
      if (r.ok) continue;
      const errores = this.parseErrores(r.err);
      if (errores) mapa.set(r.documentoDetalleId, errores);
    }
    this.celdasError.set(mapa);
    this.toast.error(ts.error.title, ts.error.desc);
  }

  /**
   * Extrae del 400 normalizado (`{ detail, errores: [{ fecha, mensaje, … }] }`) el
   * mapa `fecha ISO → mensaje` de un puesto. `null` si el error no tiene esa forma.
   */
  private parseErrores(err: unknown): ReadonlyMap<string, string> | null {
    if (!(err instanceof HttpErrorResponse)) return null;
    const body = err.error as Partial<ProgramacionErroresResponse> | null;
    if (!body || !Array.isArray(body.errores)) return null;
    const mapa = new Map<string, string>();
    for (const e of body.errores) mapa.set(e.fecha, e.mensaje);
    return mapa.size ? mapa : null;
  }

  protected onClose(): void {
    this.visible.set(false);
  }
}
