import { FormControl, FormGroup, Validators } from '@angular/forms';
import { startOfToday } from '@reddoc/core';
import type { ErpSelectOption } from '@erp/core/components/api-select/erp-api-select.component';
import type { DetalleFormRawValue, ItemOption } from './contrato-servicio-detalle.types';

function defaultFechaDesde(value?: Partial<DetalleFormRawValue>): Date | null {
  if (value !== undefined) return null;
  return new Date();
}

function defaultFechaHasta(value?: Partial<DetalleFormRawValue>): Date | null {
  if (value !== undefined) return null;
  const hoy = new Date();
  return new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
}

/** `FormGroup` tipado de una línea de detalle del contrato. */
export type DetalleGroup = FormGroup<{
  item: FormControl<ItemOption | null>;
  puesto: FormControl<ErpSelectOption | null>;
  cantidad: FormControl<number | null>;
  precio: FormControl<number | null>;
  fecha_desde: FormControl<Date | null>;
  fecha_hasta: FormControl<Date | null>;
  hora_desde: FormControl<Date | null>;
  hora_hasta: FormControl<Date | null>;
  modalidad: FormControl<ErpSelectOption | null>;
  salario: FormControl<number | null>;
  programar: FormControl<boolean>;
  dias_semana: FormControl<number[]>;
  festivo: FormControl<boolean>;
  cortesia: FormControl<boolean>;
  impuestos_ids: FormControl<number[]>;
}>;

/**
 * Crea un `FormGroup` de línea de detalle (vacío o precargado en edición).
 *
 * Al seleccionar un ítem autollena el precio (editable) — suscripción
 * auto-contenida: solo referencia controles del propio grupo, así que no
 * retiene nada externo y vive/ muere con el form.
 */
export function createDetalleGroup(value?: Partial<DetalleFormRawValue>): DetalleGroup {
  const group: DetalleGroup = new FormGroup({
    item: new FormControl<ItemOption | null>(value?.item ?? null, {
      validators: Validators.required,
    }),
    puesto: new FormControl<ErpSelectOption | null>(value?.puesto ?? null, {
      validators: Validators.required,
    }),
    cantidad: new FormControl<number | null>(value?.cantidad ?? 1, {
      validators: [Validators.required, Validators.min(1)],
    }),
    precio: new FormControl<number | null>(value?.precio ?? null, {
      validators: [Validators.required, Validators.min(0)],
    }),
    fecha_desde: new FormControl<Date | null>(value?.fecha_desde ?? defaultFechaDesde(value), {
      validators: Validators.required,
    }),
    fecha_hasta: new FormControl<Date | null>(value?.fecha_hasta ?? defaultFechaHasta(value), {
      validators: Validators.required,
    }),
    hora_desde: new FormControl<Date | null>(value?.hora_desde ?? startOfToday(), {
      validators: Validators.required,
    }),
    hora_hasta: new FormControl<Date | null>(value?.hora_hasta ?? startOfToday(), {
      validators: Validators.required,
    }),
    modalidad: new FormControl<ErpSelectOption | null>(value?.modalidad ?? null, {
      validators: Validators.required,
    }),
    salario: new FormControl<number | null>(value?.salario ?? null, {
      validators: [Validators.required, Validators.min(0)],
    }),
    programar: new FormControl<boolean>(value?.programar ?? true, { nonNullable: true }),
    dias_semana: new FormControl<number[]>(
      value?.dias_semana != null ? [...value.dias_semana] : [0, 1, 2, 3, 4, 5, 6],
      { nonNullable: true },
    ),
    festivo: new FormControl<boolean>(value?.festivo ?? true, { nonNullable: true }),
    cortesia: new FormControl<boolean>(value?.cortesia ?? false, { nonNullable: true }),
    impuestos_ids: new FormControl<number[]>([...(value?.impuestos_ids ?? [])], {
      nonNullable: true,
    }),
  });

  // Al elegir ítem se autollena el precio, salvo que la cortesía lo tenga en 0.
  group.controls.item.valueChanges.subscribe((opt) => {
    if (opt && !group.controls.cortesia.value) group.controls.precio.setValue(opt.precio);
  });

  // Cortesía: precio en 0 y bloqueado; al desactivar se reactiva (vuelve al del ítem).
  group.controls.cortesia.valueChanges.subscribe((on) => {
    const precio = group.controls.precio;
    if (on) {
      precio.setValue(0);
      precio.disable();
    } else {
      precio.enable();
      const item = group.controls.item.value;
      precio.setValue(item ? item.precio : null);
    }
  });

  // Estado inicial (edición con cortesía activa): precio en 0 y bloqueado.
  if (group.controls.cortesia.value) {
    group.controls.precio.setValue(0);
    group.controls.precio.disable();
  }

  return group;
}
