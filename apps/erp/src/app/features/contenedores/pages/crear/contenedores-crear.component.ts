import { Component, DestroyRef, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { I18nService, ToastService } from '@reddoc/core';
import { AuthService } from '../../../auth/services/auth.service';
import { ContenedorService } from '../../services/contenedor.service';
import type { AppDict } from '../../../../i18n';
import type { TipoSuscripcion } from '../../models/contenedor.model';

const PLAN_INFO: Record<number, string[]> = {
  1: [
    'Documentos ilimitados',
    '1 usuario con acceso',
    'Ingresos hasta $10.000.000 COP mes',
    'Soporte técnico',
  ],
  2: [
    'Documentos ilimitados',
    '1 usuario con acceso',
    'Ingresos hasta $10.000.000 COP mes',
    'Soporte técnico',
    'Facturación y compras',
    'Tesorería y cartera',
  ],
  3: [
    'Documentos ilimitados',
    '2 usuarios con acceso',
    'Ingresos hasta $50.000.000 COP mes',
    'Soporte técnico',
  ],
  4: [
    'Documentos ilimitados',
    '2 usuarios con acceso',
    'Ingresos hasta $50.000.000 COP mes',
    'Soporte técnico',
    'Facturación y compras',
    'Tesorería y cartera',
    'Inventario y POS+',
    'Contabilidad',
  ],
  5: [
    'Documentos ilimitados',
    '3 usuarios con acceso',
    'Ingresos hasta $200.000.000 COP mes',
    'Soporte técnico',
  ],
  6: [
    'Documentos ilimitados',
    '3 usuarios con acceso',
    'Ingresos hasta $200.000.000 COP mes',
    'Soporte técnico',
    'Facturación y compras',
    'Tesorería y cartera',
    'Nómina',
    'Inventario y POS+',
    'Contabilidad',
  ],
  7: [
    'Documentos ilimitados',
    '8 usuarios con acceso',
    'Ingresos hasta $500.000.000 COP mes',
    'Soporte técnico',
  ],
  8: [
    'Documentos ilimitados',
    '8 usuarios con acceso',
    'Ingresos hasta $500.000.000 COP mes',
    'Soporte especializado',
    'Facturación y compras',
    'Tesorería y cartera',
    'Nómina',
    'Inventario y POS+',
    'Contabilidad',
    'API integración',
    'Tablero analítica',
  ],
};

@Component({
  selector: 'app-contenedores-crear',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, DecimalPipe],
  templateUrl: './contenedores-crear.component.html',
  styleUrl: './contenedores-crear.component.scss',
})
export class ContenedoresCrearComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly contenedorService = inject(ContenedorService);
  private readonly toastService = inject(ToastService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly i18n = inject<I18nService<AppDict>>(I18nService);

  protected readonly t = this.i18n.t;
  protected readonly planInfo = PLAN_INFO;

  protected readonly pasos = [
    { icon: 'pi-building', label: 'Registrando tu empresa' },
    { icon: 'pi-database', label: 'Configurando la base de datos' },
    { icon: 'pi-credit-card', label: 'Activando tu plan de suscripción' },
    { icon: 'pi-cog', label: 'Preparando tus módulos' },
    { icon: 'pi-check-circle', label: 'Finalizando configuración' },
  ];

  readonly isSaving = signal(false);
  readonly currentStep = signal(0);
  readonly tiposSuscripcion = signal<TipoSuscripcion[]>([]);
  readonly claseActiva = signal<1 | 2>(1);
  readonly planSeleccionado = signal<number | null>(null);

  private stepInterval: ReturnType<typeof setInterval> | null = null;

  readonly planesActivos = computed(() =>
    this.tiposSuscripcion().filter((p) => p.suscripcion_clase_id === this.claseActiva()),
  );

  readonly nombreEmpresa = computed(() => this.form.controls.nombre.value ?? '');

  readonly ctaLabel = computed(() => {
    const id = this.planSeleccionado();
    if (id === null) return 'Crear contenedor';
    const plan = this.tiposSuscripcion().find((p) => p.id === id);
    if (!plan) return 'Crear contenedor';
    const precio = new Intl.NumberFormat('es-CO').format(+plan.precio);
    return `Crear con ${plan.nombre} · $${precio}/mes`;
  });

  readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    schema_name: ['', [Validators.required, Validators.pattern(/^[a-z0-9][a-z0-9_]*$/)]],
    telefono: ['', [Validators.required]],
    correo: ['', [Validators.required, Validators.email]],
    suscripcion_tipo_id: [null as number | null, [Validators.required]],
  });

  constructor() {
    const user = this.authService.currentUser();
    this.form.patchValue({
      correo: user?.email ?? '',
      telefono: user?.celular ?? '',
    });

    this.form.controls.nombre.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      const slug = (value ?? '')
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
      this.form.controls.schema_name.setValue(slug, { emitEvent: false });
    });
  }

  ngOnInit(): void {
    this.contenedorService
      .getTiposSuscripcion()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => this.tiposSuscripcion.set(res.results));
  }

  ngOnDestroy(): void {
    this._clearStepInterval();
  }

  cambiarClase(clase: 1 | 2): void {
    this.claseActiva.set(clase);
    this.planSeleccionado.set(null);
    this.form.controls.suscripcion_tipo_id.setValue(null);
  }

  seleccionarPlan(id: number): void {
    this.planSeleccionado.set(id);
    this.form.controls.suscripcion_tipo_id.setValue(id);
  }

  onSubmit(): void {
    if (this.form.invalid || this.isSaving()) return;
    this.isSaving.set(true);
    this.currentStep.set(0);
    this.stepInterval = setInterval(() => {
      this.currentStep.update((s) => Math.min(s + 1, this.pasos.length - 1));
    }, 6000);

    this.contenedorService
      .createContenedor(
        this.form.getRawValue() as Parameters<ContenedorService['createContenedor']>[0],
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this._clearStepInterval();
          this.isSaving.set(false);
          const toasts = this.t().contenedores.create.toasts;
          this.toastService.success(toasts.success.title, toasts.success.desc);
          this.router.navigate(['/contenedores']);
        },
        error: () => {
          this._clearStepInterval();
          this.isSaving.set(false);
          const toasts = this.t().contenedores.create.toasts;
          this.toastService.error(toasts.error.title, toasts.error.desc);
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/contenedores']);
  }

  private _clearStepInterval(): void {
    if (this.stepInterval) {
      clearInterval(this.stepInterval);
      this.stepInterval = null;
    }
  }
}
