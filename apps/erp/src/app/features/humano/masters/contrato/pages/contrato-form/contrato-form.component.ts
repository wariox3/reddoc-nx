import { Component, DestroyRef, type OnInit, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { TextareaModule } from 'primeng/textarea';
import { FormErrorService, I18nService, TenantService, ToastService } from '@reddoc/core';
import type { ErpSelectOption } from '@erp/core/components/api-select/erp-api-select.component';
import type { AppDict } from '@erp/i18n';
import { ContratoService } from '../../contrato.service';
import { CONTRATO_LIST_PATH } from '../../contrato.constants';
import { contratoToFormValue, formValueToPayload } from '../../contrato.mapper';

/**
 * Formulario de alta/edición de contrato.
 *
 * Master del módulo Humano (camino B). La misma página cubre crear y editar:
 * sin `:id` → alta; con `:id` → edición (el id llega por `withComponentInputBinding`).
 *
 * Los dropdowns de relaciones (FK) se renderizan deshabilitados como `<p-select>`
 * plano (sin endpoint, sin opciones) porque aún no hay endpoints `seleccionar/`.
 * TODO(endpoint): reemplazar cada uno por `<app-api-select endpoint="...">` y
 * habilitar su control cuando se definan los endpoints.
 */
@Component({
  selector: 'app-contrato-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    SelectModule,
    DatePickerModule,
    InputNumberModule,
    CheckboxModule,
    TextareaModule,
  ],
  templateUrl: './contrato-form.component.html',
  styleUrl: './contrato-form.component.scss',
})
export class ContratoFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(ContratoService);
  private readonly toast = inject(ToastService);
  private readonly formErrors = inject(FormErrorService);
  private readonly tenant = inject(TenantService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly i18n = inject<I18nService<AppDict>>(I18nService);

  protected readonly t = this.i18n.t;

  /** Id del contrato a editar (route param `:id`). Ausente en modo alta. */
  readonly id = input<string>();
  protected readonly isEditMode = computed(() => !!this.id());

  protected readonly isSaving = signal(false);

  // Las FK arrancan deshabilitadas (pendientes de endpoint). Ver TODO de la clase.
  protected readonly form = this.fb.group({
    // Datos del contrato
    contacto: this.fb.control<ErpSelectOption | null>({ value: null, disabled: true }),
    contrato_tipo: this.fb.control<ErpSelectOption | null>({ value: null, disabled: true }),
    cargo: this.fb.control<ErpSelectOption | null>({ value: null, disabled: true }),
    grupo: this.fb.control<ErpSelectOption | null>({ value: null, disabled: true }),
    sucursal: this.fb.control<ErpSelectOption | null>({ value: null, disabled: true }),
    tiempo: this.fb.control<ErpSelectOption | null>({ value: null, disabled: true }),
    fecha_desde: this.fb.control<Date | null>(null),
    fecha_hasta: this.fb.control<Date | null>(null),
    // Remuneración
    salario: this.fb.control<number | null>(null),
    auxilio_transporte: this.fb.control<number | null>(null),
    salario_integral: this.fb.control<boolean>(false),
    tipo_costo: this.fb.control<ErpSelectOption | null>({ value: null, disabled: true }),
    grupo_contabilidad: this.fb.control<ErpSelectOption | null>({ value: null, disabled: true }),
    // Seguridad social
    salud: this.fb.control<ErpSelectOption | null>({ value: null, disabled: true }),
    entidad_salud: this.fb.control<ErpSelectOption | null>({ value: null, disabled: true }),
    pension: this.fb.control<ErpSelectOption | null>({ value: null, disabled: true }),
    entidad_pension: this.fb.control<ErpSelectOption | null>({ value: null, disabled: true }),
    entidad_cesantias: this.fb.control<ErpSelectOption | null>({ value: null, disabled: true }),
    entidad_caja: this.fb.control<ErpSelectOption | null>({ value: null, disabled: true }),
    riesgo: this.fb.control<ErpSelectOption | null>({ value: null, disabled: true }),
    tipo_cotizante: this.fb.control<ErpSelectOption | null>({ value: null, disabled: true }),
    subtipo_cotizante: this.fb.control<ErpSelectOption | null>({ value: null, disabled: true }),
    ciudad_contrato: this.fb.control<ErpSelectOption | null>({ value: null, disabled: true }),
    ciudad_labora: this.fb.control<ErpSelectOption | null>({ value: null, disabled: true }),
    // Terminación y pagos
    estado_terminado: this.fb.control<boolean>(false),
    motivo_terminacion: this.fb.control<ErpSelectOption | null>({ value: null, disabled: true }),
    fecha_ultimo_pago: this.fb.control<Date | null>(null),
    fecha_ultimo_pago_prima: this.fb.control<Date | null>(null),
    fecha_ultimo_pago_cesantia: this.fb.control<Date | null>(null),
    fecha_ultimo_pago_vacacion: this.fb.control<Date | null>(null),
    comentario: this.fb.control<string>(''),
  });

  ngOnInit(): void {
    const id = this.id();
    if (id) this.loadContrato(Number(id));
  }

  protected onSubmit(): void {
    if (this.form.invalid || this.form.pending || this.isSaving()) return;
    this.isSaving.set(true);

    const toasts = this.t().entities.contrato.form.toasts;
    const id = this.id();
    const payload = formValueToPayload(this.form.getRawValue());
    const operation = id ? this.service.update(Number(id), payload) : this.service.create(payload);

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
    this.service
      .getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (c) => this.form.patchValue(contratoToFormValue(c)),
        error: () => {
          const toasts = this.t().entities.contrato.form.toasts;
          this.toast.error(toasts.loadError.title, toasts.loadError.desc);
        },
      });
  }

  private navigateToList(): void {
    const slug = this.tenant.currentSlug();
    if (!slug) return;
    void this.router.navigate(['/t', slug, ...CONTRATO_LIST_PATH]);
  }
}
