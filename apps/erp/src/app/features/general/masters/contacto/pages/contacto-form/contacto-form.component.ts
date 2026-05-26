import { Component, DestroyRef, type OnInit, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  type AbstractControl,
  type AsyncValidatorFn,
  FormBuilder,
  ReactiveFormsModule,
  type ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { type Observable, catchError, map, of, switchMap, timer } from 'rxjs';
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
import type { ContactoPayload } from '../../contacto.model';
import { calcularDigitoVerificacion } from '../../utils/digito-verificacion.util';
import { construirNombreCorto } from '../../utils/nombre-corto.util';

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

  // ── tipo_persona: 1 = Jurídica, 2 = Natural ────────────────────────────────
  private readonly tipoPersona = signal<number | null>(null);
  protected readonly esNatural = computed(() => this.tipoPersona() === 2);

  // ── clasificación: cliente / proveedor ──────────────────────────────────────
  private readonly clienteValue = signal(false);
  private readonly proveedorValue = signal(false);
  protected readonly esCliente = computed(() => this.clienteValue());
  protected readonly esProveedor = computed(() => this.proveedorValue());

  /**
   * Snapshot del contacto cargado en modo edición. Usado por el async validator
   * para omitir la consulta al backend cuando no cambió ni el número ni el tipo
   * de identificación (replica el comportamiento del legacy).
   */
  private readonly originalIdentificacion = signal<{
    numero_identificacion: string;
    identificacion_id: number;
  } | null>(null);
  protected readonly identificacionParams = computed<Record<string, string>>(() => {
    const id = this.tipoPersona();
    return id !== null ? { tipo_persona_id: String(id) } : ({} as Record<string, string>);
  });

  /** El endpoint de precio devuelve listas de venta y compra; filtramos venta. */
  protected readonly precioParams: Record<string, string> = { venta: 'True' };
  /** El endpoint de régimen incluye opciones inactivas; las excluimos. */
  protected readonly regimenParams: Record<string, string> = { inactivo: 'False' };

  // ── Formulario ──────────────────────────────────────────────────────────────
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
    this.form.controls.tipo_persona.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      const id = value?.id ?? null;
      this.tipoPersona.set(id);
      this.applyTipoPersonaValidators(id);
      this.form.controls.identificacion.setValue(null);
    });

    this.form.controls.cliente.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((v) => this.clienteValue.set(v ?? false));

    this.form.controls.proveedor.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((v) => this.proveedorValue.set(v ?? false));

    // El dígito de verificación se deriva del número de identificación.
    this.form.controls.numero_identificacion.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((numero) => {
        this.form.controls.digito_verificacion.setValue(calcularDigitoVerificacion(numero ?? ''), {
          emitEvent: false,
        });
      });

    // Async validator: consulta al backend si el número ya está registrado.
    this.form.controls.numero_identificacion.addAsyncValidators(
      this.validarNumeroIdentificacionUnico(),
    );

    // Cambiar el tipo de identificación dispara la revalidación del número.
    this.form.controls.identificacion.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.form.controls.numero_identificacion.updateValueAndValidity();
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

  /**
   * Async validator que verifica contra el backend si la combinación
   * `(identificacion_id, numero_identificacion)` ya está registrada.
   *
   * - Devuelve `null` (válido) si falta cualquiera de los dos datos.
   * - En edición, devuelve `null` si ninguno de los dos cambió respecto al
   *   contacto original cargado (evita consultas innecesarias).
   * - Aplica un debounce de 300 ms para no consultar en cada tecla.
   * - Si la red falla, no rompe el formulario: trata el campo como válido.
   */
  private validarNumeroIdentificacionUnico(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const numero = (control.value ?? '') as string;
      const identificacionId = this.form.controls.identificacion.value?.id ?? null;

      if (!numero || identificacionId === null) return of(null);

      const original = this.originalIdentificacion();
      if (
        original &&
        original.numero_identificacion === numero &&
        original.identificacion_id === identificacionId
      ) {
        return of(null);
      }

      return timer(300).pipe(
        switchMap(() =>
          this.contactoService.validar({
            identificacion_id: identificacionId,
            numero_identificacion: numero,
          }),
        ),
        map((res) => (res.validacion ? { numeroIdentificacionExistente: true } : null)),
        catchError(() => of(null)),
      );
    };
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
          this.form.patchValue({
            tipo_persona: { id: c.tipo_persona_id, nombre: c.tipo_persona_nombre },
            regimen: c.regimen_id !== null ? { id: c.regimen_id, nombre: '' } : null,
            identificacion: { id: c.identificacion_id, nombre: c.identificacion_nombre },
            numero_identificacion: c.numero_identificacion,
            nombre_corto: c.nombre_corto,
            nombre1: c.nombre1 ?? '',
            nombre2: c.nombre2 ?? '',
            apellido1: c.apellido1 ?? '',
            apellido2: c.apellido2 ?? '',
            telefono: c.telefono ?? '',
            celular: c.celular ?? '',
            ciudad: { id: c.ciudad_id, nombre: c.ciudad_nombre },
            direccion: c.direccion ?? '',
            barrio: c.barrio ?? '',
            correo: c.correo ?? '',
            cliente: c.cliente,
            proveedor: c.proveedor,
            empleado: c.empleado,
            plazo_pago: c.plazo_pago_id !== null ? { id: c.plazo_pago_id, nombre: '' } : null,
            precio: c.precio_id !== null ? { id: c.precio_id, nombre: '' } : null,
            asesor: c.asesor_id !== null ? { id: c.asesor_id, nombre: '' } : null,
            correo_facturacion_electronica: c.correo_facturacion_electronica ?? '',
            banco: c.banco_id !== null ? { id: c.banco_id, nombre: c.banco_nombre ?? '' } : null,
            numero_cuenta: c.numero_cuenta ?? '',
            cuenta_banco_clase:
              c.cuenta_banco_clase_id !== null ? { id: c.cuenta_banco_clase_id, nombre: '' } : null,
            plazo_pago_proveedor:
              c.plazo_pago_proveedor_id !== null
                ? { id: Number(c.plazo_pago_proveedor_id), nombre: '' }
                : null,
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
      regimen: v.regimen?.id ?? null,
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
      precio: v.precio?.id ?? null,
      asesor: v.asesor?.id ?? null,
      correo_facturacion_electronica: v.correo_facturacion_electronica || null,
      banco: v.banco?.id ?? null,
      numero_cuenta: v.numero_cuenta || null,
      cuenta_banco_clase: v.cuenta_banco_clase?.id ?? null,
      plazo_pago_proveedor: v.plazo_pago_proveedor?.id ?? null,
    };
  }

  private navigateToList(): void {
    const slug = this.tenant.currentSlug();
    if (!slug) return;
    void this.router.navigate(['/t', slug, 'general', 'contactos']);
  }
}
