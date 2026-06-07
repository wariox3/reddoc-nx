import { Component, DestroyRef, computed, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { I18nService, ToastService, formatCop, toHora } from '@reddoc/core';
import { DocumentoDetalleService } from '@erp/core/module-config';
import type { AppDict } from '@erp/i18n';
import { ContratoServicioDetalleModalComponent } from '../contrato-servicio-detalle-modal/contrato-servicio-detalle-modal.component';
import { createDetalleGroup, type DetalleGroup } from '../../contrato-servicio-detalle.form';
import { detalleToPayload } from '../../contrato-servicio.mapper';
import type { ContratoServicioDetalleRead } from '../../contrato-servicio.model';
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
  imports: [ButtonModule, ConfirmDialogModule, ContratoServicioDetalleModalComponent],
  providers: [ConfirmationService],
  templateUrl: './contrato-servicio-detalles.component.html',
  styleUrl: './contrato-servicio-detalles.component.scss',
})
export class ContratoServicioDetallesComponent {
  private readonly i18n = inject<I18nService<AppDict>>(I18nService);
  private readonly detalle = inject(DocumentoDetalleService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly t = this.i18n.t;

  /** FormArray de líneas, propiedad del form padre. */
  readonly detalles = input.required<FormArray<DetalleGroup>>();

  /** Sector del contrato (del form padre); se reenvía al modal para tarifar. */
  readonly sectorId = input<number | null>(null);

  /** Id del contacto (del form padre); filtra los puestos disponibles en el modal. */
  readonly contactoId = input<number | null>(null);

  /** Salario del contrato (del form padre); bloquea el botón si es null y se pre-llena en el modal. */
  readonly salario = input<number | null>(null);

  /**
   * Id del documento en edición (`null` en alta). Cuando existe, las líneas
   * transaccionan al instante contra `/documento-detalle` en lugar de vivir
   * solo en el `FormArray`.
   */
  readonly documentId = input<number | null>(null);

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
  /** `true` mientras una línea se persiste en vivo (edición); bloquea el modal. */
  protected readonly savingLine = signal(false);

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

  /** Pide confirmación y, al aceptar, elimina la línea (persiste en edición). */
  protected removeLinea(index: number): void {
    const group = this.detalles().at(index);
    const { id } = group.getRawValue();
    this.confirmation.confirm({
      message: this.t().entities.contratoServicio.form.detalles.confirmDeleteLine,
      header: this.t().common.confirms.deleteHeader,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.t().common.actions.delete,
      rejectLabel: this.t().common.actions.cancel,
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteLinea(group, id),
    });
  }

  /**
   * Ejecuta la baja. En **alta** (o línea aún no persistida) solo se quita del
   * `FormArray`. En **edición** se elimina contra `/documento-detalle` y la fila
   * se quita al éxito (toast de error si falla, conservando la línea).
   */
  private deleteLinea(group: DetalleGroup, id: number | null): void {
    if (this.documentId() == null || id == null) {
      this.removeGroup(group);
      return;
    }
    this.detalle
      .eliminar(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.removeGroup(group);
          this.toast.success(
            this.t().common.toasts.deleteSuccess.title,
            this.t().common.toasts.deleteSuccess.desc,
          );
        },
        error: () =>
          this.toast.error(
            this.t().common.toasts.deleteError.title,
            this.t().common.toasts.deleteError.desc,
          ),
      });
  }

  /** Quita un grupo del `FormArray` por su referencia (robusto ante reordenamientos). */
  private removeGroup(group: DetalleGroup): void {
    const i = this.detalles().controls.indexOf(group);
    if (i >= 0) this.detalles().removeAt(i);
  }

  /**
   * Aplica el guardado del modal.
   *
   * En **alta** (sin documento aún) la línea solo vive en el `FormArray`; se
   * persiste al crear el documento y el modal se cierra al instante. En
   * **edición** transacciona contra `/documento-detalle`: PATCH si ya tiene `id`,
   * POST con `documento_id` si es nueva (guardando el `id` devuelto). El
   * `FormArray` se actualiza, se notifica el éxito y el modal se cierra **solo al
   * éxito**; si falla, el modal queda abierto (no se pierde lo digitado).
   */
  protected onModalSave(value: DetalleFormRawValue): void {
    const index = this.editingIndex();
    const docId = this.documentId();

    if (docId == null) {
      if (index === null) this.detalles().push(createDetalleGroup(value));
      else this.detalles().setControl(index, createDetalleGroup(value));
      this.modalVisible.set(false);
      return;
    }

    this.savingLine.set(true);
    const payload = detalleToPayload(value);
    if (value.id != null) {
      this.detalle
        .actualizar(value.id, payload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            if (index !== null) this.detalles().setControl(index, createDetalleGroup(value));
            this.savingLine.set(false);
            this.modalVisible.set(false);
            this.notifyLineSuccess();
          },
          error: () => {
            this.savingLine.set(false);
            this.notifyLineError();
          },
        });
    } else {
      this.detalle
        .crear<ContratoServicioDetalleRead>(docId, payload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (creado) => {
            this.detalles().push(createDetalleGroup({ ...value, id: creado.id ?? null }));
            this.savingLine.set(false);
            this.modalVisible.set(false);
            this.notifyLineSuccess();
          },
          error: () => {
            this.savingLine.set(false);
            this.notifyLineError();
          },
        });
    }
  }

  private notifyLineSuccess(): void {
    const toast = this.t().entities.contratoServicio.form.detalles.toasts.lineSaveSuccess;
    this.toast.success(toast.title, toast.desc);
  }

  private notifyLineError(): void {
    const toast = this.t().entities.contratoServicio.form.detalles.toasts.lineSaveError;
    this.toast.error(toast.title, toast.desc);
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
