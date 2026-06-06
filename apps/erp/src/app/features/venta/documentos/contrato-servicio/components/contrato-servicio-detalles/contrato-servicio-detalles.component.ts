import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormArray } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { I18nService, formatCop, toHora } from '@reddoc/core';
import type { AppDict } from '@erp/i18n';
import { ContratoServicioDetalleModalComponent } from '../contrato-servicio-detalle-modal/contrato-servicio-detalle-modal.component';
import { createDetalleGroup, type DetalleGroup } from '../../contrato-servicio-detalle.form';
import type { DetalleFormRawValue } from '../../contrato-servicio-detalle.types';
import type { ErpSelectOption } from '@erp/core/components/api-select/erp-api-select.component';

/**
 * Listado de las líneas de servicio (detalles) del contrato.
 *
 * La tabla es **solo lectura**: el alta y la edición ocurren en
 * `app-contrato-servicio-detalle-modal`, así la tabla queda slim y el form de
 * línea tiene espacio. El padre es dueño del `FormArray`; aquí se agregan,
 * reemplazan y eliminan grupos. El subtotal por línea y el del contrato se
 * derivan del valor del array.
 */
@Component({
  selector: 'app-contrato-servicio-detalles',
  standalone: true,
  imports: [ButtonModule, ContratoServicioDetalleModalComponent],
  templateUrl: './contrato-servicio-detalles.component.html',
  styleUrl: './contrato-servicio-detalles.component.scss',
})
export class ContratoServicioDetallesComponent {
  private readonly i18n = inject<I18nService<AppDict>>(I18nService);

  protected readonly t = this.i18n.t;

  /** FormArray de líneas, propiedad del form padre. */
  readonly detalles = input.required<FormArray<DetalleGroup>>();

  /** Sector del contrato (del form padre); se reenvía al modal para tarifar. */
  readonly sectorId = input<number | null>(null);

  /** Id del contacto (del form padre); filtra los puestos disponibles en el modal. */
  readonly contactoId = input<number | null>(null);

  /** Salario del contrato (del form padre); bloquea el botón si es null y se pre-llena en el modal. */
  readonly salario = input<number | null>(null);

  /** Espejo reactivo del valor del array para la tabla y los subtotales. */
  protected readonly lines = signal<readonly DetalleFormRawValue[]>([]);

  /** Puesto de la primera línea; cuando existe lo bloquea en el modal para líneas subsiguientes. */
  protected readonly lockedPuesto = computed<ErpSelectOption | null>(
    () => this.lines()[0]?.puesto ?? null,
  );

  /** Subtotal del contrato (Σ cantidad × precio). Impuestos los calcula el backend. */
  protected readonly subtotal = computed(() =>
    this.lines().reduce((acc, line) => acc + this.lineAmount(line), 0),
  );

  // ── Estado del modal ────────────────────────────────────────────────────────
  protected readonly modalVisible = signal(false);
  /** Índice en edición; `null` ⇒ alta. */
  private readonly editingIndex = signal<number | null>(null);
  protected readonly modalValue = signal<DetalleFormRawValue | null>(null);

  constructor() {
    effect((onCleanup) => {
      const array = this.detalles();
      this.lines.set(array.getRawValue());
      const sub = array.valueChanges.subscribe(() => this.lines.set(array.getRawValue()));
      onCleanup(() => sub.unsubscribe());
    });
  }

  protected openCreate(): void {
    this.editingIndex.set(null);
    this.modalValue.set(null);
    this.modalVisible.set(true);
  }

  protected openEdit(index: number): void {
    this.editingIndex.set(index);
    this.modalValue.set(this.detalles().at(index).getRawValue());
    this.modalVisible.set(true);
  }

  protected removeLinea(index: number): void {
    this.detalles().removeAt(index);
  }

  /** Aplica el guardado del modal: agrega (alta) o reemplaza (edición) la línea. */
  protected onModalSave(value: DetalleFormRawValue): void {
    const index = this.editingIndex();
    if (index === null) this.detalles().push(createDetalleGroup(value));
    else this.detalles().setControl(index, createDetalleGroup(value));
  }

  /** Subtotal de una línea por índice. */
  protected lineSubtotal(index: number): number {
    const line = this.lines()[index];
    return line ? this.lineAmount(line) : 0;
  }

  /**
   * Formatea un monto a pesos colombianos sin decimales (`$ 1.000.000`).
   * `formatCop` coacciona el valor a número, así tolera el string con cola de
   * ceros que el backend autollena en `precio` al seleccionar un ítem.
   */
  protected readonly formatMoney = formatCop;

  /** Formatea una fecha a `dd MMM` (ej. `01 jun`). */
  protected formatDate(date: Date | null): string {
    if (!date) return '—';
    return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
  }

  /** Formatea la hora de un `Date` a `HH:mm`. */
  protected formatTime(date: Date | null): string {
    return toHora(date) ?? '—';
  }

  private lineAmount(line: DetalleFormRawValue): number {
    return (line.cantidad ?? 0) * (line.precio ?? 0);
  }
}
