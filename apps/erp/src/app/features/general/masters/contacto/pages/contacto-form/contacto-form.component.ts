import { Component, DestroyRef, type OnInit, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
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
import type { ContactoPayload } from '../../contacto.model';
import { calcularDigitoVerificacion } from '../../utils/digito-verificacion.util';
import { construirNombreCorto } from '../../utils/nombre-corto.util';

/** Opción de un `<p-select>`: etiqueta visible + id que viaja al backend. */
interface SelectOption {
  readonly label: string;
  readonly value: number;
}

/**
 * Formulario de alta/edición de contacto.
 *
 * Master del módulo General (camino B). La misma página cubre crear y editar:
 * sin `:id` → alta; con `:id` → edición (el id llega por `withComponentInputBinding`).
 *
 * Estado actual — UI completa:
 * los 9 selectores que dependen de endpoints `general/<recurso>/seleccionar/` se
 * renderizan deshabilitados (sin opciones). Cada `*Options` queda como array vacío
 * con un `TODO(api)` indicando su endpoint; se conectan uno a uno más adelante.
 * El único selector activo es `tipo_persona`, con opciones hardcodeadas, porque
 * gobierna qué campos de nombre se muestran.
 */
@Component({
  selector: 'app-contacto-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
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

  // ── tipo_persona: 1 = Jurídica, 2 = Natural ────────────────────────────────
  private readonly tipoPersona = signal<number | null>(null);
  protected readonly esNatural = computed(() => this.tipoPersona() === 2);
  protected readonly identificacionParams = computed<Record<string, string>>(() => {
    const id = this.tipoPersona();
    return id !== null ? { tipo_persona_id: String(id) } : ({} as Record<string, string>);
  });

  // ── Selectores pendientes de API (ver TODO de cada endpoint) ────────────────
  // TODO(api): general/regimen/seleccionar/  { inactivo: 'False' }
  protected readonly regimenOptions: SelectOption[] = [];
  // TODO(api): general/precio/seleccionar/  { venta: 'True' }
  protected readonly precioOptions: SelectOption[] = [];
  // TODO(api): general/asesor/seleccionar/
  protected readonly asesorOptions: SelectOption[] = [];
  // TODO(api): general/cuenta_banco_clase/seleccionar/
  protected readonly cuentaBancoClaseOptions: SelectOption[] = [];

  // ── Formulario ──────────────────────────────────────────────────────────────
  // Los controles respaldados por un selector API arrancan `disabled` hasta que
  // su endpoint esté disponible. `tipo_persona` arranca en Jurídica (1).
  protected readonly form = this.fb.group({
    tipo_persona: this.fb.control<ErpSelectOption | null>(null, Validators.required),
    regimen: this.fb.control<number | null>({ value: null, disabled: true }, Validators.required),
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
    precio: this.fb.control<number | null>({ value: null, disabled: true }),
    asesor: this.fb.control<number | null>({ value: null, disabled: true }),
    correo_facturacion_electronica: ['', Validators.email],
    banco: this.fb.control<ErpSelectOption | null>(null),
    numero_cuenta: [''],
    cuenta_banco_clase: this.fb.control<number | null>({ value: null, disabled: true }),
    plazo_pago_proveedor: this.fb.control<ErpSelectOption | null>(null),
  });

  constructor() {
    this.form.controls.tipo_persona.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      const id = value?.id ?? null;
      this.tipoPersona.set(id);
      this.applyTipoPersonaValidators(id);
      this.form.controls.identificacion.setValue(null);
    });

    // El dígito de verificación se deriva del número de identificación.
    this.form.controls.numero_identificacion.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((numero) => {
        this.form.controls.digito_verificacion.setValue(calcularDigitoVerificacion(numero ?? ''), {
          emitEvent: false,
        });
      });
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
    const operation = id
      ? this.contactoService.update(Number(id), this.buildPayload())
      : this.contactoService.create(this.buildPayload());

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

  /**
   * Ajusta los validadores de los campos de nombre según el tipo de persona:
   * Jurídica exige `nombre_corto`; Natural exige `nombre1` + `apellido1`.
   */
  private applyTipoPersonaValidators(tipo: number | null): void {
    const esNatural = tipo === 2;
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
          // `regimen` y `cuenta_banco_clase` se omiten: selectores pendientes de API.
          this.form.patchValue({
            tipo_persona: { id: c.tipo_persona, nombre: c.tipo_persona_nombre },
            identificacion: { id: c.identificacion, nombre: c.identificacion_nombre },
            numero_identificacion: c.numero_identificacion,
            nombre_corto: c.nombre_corto,
            nombre1: c.nombre1 ?? '',
            nombre2: c.nombre2 ?? '',
            apellido1: c.apellido1 ?? '',
            apellido2: c.apellido2 ?? '',
            telefono: c.telefono ?? '',
            celular: c.celular ?? '',
            ciudad: { id: c.ciudad, nombre: c.ciudad_nombre },
            direccion: c.direccion ?? '',
            barrio: c.barrio ?? '',
            correo: c.correo ?? '',
            cliente: c.cliente,
            proveedor: c.proveedor,
            empleado: c.empleado,
            plazo_pago: c.plazo_pago !== null ? { id: c.plazo_pago, nombre: '' } : null,
            precio: c.precio,
            asesor: c.asesor,
            correo_facturacion_electronica: c.correo_facturacion_electronica ?? '',
            banco: c.banco !== null ? { id: c.banco, nombre: '' } : null,
            numero_cuenta: c.numero_cuenta ?? '',
            plazo_pago_proveedor:
              c.plazo_pago_proveedor !== null ? { id: c.plazo_pago_proveedor, nombre: '' } : null,
          });
        },
        error: () => {
          const toasts = this.t().entities.contacto.form.toasts;
          this.toast.error(toasts.loadError.title, toasts.loadError.desc);
        },
      });
  }

  /**
   * Construye el payload del backend. Los strings vacíos se normalizan a `null`
   * acá (en vez de en el blur de cada campo, como hacía el legacy).
   */
  private buildPayload(): ContactoPayload {
    const v = this.form.getRawValue();
    const nombreCorto = this.esNatural()
      ? construirNombreCorto({
          nombre1: v.nombre1,
          nombre2: v.nombre2,
          apellido1: v.apellido1,
          apellido2: v.apellido2,
        })
      : (v.nombre_corto ?? '');
    return {
      tipo_persona: v.tipo_persona?.id ?? null,
      regimen: v.regimen,
      identificacion: v.identificacion?.id ?? null,
      numero_identificacion: v.numero_identificacion ?? '',
      digito_verificacion: v.digito_verificacion || null,
      nombre_corto: nombreCorto || null,
      nombre1: v.nombre1 || null,
      nombre2: v.nombre2 || null,
      apellido1: v.apellido1 || null,
      apellido2: v.apellido2 || null,
      telefono: v.telefono || null,
      celular: v.celular || null,
      ciudad: v.ciudad?.id ?? null,
      direccion: v.direccion || null,
      barrio: v.barrio || null,
      correo: v.correo || null,
      cliente: v.cliente ?? false,
      proveedor: v.proveedor ?? false,
      empleado: v.empleado ?? false,
      plazo_pago: v.plazo_pago?.id ?? null,
      precio: v.precio,
      asesor: v.asesor,
      correo_facturacion_electronica: v.correo_facturacion_electronica || null,
      banco: v.banco?.id ?? null,
      numero_cuenta: v.numero_cuenta || null,
      cuenta_banco_clase: v.cuenta_banco_clase,
      plazo_pago_proveedor: v.plazo_pago_proveedor?.id ?? null,
    };
  }

  private navigateToList(): void {
    const slug = this.tenant.currentSlug();
    if (!slug) return;
    void this.router.navigate(['/t', slug, 'general', 'contactos']);
  }
}
