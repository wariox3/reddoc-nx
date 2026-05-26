import { Component, DestroyRef, type OnInit, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { FieldErrorComponent } from '@reddoc/ui';
import { FormErrorService, I18nService, TenantService, ToastService } from '@reddoc/core';
import {
  ErpApiSelectComponent,
  ErpSelectOption,
} from '@erp/core/components/api-select/erp-api-select.component';
import { ErpApiAutocompleteComponent } from '@erp/core/components/api-autocomplete/erp-api-autocomplete.component';
import type { AppDict } from '@erp/i18n';
import { ContactoService } from '../../contacto.service';
import { CONTACTO_LIST_PATH, TIPO_PERSONA } from '../../contacto.constants';
import { contactoToFormValue, formValueToPayload } from '../../contacto.mapper';
import { calcularDigitoVerificacion } from '../../utils/digito-verificacion.util';
import {
  type NumeroIdentificacionSnapshot,
  numeroIdentificacionUnicoValidator,
} from '../../validators/numero-identificacion-unico.validator';

/**
 * Formulario de alta/edición de contacto.
 *
 * Master del módulo General (camino B). La misma página cubre crear y editar:
 * sin `:id` → alta; con `:id` → edición (el id llega por `withComponentInputBinding`).
 */
@Component({
  selector: 'app-contacto-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule,
    FieldErrorComponent,
    ErpApiSelectComponent,
    ErpApiAutocompleteComponent,
  ],
  templateUrl: './contacto-form.component.html',
  styleUrl: './contacto-form.component.scss',
})
export class ContactoFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly contactoService = inject(ContactoService);
  private readonly toast = inject(ToastService);
  private readonly formErrors = inject(FormErrorService);
  private readonly tenant = inject(TenantService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly i18n = inject<I18nService<AppDict>>(I18nService);

  protected readonly t = this.i18n.t;

  /** Id del contacto a editar (route param `:id`). Ausente en modo alta. */
  readonly id = input<string>();

  protected readonly isEditMode = computed(() => !!this.id());
  protected readonly isSaving = signal(false);

  private readonly tipoPersona = signal<number | null>(null);
  protected readonly esNatural = computed(() => this.tipoPersona() === TIPO_PERSONA.NATURAL);

  protected readonly esCliente = signal(false);
  protected readonly esProveedor = signal(false);

  /** Snapshot del contacto cargado en edición; usado por el async validator. */
  private readonly originalIdentificacion = signal<NumeroIdentificacionSnapshot | null>(null);

  protected readonly identificacionParams = computed<Record<string, string>>(() => {
    const id = this.tipoPersona();
    return id !== null ? { tipo_persona_id: String(id) } : ({} as Record<string, string>);
  });

  /** El endpoint de precio devuelve listas de venta y compra; filtramos venta. */
  protected readonly precioParams: Record<string, string> = { venta: 'True' };
  /** El endpoint de régimen incluye opciones inactivas; las excluimos. */
  protected readonly regimenParams: Record<string, string> = { inactivo: 'False' };

  protected readonly form = this.fb.group({
    tipo_persona: this.fb.control<ErpSelectOption | null>(null, Validators.required),
    regimen: this.fb.control<ErpSelectOption | null>(null, Validators.required),
    identificacion: this.fb.control<ErpSelectOption | null>(null, Validators.required),
    numero_identificacion: ['', Validators.required],
    digito_verificacion: this.fb.control<string>({ value: '', disabled: true }),
    nombre_corto: ['', Validators.required],
    nombre1: [''],
    nombre2: [''],
    apellido1: [''],
    apellido2: [''],
    telefono: ['', Validators.required],
    celular: ['', Validators.required],
    ciudad: this.fb.control<ErpSelectOption | null>(null, Validators.required),
    direccion: ['', Validators.required],
    barrio: [''],
    correo: ['', [Validators.required, Validators.email]],
    cliente: [false],
    proveedor: [false],
    empleado: [false],
    plazo_pago: this.fb.control<ErpSelectOption | null>(null, Validators.required),
    precio: this.fb.control<ErpSelectOption | null>(null),
    asesor: this.fb.control<ErpSelectOption | null>(null),
    correo_facturacion_electronica: ['', Validators.email],
    banco: this.fb.control<ErpSelectOption | null>(null),
    numero_cuenta: [''],
    cuenta_banco_clase: this.fb.control<ErpSelectOption | null>(null),
    plazo_pago_proveedor: this.fb.control<ErpSelectOption | null>(null),
  });

  constructor() {
    this.setupFormReactions();
  }

  ngOnInit(): void {
    const id = this.id();
    if (id) this.loadContacto(Number(id));
  }

  protected onSubmit(): void {
    if (this.form.invalid || this.isSaving()) return;
    this.isSaving.set(true);

    const toasts = this.t().entities.contacto.form.toasts;
    const id = this.id();
    const payload = formValueToPayload(this.form.getRawValue());
    const operation = id
      ? this.contactoService.update(Number(id), payload)
      : this.contactoService.create(payload);

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

  // ── Internos ────────────────────────────────────────────────────────────────

  /** Conecta los `valueChanges` del form a los signals y al async validator. */
  private setupFormReactions(): void {
    const { controls } = this.form;

    controls.tipo_persona.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      const id = value?.id ?? null;
      this.tipoPersona.set(id);
      this.applyTipoPersonaValidators(id);
      controls.identificacion.setValue(null);
    });

    controls.cliente.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((v) => this.esCliente.set(v ?? false));

    controls.proveedor.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((v) => this.esProveedor.set(v ?? false));

    // El dígito de verificación se deriva del número de identificación.
    controls.numero_identificacion.valueChanges.pipe(takeUntilDestroyed()).subscribe((numero) => {
      controls.digito_verificacion.setValue(calcularDigitoVerificacion(numero ?? ''), {
        emitEvent: false,
      });
    });

    controls.numero_identificacion.addAsyncValidators(
      numeroIdentificacionUnicoValidator(
        this.contactoService,
        () => controls.identificacion.value?.id ?? null,
        () => this.originalIdentificacion(),
      ),
    );

    // Cambiar el tipo de identificación dispara la revalidación del número.
    controls.identificacion.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      controls.numero_identificacion.updateValueAndValidity();
    });
  }

  /**
   * Ajusta los validadores de los campos de nombre según el tipo de persona:
   * Jurídica exige `nombre_corto`; Natural exige `nombre1` + `apellido1`.
   */
  private applyTipoPersonaValidators(tipo: number | null): void {
    const esNatural = tipo === TIPO_PERSONA.NATURAL;
    const { nombre_corto, nombre1, apellido1 } = this.form.controls;

    nombre_corto.setValidators(esNatural ? [] : [Validators.required]);
    nombre1.setValidators(esNatural ? [Validators.required] : []);
    apellido1.setValidators(esNatural ? [Validators.required] : []);

    nombre_corto.updateValueAndValidity();
    nombre1.updateValueAndValidity();
    apellido1.updateValueAndValidity();
  }

  private loadContacto(id: number): void {
    this.contactoService
      .getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (c) => {
          this.originalIdentificacion.set({
            numero_identificacion: c.numero_identificacion,
            identificacion_id: c.identificacion_id,
          });
          this.form.patchValue(contactoToFormValue(c));
        },
        error: () => {
          const toasts = this.t().entities.contacto.form.toasts;
          this.toast.error(toasts.loadError.title, toasts.loadError.desc);
        },
      });
  }

  private navigateToList(): void {
    const slug = this.tenant.currentSlug();
    if (!slug) return;
    void this.router.navigate(['/t', slug, ...CONTACTO_LIST_PATH]);
  }
}
