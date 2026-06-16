import { Component, DestroyRef, computed, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { PopoverModule } from 'primeng/popover';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import {
  I18nService,
  ToastService,
  calcularResumen,
  formatCop,
  type ImpuestoLinea,
  type ResumenDocumento,
  type TasaImpuesto,
} from '@reddoc/core';
import { DocumentoDetalleService } from '@erp/core/module-config';
import { ErpItemAutocompleteComponent } from '@erp/core/components/item-autocomplete/erp-item-autocomplete.component';
import type { ItemOption } from '@erp/core/components/item-autocomplete/erp-item-autocomplete.component';
import { ErpImpuestoSelectComponent } from '@erp/core/components/impuesto-select/erp-impuesto-select.component';
import { ErpSelectDataService } from '@erp/core/data/erp-select-data.service';
import { ItemService } from '@erp/features/general/masters/item/item.service';
import type { AppDict } from '@erp/i18n';
import {
  createComercialDetalleGroup,
  type ComercialDetalleGroup,
} from '../../comercial-documento-detalle.form';
import {
  comercialDetalleToFormValue,
  comercialDetalleToPayload,
  lineBruto,
  lineNeto,
  tasaFromImpuestoOption,
  tasasDeVentaDelItem,
  toLineaCalculo,
} from '../../comercial-documento-detalle.mapper';
import type { ComercialDetalleRead } from '../../comercial-documento-detalle.model';
import type {
  ComercialDetalleFormRawValue,
  ImpuestoSeleccionarOption,
} from '../../comercial-documento-detalle.types';

/** Endpoint del catálogo de impuestos (mismo que usa `app-impuesto-select`). */
const IMPUESTO_SELECCIONAR_ENDPOINT = '/general/impuesto/seleccionar/';

/**
 * Tabla de **líneas (detalles)** de un documento comercial. Reutilizable por
 * todos los documentos comerciales (factura venta/compra, notas): recibe el
 * `FormArray` del form padre y lo edita **inline** (grid de factura).
 *
 * El cálculo por línea (subtotal/impuesto/neto) y el resumen del documento se
 * derivan del valor del array vía el kernel `@reddoc/core/calculo`. La tabla es
 * agnóstica al tipo de documento.
 *
 * Persistencia (igual que la familia servicio): en **alta** (`documentId == null`)
 * las líneas viven en el `FormArray` y viajan embebidas al crear el documento;
 * en **edición** transaccionan al instante contra `/documento-detalle` (botón
 * "guardar línea" por fila; baja inmediata).
 */
@Component({
  selector: 'app-comercial-documento-detalles',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputNumberModule,
    InputTextModule,
    PopoverModule,
    TooltipModule,
    ConfirmDialogModule,
    ErpItemAutocompleteComponent,
    ErpImpuestoSelectComponent,
  ],
  providers: [ConfirmationService],
  templateUrl: './comercial-documento-detalles.component.html',
  styleUrl: './comercial-documento-detalles.component.scss',
})
export class ComercialDocumentoDetallesComponent {
  private readonly i18n = inject<I18nService<AppDict>>(I18nService);
  private readonly detalleService = inject(DocumentoDetalleService);
  private readonly itemService = inject(ItemService);
  private readonly selectData = inject(ErpSelectDataService);
  private readonly confirmation = inject(ConfirmationService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly t = this.i18n.t;
  protected readonly formatMoney = formatCop;

  /** FormArray de líneas, propiedad del form padre. */
  readonly detalles = input.required<FormArray<ComercialDetalleGroup>>();

  /**
   * Id del documento en edición (`null` en alta). Cuando existe, las líneas
   * transaccionan al instante contra `/documento-detalle`.
   */
  readonly documentId = input<number | null>(null);

  /** Espejo reactivo del valor del array para la tabla, los totales y el resumen. */
  protected readonly lines = signal<readonly ComercialDetalleFormRawValue[]>([]);

  /** Resumen del documento: subtotal, desglose por impuesto y total. */
  protected readonly resumen = computed<ResumenDocumento>(() =>
    calcularResumen(this.lines().map(toLineaCalculo)),
  );

  /** Grupo persistiéndose ahora mismo (edición); bloquea su botón. */
  protected readonly savingGroup = signal<ComercialDetalleGroup | null>(null);

  /** Filas ya cableadas al fetch de impuestos del ítem (evita doble suscripción). */
  private readonly wired = new WeakSet<ComercialDetalleGroup>();

  /**
   * Pool de tasas de venta del catálogo (`general/impuesto/seleccionar/`). Fuente
   * autoritativa para calcular el monto de **cualquier** impuesto elegido en la
   * línea, no solo los configurados en el ítem. Vacío hasta que el fetch resuelve.
   */
  private readonly impuestosCatalog = signal<readonly TasaImpuesto[]>([]);

  constructor() {
    this.loadImpuestosCatalog();

    effect((onCleanup) => {
      const array = this.detalles();
      const sync = (): void => {
        this.lines.set(array.getRawValue());
        this.wireRows(array);
      };
      sync();
      const sub = array.valueChanges.subscribe(sync);
      onCleanup(() => sub.unsubscribe());
    });
  }

  /** Carga el catálogo de impuestos de venta una vez y lo aplica a las filas nuevas. */
  private loadImpuestosCatalog(): void {
    this.selectData
      .fetchOptions<ImpuestoSeleccionarOption>(IMPUESTO_SELECCIONAR_ENDPOINT, { venta: 'True' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (options) => {
          this.impuestosCatalog.set(options.map(tasaFromImpuestoOption));
          // Filas nuevas (sin id) que esperaban el catálogo para poder calcular.
          for (const group of this.detalles().controls) {
            if (group.controls.id.value == null) this.ensureCatalog(group);
          }
        },
        error: () => {
          // Sin catálogo, las líneas conservan los montos del ítem/backend.
        },
      });
  }

  protected addLinea(): void {
    this.detalles().push(createComercialDetalleGroup());
  }

  /** Pide confirmación y, al aceptar, elimina la línea (persiste en edición). */
  protected removeLinea(group: ComercialDetalleGroup): void {
    const { id } = group.getRawValue();
    this.confirmation.confirm({
      message: this.t().entities.comercialDetalle.confirmDeleteLine,
      header: this.t().common.confirms.deleteHeader,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.t().common.actions.delete,
      rejectLabel: this.t().common.actions.cancel,
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteLinea(group, id),
    });
  }

  /** `true` cuando procede mostrar el botón "guardar línea" (solo edición). */
  protected canSaveRow(group: ComercialDetalleGroup): boolean {
    return (
      this.documentId() != null && group.valid && (group.dirty || group.controls.id.value == null)
    );
  }

  protected isSavingRow(group: ComercialDetalleGroup): boolean {
    return this.savingGroup() === group;
  }

  /**
   * Persiste una línea en edición: PATCH si ya tiene `id`, POST con `documento_id`
   * si es nueva. La fila se reconstruye desde la respuesta autoritativa del
   * backend (impuestos y montos recalculados).
   */
  protected saveLinea(group: ComercialDetalleGroup): void {
    const docId = this.documentId();
    if (docId == null || group.invalid || this.savingGroup()) return;

    this.savingGroup.set(group);
    const raw = group.getRawValue();
    const payload = comercialDetalleToPayload(raw);
    const op =
      raw.id != null
        ? this.detalleService.actualizar<ComercialDetalleRead>(raw.id, payload)
        : this.detalleService.crear<ComercialDetalleRead>(docId, payload);

    op.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (saved) => {
        const index = this.detalles().controls.indexOf(group);
        if (index >= 0) {
          this.detalles().setControl(
            index,
            createComercialDetalleGroup(comercialDetalleToFormValue(saved)),
          );
        }
        this.savingGroup.set(null);
        const toast = this.t().entities.comercialDetalle.toasts.lineSaveSuccess;
        this.toast.success(toast.title, toast.desc);
      },
      error: () => {
        this.savingGroup.set(null);
        const toast = this.t().entities.comercialDetalle.toasts.lineSaveError;
        this.toast.error(toast.title, toast.desc);
      },
    });
  }

  // ── Columnas calculadas (por índice, derivadas del espejo `lines`) ──────────
  protected subtotalOf(index: number): number {
    const line = this.lines()[index];
    return line ? lineBruto(line) : 0;
  }

  /** Impuestos de la línea (id, nombre, monto) para renderizar los badges de la columna. */
  protected impuestosOf(index: number): readonly ImpuestoLinea[] {
    return this.lines()[index]?.impuestos_totales ?? [];
  }

  protected netoOf(index: number): number {
    const line = this.lines()[index];
    return line ? lineNeto(line) : 0;
  }

  /**
   * Cablea cada fila nueva:
   *  - al (re)elegir ítem, default-selecciona sus impuestos de venta.
   *  - al cambiar los impuestos elegidos, garantiza el pool de tasas del catálogo
   *    (cubre alternar impuestos en líneas en edición sin re-elegir el ítem).
   */
  private wireRows(array: FormArray<ComercialDetalleGroup>): void {
    for (const group of array.controls) {
      if (this.wired.has(group)) continue;
      this.wired.add(group);
      group.controls.item.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((opt) => this.loadItemTaxes(group, opt));
      group.controls.impuestos_ids.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.ensureCatalog(group));
    }
  }

  /**
   * Default-selecciona los impuestos de venta del ítem y asegura el pool de tasas.
   * Las tasas para calcular salen del catálogo (`ensureCatalog`), no del ítem.
   */
  private loadItemTaxes(group: ComercialDetalleGroup, opt: ItemOption | null): void {
    if (!opt) {
      group.controls.impuestos_ids.setValue([]);
      return;
    }
    this.ensureCatalog(group);
    this.itemService
      .getById(opt.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((item) => {
        group.controls.impuestos_ids.setValue(tasasDeVentaDelItem(item).map((tasa) => tasa.id));
      });
  }

  /**
   * Asegura que la fila tenga el pool de tasas del catálogo para recalcular.
   * Idempotente: solo lo setea si el catálogo está cargado y el pool de la fila
   * aún está vacío (no pisa montos del backend en edición hasta que el usuario
   * toca los impuestos). El recompute del grupo se dispara al setear el pool.
   */
  private ensureCatalog(group: ComercialDetalleGroup): void {
    const catalog = this.impuestosCatalog();
    if (catalog.length === 0) return;
    if (group.controls.impuestos_disponibles.value.length > 0) return;
    group.controls.impuestos_disponibles.setValue(catalog);
  }

  /** Ejecuta la baja: local en alta/línea no persistida; contra la API en edición. */
  private deleteLinea(group: ComercialDetalleGroup, id: number | null): void {
    if (this.documentId() == null || id == null) {
      this.removeGroup(group);
      return;
    }
    this.detalleService
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
  private removeGroup(group: ComercialDetalleGroup): void {
    const i = this.detalles().controls.indexOf(group);
    if (i >= 0) this.detalles().removeAt(i);
  }
}
