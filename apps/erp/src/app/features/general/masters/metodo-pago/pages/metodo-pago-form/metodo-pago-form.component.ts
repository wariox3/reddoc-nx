import { Component, DestroyRef, type OnInit, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { FieldErrorComponent } from '@reddoc/ui';
import { FormErrorService, I18nService, TenantService, ToastService } from '@reddoc/core';
import { BreadcrumbComponent, type BreadcrumbItem } from '@reddoc/feature-base';
import { ActiveModuleStore, currentModuleId, resolveModuleName } from '@erp/core/erp-modules';
import type { AppDict } from '@erp/i18n';
import { MetodoPagoService } from '../../metodo-pago.service';
import { METODO_PAGO_LIST_PATH } from '../../metodo-pago.constants';
import { formValueToPayload, metodoPagoToFormValue } from '../../metodo-pago.mapper';

/**
 * Formulario de alta/edición de método de pago.
 *
 * Master del módulo General (camino B) cableado en Compra. La misma página
 * cubre crear y editar: sin `:id` → alta; con `:id` → edición. Nombre y código
 * son obligatorios. Navegación module-agnostic vía `ActiveModuleStore`.
 */
@Component({
  selector: 'app-metodo-pago-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    BreadcrumbComponent,
    ButtonModule,
    InputTextModule,
    FieldErrorComponent,
  ],
  templateUrl: './metodo-pago-form.component.html',
  styleUrl: './metodo-pago-form.component.scss',
})
export class MetodoPagoFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(MetodoPagoService);
  private readonly toast = inject(ToastService);
  private readonly formErrors = inject(FormErrorService);
  private readonly tenant = inject(TenantService);
  private readonly activeModule = inject(ActiveModuleStore);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly i18n = inject<I18nService<AppDict>>(I18nService);

  protected readonly t = this.i18n.t;

  /** Id del método de pago a editar (route param `:id`). Ausente en modo alta. */
  readonly id = input<string>();

  protected readonly isEditMode = computed(() => !!this.id());
  protected readonly isSaving = signal(false);

  protected readonly breadcrumbItems = computed<readonly BreadcrumbItem[]>(() => {
    const slug = this.tenant.currentSlug();
    const moduleId = currentModuleId(this.activeModule);
    return [
      {
        label: resolveModuleName(this.activeModule, this.t()),
        routerLink: slug ? ['/t', slug, moduleId] : undefined,
      },
      {
        label: this.t().entities.metodoPago.name,
        routerLink: slug ? ['/t', slug, moduleId, ...METODO_PAGO_LIST_PATH] : undefined,
      },
      { label: this.isEditMode() ? this.t().common.actions.edit : this.t().common.actions.new },
    ];
  });

  protected readonly form = this.fb.group({
    codigo: this.fb.control<string | null>(null, [Validators.required, Validators.maxLength(50)]),
    nombre: this.fb.control<string>('', [Validators.required, Validators.maxLength(100)]),
  });

  ngOnInit(): void {
    const id = this.id();
    if (id) this.loadMetodoPago(Number(id));
  }

  protected onSubmit(): void {
    if (this.form.invalid || this.isSaving()) return;
    this.isSaving.set(true);

    const toasts = this.t().entities.metodoPago.form.toasts;
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

  private loadMetodoPago(id: number): void {
    this.service
      .getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (m) => this.form.patchValue(metodoPagoToFormValue(m)),
        error: () => {
          const toasts = this.t().entities.metodoPago.form.toasts;
          this.toast.error(toasts.loadError.title, toasts.loadError.desc);
        },
      });
  }

  private navigateToList(): void {
    const slug = this.tenant.currentSlug();
    if (!slug) return;
    void this.router.navigate([
      '/t',
      slug,
      currentModuleId(this.activeModule),
      ...METODO_PAGO_LIST_PATH,
    ]);
  }
}
