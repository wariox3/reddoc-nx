import { Component, DestroyRef, type OnInit, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { startWith } from 'rxjs';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
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
import { ENTITY_DATA_GATEWAY } from '@erp/core/module-config';
import type { DocumentEntityConfig } from '@erp/core/module-config';
import { ConfiguracionService } from '@erp/core/services/configuracion.service';
import type { AppDict } from '@erp/i18n';
import { ESTRATO_OPTIONS, SECTOR_ENDPOINT } from '../../servicio-documento.constants';
import {
  servicioDocumentoToFormValue,
  detallesToFormValue,
  formValueToPayload,
} from '../../servicio-documento.mapper';
import type { ServicioDocumentoRead } from '../../servicio-documento.model';
import { createDetalleGroup, type DetalleGroup } from '../../servicio-documento-detalle.form';
import { ServicioDocumentoDetallesComponent } from '../../components/servicio-documento-detalles/servicio-documento-detalles.component';

/**
 * Formulario de alta/edición de un **documento de servicio** (vigilancia):
 * contrato servicio, pedido servicio y futuros de la misma familia.
 *
 * Camino A del enfoque híbrido: el documento vive sobre el endpoint genérico
 * `/api/general/documento`. El form recibe el `DocumentEntityConfig` por input
 * binding (resuelto por `activeDocumentResolver` en la ruta padre) y deriva de
 * él el `documentTypeId`, las claves i18n (`displayNameKey`) y la ruta de la
 * lista (`routes.list`). El HTTP se delega en `ENTITY_DATA_GATEWAY` — no hay
 * servicio propio. Así un mismo componente sirve a cualquier documento de la
 * familia sin duplicarse.
 *
 * La misma página cubre crear y editar: sin `:id` → alta; con `:id` → edición.
 * Las líneas de servicio (detalles) se editan en `app-servicio-documento-detalles`.
 */
@Component({
  selector: 'app-servicio-documento-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    BreadcrumbComponent,
    ButtonModule,
    DatePickerModule,
    InputNumberModule,
    SelectModule,
    FieldErrorComponent,
    ErpContactoSelectComponent,
    ErpApiSelectComponent,
    ServicioDocumentoDetallesComponent,
  ],
  templateUrl: './servicio-documento-form.component.html',
  styleUrl: './servicio-documento-form.component.scss',
})
export class ServicioDocumentoFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly gateway = inject(ENTITY_DATA_GATEWAY);
  private readonly toast = inject(ToastService);
  private readonly formErrors = inject(FormErrorService);
  private readonly tenant = inject(TenantService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly i18n = inject<I18nService<AppDict>>(I18nService);
  private readonly configuracion = inject(ConfiguracionService);

  protected readonly t = this.i18n.t;
  protected readonly sectorEndpoint = SECTOR_ENDPOINT;
  /** Copia mutable de las opciones de estrato (PrimeNG `p-select` exige `any[]`). */
  protected readonly estratoOptions = [...ESTRATO_OPTIONS];

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
    sector: this.fb.control<ErpSelectOption | null>(null, Validators.required),
    estrato: this.fb.control<number | null>(null, Validators.required),
    salario: this.fb.control<number | null>(null, Validators.required),
    detalles: new FormArray<DetalleGroup>([]),
  });

  /** `true` cuando el sector quedó bloqueado por tener líneas agregadas. */
  protected readonly sectorLocked = signal(false);
  /** `true` cuando el contacto quedó bloqueado por tener líneas agregadas. */
  protected readonly contactoLocked = signal(false);

  constructor() {
    // Una vez existe ≥1 línea, sector y contacto se bloquean: cambiarlos
    // invalidaría las tarifas y los puestos ya asignados en las líneas.
    const sector = this.form.controls.sector;
    const contacto = this.form.controls.contacto;
    const detalles = this.form.controls.detalles;
    detalles.valueChanges
      .pipe(startWith(null), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const lock = detalles.length > 0;
        this.sectorLocked.set(lock);
        this.contactoLocked.set(lock);
        if (lock && sector.enabled) sector.disable({ emitEvent: false });
        else if (!lock && sector.disabled) sector.enable({ emitEvent: false });
        if (lock && contacto.enabled) contacto.disable({ emitEvent: false });
        else if (!lock && contacto.disabled) contacto.enable({ emitEvent: false });
      });
  }

  ngOnInit(): void {
    const id = this.id();
    if (id) {
      this.loadDocumento(Number(id));
    } else {
      this.prefillSalarioMinimo();
    }
  }

  protected onSubmit(): void {
    if (this.form.invalid || this.form.pending || this.isSaving()) return;
    this.isSaving.set(true);

    const toasts = this.t().entities.servicioDocumento.form.toasts;
    const id = this.id();
    // En edición se omiten los detalles del payload: ya transaccionaron en vivo.
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
          const read = raw as ServicioDocumentoRead;
          this.form.patchValue(servicioDocumentoToFormValue(read));
          const detalles = this.form.controls.detalles;
          detalles.clear();
          for (const line of detallesToFormValue(read)) detalles.push(createDetalleGroup(line));
        },
        error: () => {
          const toasts = this.t().entities.servicioDocumento.form.toasts;
          this.toast.error(toasts.loadError.title, toasts.loadError.desc);
        },
      });
  }

  private prefillSalarioMinimo(): void {
    this.configuracion
      .getCampos(['gen_uvt', 'hum_salario_minimo'])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (campos) => {
          const salario = campos['hum_salario_minimo'];
          if (salario != null) this.form.controls.salario.setValue(salario);
        },
        error: () => {
          // Pre-llenado opcional: si falla, el usuario digita el valor manualmente.
        },
      });
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
