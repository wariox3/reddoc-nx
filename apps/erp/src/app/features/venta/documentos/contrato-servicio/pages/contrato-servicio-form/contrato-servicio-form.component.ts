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
import { ErpContactoSelectComponent } from '@erp/core/components/contacto-select/erp-contacto-select.component';
import {
  ErpApiSelectComponent,
  type ErpSelectOption,
} from '@erp/core/components/api-select/erp-api-select.component';
import { ENTITY_DATA_GATEWAY } from '@erp/core/module-config';
import type { DocumentEntityConfig } from '@erp/core/module-config';
import { ConfiguracionService } from '@erp/core/services/configuracion.service';
import type { AppDict } from '@erp/i18n';
import {
  CONTRATO_SERVICIO_LIST_PATH,
  ESTRATO_OPTIONS,
  SECTOR_ENDPOINT,
} from '../../contrato-servicio.constants';
import {
  contratoServicioToFormValue,
  detallesToFormValue,
  formValueToPayload,
} from '../../contrato-servicio.mapper';
import type { ContratoServicioRead } from '../../contrato-servicio.model';
import { createDetalleGroup, type DetalleGroup } from '../../contrato-servicio-detalle.form';
import { ContratoServicioDetallesComponent } from '../../components/contrato-servicio-detalles/contrato-servicio-detalles.component';

/**
 * Formulario de alta/edición de **Contrato servicio** (documento de venta).
 *
 * Camino A del enfoque híbrido: el documento vive sobre el endpoint genérico
 * `/api/general/documento`. El form recibe el `DocumentEntityConfig` por input
 * binding (resuelto por `activeDocumentResolver` en la ruta padre) y delega el
 * HTTP en `ENTITY_DATA_GATEWAY` — no hay servicio propio.
 *
 * La misma página cubre crear y editar: sin `:id` → alta; con `:id` → edición.
 * Las líneas de servicio (detalles) se editan en `app-contrato-servicio-detalles`.
 */
@Component({
  selector: 'app-contrato-servicio-form',
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
    ContratoServicioDetallesComponent,
  ],
  templateUrl: './contrato-servicio-form.component.html',
  styleUrl: './contrato-servicio-form.component.scss',
})
export class ContratoServicioFormComponent implements OnInit {
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

  /** Id del contrato a editar (route param `:id`). Ausente en modo alta. */
  readonly id = input<string>();

  protected readonly isEditMode = computed(() => !!this.id());

  /** Id del documento como número (`null` en alta); alimenta la transacción por línea. */
  protected readonly documentId = computed(() => {
    const id = this.id();
    return id ? Number(id) : null;
  });
  protected readonly isSaving = signal(false);

  protected readonly breadcrumbItems = computed<readonly BreadcrumbItem[]>(() => {
    const slug = this.tenant.currentSlug();
    return [
      {
        label: this.t().modules.venta.name,
        routerLink: slug ? ['/t', slug, 'venta'] : undefined,
      },
      {
        label: this.t().entities.contratoServicio.name,
        routerLink: slug ? ['/t', slug, 'venta', 'contrato-servicio', 'list'] : undefined,
      },
      {
        label: this.isEditMode() ? this.t().common.actions.edit : this.t().common.actions.new,
      },
    ];
  });

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
      this.loadContrato(Number(id));
    } else {
      this.prefillSalarioMinimo();
    }
  }

  protected onSubmit(): void {
    if (this.form.invalid || this.form.pending || this.isSaving()) return;
    this.isSaving.set(true);

    const toasts = this.t().entities.contratoServicio.form.toasts;
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

  private loadContrato(id: number): void {
    this.gateway
      .getById(this.document(), id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (raw) => {
          const read = raw as ContratoServicioRead;
          this.form.patchValue(contratoServicioToFormValue(read));
          const detalles = this.form.controls.detalles;
          detalles.clear();
          for (const line of detallesToFormValue(read)) detalles.push(createDetalleGroup(line));
        },
        error: () => {
          const toasts = this.t().entities.contratoServicio.form.toasts;
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

  private navigateToList(): void {
    const slug = this.tenant.currentSlug();
    if (!slug) return;
    void this.router.navigate(['/t', slug, ...CONTRATO_SERVICIO_LIST_PATH]);
  }
}
