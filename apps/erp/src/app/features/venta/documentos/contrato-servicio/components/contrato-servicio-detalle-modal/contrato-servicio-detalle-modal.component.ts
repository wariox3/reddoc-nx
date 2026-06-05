import { CurrencyPipe, DecimalPipe } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { I18nService } from '@reddoc/core';
import { FieldErrorComponent } from '@reddoc/ui';
import {
  ErpApiSelectComponent,
  type ErpSelectOption,
} from '@erp/core/components/api-select/erp-api-select.component';
import { ErpImpuestoSelectComponent } from '@erp/core/components/impuesto-select/erp-impuesto-select.component';
import type { AppDict } from '@erp/i18n';
import { ErpItemAutocompleteComponent } from '../item-autocomplete/erp-item-autocomplete.component';
import { MODALIDAD_ENDPOINT, PUESTO_ENDPOINT } from '../../contrato-servicio.constants';
import { createDetalleGroup, type DetalleGroup } from '../../contrato-servicio-detalle.form';
import type { DetalleFormRawValue } from '../../contrato-servicio-detalle.types';
import { ContratoServicioService } from '../../contrato-servicio.service';
import type {
  CalcularPrecioSupervigilanciaPayload,
  CalcularPrecioSupervigilanciaResult,
} from '../../contrato-servicio.model';

/**
 * Modal de alta/edición de una **línea de detalle** del contrato.
 *
 * Trabaja sobre una **copia** (`DetalleGroup` propio) que se reinicializa cada
 * vez que el modal se abre: así "Cancelar" descarta los cambios sin tocar el
 * `FormArray` del padre. Al confirmar emite el valor crudo validado por `save`;
 * el padre decide si lo agrega o lo reemplaza. El layout es espacioso (agrupado
 * en comercial / cobertura / impuestos) porque el modal sí tiene espacio.
 */
@Component({
  selector: 'app-contrato-servicio-detalle-modal',
  standalone: true,
  imports: [
    CurrencyPipe,
    DecimalPipe,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    DatePickerModule,
    InputNumberModule,
    ToggleSwitchModule,
    FieldErrorComponent,
    ErpApiSelectComponent,
    ErpImpuestoSelectComponent,
    ErpItemAutocompleteComponent,
  ],
  templateUrl: './contrato-servicio-detalle-modal.component.html',
  styleUrl: './contrato-servicio-detalle-modal.component.scss',
})
export class ContratoServicioDetalleModalComponent {
  private readonly i18n = inject<I18nService<AppDict>>(I18nService);
  private readonly service = inject(ContratoServicioService);

  protected readonly t = this.i18n.t;
  protected readonly modalidadEndpoint = MODALIDAD_ENDPOINT;
  protected readonly puestoEndpoint = PUESTO_ENDPOINT;

  /** Visibilidad (two-way con el padre). */
  readonly visible = model<boolean>(false);
  /** Línea a editar; `null` ⇒ modo alta. */
  readonly value = input<DetalleFormRawValue | null>(null);
  /** Sector del contrato (vive en el form padre); alimenta el tarifador. */
  readonly sectorId = input<number | null>(null);
  /** Id del contacto del contrato; filtra las opciones de puesto. */
  readonly contactoId = input<number | null>(null);
  /** Puesto ya elegido en las líneas existentes; cuando está presente se pre-llena y bloquea. */
  readonly lockedPuesto = input<ErpSelectOption | null>(null);
  /** Emite el valor crudo validado al confirmar. */
  readonly save = output<DetalleFormRawValue>();

  protected readonly isEditMode = computed(() => this.value() !== null);
  protected readonly group = signal<DetalleGroup>(createDetalleGroup());

  protected readonly puestoParams = computed(() => {
    const params: Record<string, string> = {};
    const id = this.contactoId();
    if (id != null) params['contacto_id'] = String(id);
    return params;
  });

  protected readonly formValues = toSignal(
    toObservable(this.group).pipe(
      switchMap((g) => g.valueChanges.pipe(startWith(g.getRawValue()))),
      map((v) => ({
        cantidad: v.cantidad ?? 0,
        precio: v.precio ?? 0,
        dias_semana: v.dias_semana ?? [],
        hora_desde: v.hora_desde ?? null,
        hora_hasta: v.hora_hasta ?? null,
        modalidad_id: v.modalidad?.id ?? null,
      })),
    ),
    {
      initialValue: {
        cantidad: 0,
        precio: 0,
        dias_semana: [] as number[],
        hora_desde: null as Date | null,
        hora_hasta: null as Date | null,
        modalidad_id: null as number | null,
      },
    },
  );

  protected readonly subtotal = computed(() => {
    const { cantidad, precio } = this.formValues();
    return cantidad * precio;
  });

  /**
   * Payload del tarifador, o `null` mientras la cobertura esté incompleta
   * (faltan horario, modalidad, sector o no hay días activos). Reacciona tanto
   * al form (`formValues`) como al `sectorId` del padre.
   */
  private readonly calcPayload = computed<CalcularPrecioSupervigilanciaPayload | null>(() => {
    const { hora_desde, hora_hasta, modalidad_id, dias_semana } = this.formValues();
    const sector_id = this.sectorId();
    if (
      !hora_desde ||
      !hora_hasta ||
      modalidad_id == null ||
      sector_id == null ||
      dias_semana.length === 0
    ) {
      return null;
    }
    return {
      hora_desde: toHora(hora_desde),
      hora_hasta: toHora(hora_hasta),
      modalidad_id,
      sector_id,
      lunes: dias_semana.includes(0),
      martes: dias_semana.includes(1),
      miercoles: dias_semana.includes(2),
      jueves: dias_semana.includes(3),
      viernes: dias_semana.includes(4),
      sabado: dias_semana.includes(5),
      domingo: dias_semana.includes(6),
    };
  });

  /** `true` mientras hay un cálculo en vuelo (debounce + request). */
  protected readonly calcLoading = signal(false);

  /** Resultado del tarifador para la cobertura actual (`null` si incompleta). */
  protected readonly calcResult = toSignal(
    toObservable(this.calcPayload).pipe(
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      tap((payload) => this.calcLoading.set(payload !== null)),
      debounceTime(600),
      switchMap((payload) => {
        if (!payload) return of<CalcularPrecioSupervigilanciaResult | null>(null);
        return this.service
          .calcularPrecioSupervigilancia(payload)
          .pipe(catchError(() => of<CalcularPrecioSupervigilanciaResult | null>(null)));
      }),
      tap(() => this.calcLoading.set(false)),
    ),
    { initialValue: null as CalcularPrecioSupervigilanciaResult | null },
  );

  protected toggleDia(dia: number): void {
    const ctrl = this.group().controls.dias_semana;
    const current = [...ctrl.value];
    const idx = current.indexOf(dia);
    if (idx >= 0) {
      current.splice(idx, 1);
    } else {
      current.push(dia);
      current.sort((a, b) => a - b);
    }
    ctrl.setValue(current);
  }

  constructor() {
    // Al abrir, (re)inicializa la copia desde el valor actual. `untracked` evita
    // re-inicializar si `value` cambia mientras el modal sigue abierto.
    // Si hay un puesto bloqueado (ya existe ≥1 línea), se pre-llena y deshabilita.
    effect(() => {
      if (!this.visible()) return;
      const locked = untracked(this.lockedPuesto);
      const group = createDetalleGroup(untracked(this.value) ?? undefined);
      if (locked) {
        group.controls.puesto.setValue(locked);
        group.controls.puesto.disable();
      }
      this.group.set(group);
    });
  }

  protected onSave(): void {
    const group = this.group();
    if (group.invalid) {
      group.markAllAsTouched();
      return;
    }
    this.save.emit(group.getRawValue());
    this.visible.set(false);
  }

  protected onCancel(): void {
    this.visible.set(false);
  }
}

/** Formatea la hora de un `Date` a `HH:mm` (lo que espera el tarifador). */
function toHora(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}
