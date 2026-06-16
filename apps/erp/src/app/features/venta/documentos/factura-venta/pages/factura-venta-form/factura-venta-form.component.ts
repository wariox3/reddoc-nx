import { Component, DestroyRef, type OnInit, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { FieldErrorComponent } from '@reddoc/ui';
import {
  FormErrorService,
  I18nService,
  startOfToday,
  TenantService,
  ToastService,
} from '@reddoc/core';
import { BreadcrumbComponent, type BreadcrumbItem } from '@reddoc/feature-base';
import { ventaDocumentoBreadcrumb } from '@erp/features/venta/shared/venta-breadcrumb';
import { ErpContactoSelectComponent } from '@erp/core/components/contacto-select/erp-contacto-select.component';
import {
  ErpApiSelectComponent,
  type ErpSelectOption,
} from '@erp/core/components/api-select/erp-api-select.component';
import { ErpSelectDataService } from '@erp/core/data/erp-select-data.service';
import { ENTITY_DATA_GATEWAY } from '@erp/core/module-config';
import type { DocumentEntityConfig } from '@erp/core/module-config';
import type { AppDict } from '@erp/i18n';
import {
  ALMACEN_ENDPOINT,
  FORMA_PAGO_ENDPOINT,
  PLAZO_PAGO_ENDPOINT,
  SEDE_ENDPOINT,
} from '../../factura-venta.constants';
import { ComercialDocumentoDetallesComponent } from '@erp/features/documentos/comercial/components/comercial-documento-detalles/comercial-documento-detalles.component';
import {
  createComercialDetalleGroup,
  type ComercialDetalleGroup,
} from '@erp/features/documentos/comercial/comercial-documento-detalle.form';
import { comercialDetalleToFormValue } from '@erp/features/documentos/comercial/comercial-documento-detalle.mapper';
import { facturaVentaToFormValue, formValueToPayload } from '../../factura-venta.mapper';
import type { FacturaVentaRead } from '../../factura-venta.model';

/** Fila del endpoint `plazo-pago/seleccionar/` con los días que aporta el plazo. */
interface PlazoPagoOption extends ErpSelectOption {
  readonly dias?: number | null;
}

/**
 * Formulario de alta/edición de la **cabecera** de una Factura de venta.
 *
 * Camino A del enfoque híbrido: el documento vive sobre el endpoint genérico
 * `/api/general/documento`. El form recibe el `DocumentEntityConfig` por input
 * binding (resuelto por `activeDocumentResolver` en la ruta padre) y deriva de
 * él el `documentTypeId`, las claves i18n y la ruta de la lista. El HTTP se
 * delega en `ENTITY_DATA_GATEWAY`.
 *
 * A diferencia de la familia *servicio*, la cabecera comercial es específica de
 * cada documento (los campos de una factura ≠ los de una nota débito): por eso
 * este form vive dentro de `factura-venta/` y no en un _shared. La **tabla de
 * detalles** —esa sí compartida entre documentos comerciales— se compone vía
 * `<app-comercial-documento-detalles>` recibiendo el `FormArray` de líneas.
 *
 * La misma página cubre crear y editar: sin `:id` → alta; con `:id` → edición.
 */
@Component({
  selector: 'app-factura-venta-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    BreadcrumbComponent,
    ButtonModule,
    DatePickerModule,
    FieldErrorComponent,
    ErpContactoSelectComponent,
    ErpApiSelectComponent,
    ComercialDocumentoDetallesComponent,
  ],
  templateUrl: './factura-venta-form.component.html',
  styleUrl: './factura-venta-form.component.scss',
})
export class FacturaVentaFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly gateway = inject(ENTITY_DATA_GATEWAY);
  private readonly selectData = inject(ErpSelectDataService);
  private readonly toast = inject(ToastService);
  private readonly formErrors = inject(FormErrorService);
  private readonly tenant = inject(TenantService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly i18n = inject<I18nService<AppDict>>(I18nService);

  protected readonly t = this.i18n.t;

  protected readonly plazoPagoEndpoint = PLAZO_PAGO_ENDPOINT;
  protected readonly sedeEndpoint = SEDE_ENDPOINT;
  protected readonly almacenEndpoint = ALMACEN_ENDPOINT;
  protected readonly formaPagoEndpoint = FORMA_PAGO_ENDPOINT;

  /** Filtra el autocomplete de contacto a clientes. */
  protected readonly contactoParams = { cliente: 'True' } as const;

  /** Documento activo inyectado por `activeDocumentResolver` vía router binding. */
  readonly document = input.required<DocumentEntityConfig>();

  /** Id del documento a editar (route param `:id`). Ausente en modo alta. */
  readonly id = input<string>();

  protected readonly isEditMode = computed(() => !!this.id());

  /** Id del documento como número (`null` en alta); alimenta la transacción por línea. */
  protected readonly documentId = computed(() => {
    const id = this.id();
    return id ? Number(id) : null;
  });
  protected readonly isSaving = signal(false);

  /** Mapa `idPlazo → días` para autocalcular la fecha de vencimiento. */
  private readonly plazoDias = new Map<number, number>();

  protected readonly breadcrumbItems = computed<readonly BreadcrumbItem[]>(() =>
    ventaDocumentoBreadcrumb(
      this.t(),
      this.tenant.currentSlug(),
      this.translateKey(this.document().displayNameKey),
      this.document().id,
      this.isEditMode() ? this.t().common.actions.edit : this.t().common.actions.new,
    ),
  );

  protected readonly form = this.fb.group({
    contacto: this.fb.control<ErpSelectOption | null>(null, Validators.required),
    fecha: this.fb.control<Date | null>(startOfToday(), Validators.required),
    fecha_vence: this.fb.control<Date | null>(null, Validators.required),
    plazo_pago: this.fb.control<ErpSelectOption | null>(null, Validators.required),
    sede: this.fb.control<ErpSelectOption | null>(null),
    almacen: this.fb.control<ErpSelectOption | null>(null),
    forma_pago: this.fb.control<ErpSelectOption | null>(null, Validators.required),
    detalles: new FormArray<ComercialDetalleGroup>([]),
  });

  constructor() {
    // Autocálculo del vencimiento: al cambiar fecha o plazo, vencimiento =
    // fecha + días del plazo. El campo sigue siendo editable; las ediciones
    // manuales se conservan hasta el próximo cambio de fecha/plazo.
    const recompute = () => this.recomputeVencimiento();
    this.form.controls.fecha.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(recompute);
    this.form.controls.plazo_pago.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(recompute);
  }

  ngOnInit(): void {
    this.loadPlazoDias();
    const id = this.id();
    if (id) this.loadDocumento(Number(id));
  }

  protected onSubmit(): void {
    if (this.form.invalid || this.form.pending || this.isSaving()) return;
    this.isSaving.set(true);

    const toasts = this.t().entities.facturaVenta.form.toasts;
    const id = this.id();
    // En edición se omiten los detalles del payload: transaccionan en vivo.
    const payload = formValueToPayload(
      this.form.getRawValue(),
      this.document().documentTypeId,
      !id,
    );
    const operation = id
      ? this.gateway.update(this.document(), Number(id), payload)
      : this.gateway.create(this.document(), payload);

    operation.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.isSaving.set(false);
        const ok = id ? toasts.editSuccess : toasts.createSuccess;
        this.toast.success(ok.title, ok.desc);
        this.navigateToList();
      },
      error: (err: unknown) => {
        this.isSaving.set(false);
        const fail = id ? toasts.editError : toasts.createError;
        this.formErrors.handle(this.form, err, fail.title);
      },
    });
  }

  protected onCancel(): void {
    this.navigateToList();
  }

  private loadDocumento(id: number): void {
    this.gateway
      .getById(this.document(), id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (raw) => {
          const read = raw as FacturaVentaRead;
          // `emitEvent: false`: no disparar el autocálculo y respetar el
          // vencimiento que viene del backend.
          this.form.patchValue(facturaVentaToFormValue(read), { emitEvent: false });
          const detalles = this.form.controls.detalles;
          detalles.clear();
          for (const line of read.detalles ?? [])
            detalles.push(createComercialDetalleGroup(comercialDetalleToFormValue(line)));
        },
        error: () => {
          const toasts = this.t().entities.facturaVenta.form.toasts;
          this.toast.error(toasts.loadError.title, toasts.loadError.desc);
        },
      });
  }

  /** Carga el mapa `idPlazo → días` para el autocálculo del vencimiento. */
  private loadPlazoDias(): void {
    this.selectData
      .fetchOptions<PlazoPagoOption>(PLAZO_PAGO_ENDPOINT)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (plazos) => {
          for (const plazo of plazos) {
            if (plazo.dias != null) this.plazoDias.set(plazo.id, plazo.dias);
          }
          // Si ya hay fecha + plazo elegidos, refrescar el vencimiento.
          this.recomputeVencimiento();
        },
        error: () => {
          // Sin días disponibles el vencimiento queda manual (sigue editable).
        },
      });
  }

  /** vencimiento = fecha + días del plazo (si ambos y los días están disponibles). */
  private recomputeVencimiento(): void {
    const fecha = this.form.controls.fecha.value;
    const plazoId = this.form.controls.plazo_pago.value?.id;
    if (!fecha || plazoId == null) return;
    const dias = this.plazoDias.get(plazoId);
    if (dias == null) return;

    const vencimiento = new Date(fecha);
    vencimiento.setDate(vencimiento.getDate() + dias);
    this.form.controls.fecha_vence.setValue(vencimiento, { emitEvent: false });
  }

  /** Vuelve a la lista del documento activo, derivando la ruta de `routes.list`. */
  private navigateToList(): void {
    const slug = this.tenant.currentSlug();
    if (!slug) return;
    const segments = this.document().routes.list.split('/').filter(Boolean);
    void this.router.navigate(['/t', slug, 'venta', ...segments]);
  }

  /** Resuelve una clave i18n con notación de punto (p. ej. `displayNameKey`). */
  private translateKey(key: string): string {
    let current: unknown = this.t();
    for (const part of key.split('.')) {
      if (current === null || typeof current !== 'object') return key;
      current = (current as Record<string, unknown>)[part];
    }
    return typeof current === 'string' ? current : key;
  }
}
