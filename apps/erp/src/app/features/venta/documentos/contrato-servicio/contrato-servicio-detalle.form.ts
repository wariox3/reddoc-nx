import { FormControl, FormGroup, Validators } from '@angular/forms';
import type { ErpSelectOption } from '@erp/core/components/api-select/erp-api-select.component';
import type { DetalleFormRawValue, ItemOption } from './contrato-servicio-detalle.types';

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
  programar: FormControl<boolean>;
  dias_semana: FormControl<number[]>;
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
    fecha_desde: new FormControl<Date | null>(value?.fecha_desde ?? null, {
      validators: Validators.required,
    }),
    fecha_hasta: new FormControl<Date | null>(value?.fecha_hasta ?? null, {
      validators: Validators.required,
    }),
    hora_desde: new FormControl<Date | null>(value?.hora_desde ?? midnight(), {
      validators: Validators.required,
    }),
    hora_hasta: new FormControl<Date | null>(value?.hora_hasta ?? midnight(), {
      validators: Validators.required,
    }),
    modalidad: new FormControl<ErpSelectOption | null>(value?.modalidad ?? null, {
      validators: Validators.required,
    }),
    programar: new FormControl<boolean>(value?.programar ?? false, { nonNullable: true }),
    dias_semana: new FormControl<number[]>([...(value?.dias_semana ?? [])], { nonNullable: true }),
    impuestos_ids: new FormControl<number[]>([...(value?.impuestos_ids ?? [])], {
      nonNullable: true,
    }),
  });

  group.controls.item.valueChanges.subscribe((opt) => {
    if (opt) group.controls.precio.setValue(opt.precio);
  });

  return group;
}

function midnight(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
