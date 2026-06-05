import { Component, DestroyRef, type OnInit, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { FieldErrorComponent } from '@reddoc/ui';
import { FormErrorService, I18nService, TenantService, ToastService } from '@reddoc/core';
import {
  ErpApiSelectComponent,
  type ErpSelectOption,
} from '@erp/core/components/api-select/erp-api-select.component';
import { ErpApiAutocompleteComponent } from '@erp/core/components/api-autocomplete/erp-api-autocomplete.component';
import { ErpContactoSelectComponent } from '@erp/core/components/contacto-select/erp-contacto-select.component';
import type { AppDict } from '@erp/i18n';
import { PuestoService } from '../../puesto.service';
import { PUESTO_LIST_PATH } from '../../puesto.constants';
import { puestoToFormValue, formValueToPayload } from '../../puesto.mapper';

/**
 * Formulario de alta/edición de puesto.
 *
 * Master del módulo Turno (camino B). La misma página cubre crear y editar:
 * sin `:id` → alta; con `:id` → edición (el id llega por `withComponentInputBinding`).
 */
@Component({
  selector: 'app-puesto-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    FieldErrorComponent,
    ErpApiSelectComponent,
    ErpApiAutocompleteComponent,
    ErpContactoSelectComponent,
  ],
  templateUrl: './puesto-form.component.html',
  styleUrl: './puesto-form.component.scss',
})
export class PuestoFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly puestoService = inject(PuestoService);
  private readonly toast = inject(ToastService);
  private readonly formErrors = inject(FormErrorService);
  private readonly tenant = inject(TenantService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly i18n = inject<I18nService<AppDict>>(I18nService);

  protected readonly t = this.i18n.t;

  /** Id del puesto a editar (route param `:id`). Ausente en modo alta. */
  readonly id = input<string>();

  protected readonly isEditMode = computed(() => !!this.id());
  protected readonly isSaving = signal(false);

  protected readonly form = this.fb.group({
    nombre: ['', Validators.required],
    direccion: [''],
    celular: [''],
    latitud: [''],
    longitud: [''],
    comentario: [''],
    ciudad: this.fb.control<ErpSelectOption | null>(null),
    contacto: this.fb.control<ErpSelectOption | null>(null),
    programador: this.fb.control<ErpSelectOption | null>({ value: null, disabled: true }),
  });

  ngOnInit(): void {
    const id = this.id();
    if (id) this.loadPuesto(Number(id));
  }

  protected onSubmit(): void {
    if (this.form.invalid || this.isSaving()) return;
    this.isSaving.set(true);

    const toasts = this.t().entities.puesto.form.toasts;
    const id = this.id();
    const payload = formValueToPayload(this.form.getRawValue());
    const operation = id
      ? this.puestoService.update(Number(id), payload)
      : this.puestoService.create(payload);

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

  private loadPuesto(id: number): void {
    this.puestoService
      .getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (p) => {
          this.form.patchValue(puestoToFormValue(p));
        },
        error: () => {
          const toasts = this.t().entities.puesto.form.toasts;
          this.toast.error(toasts.loadError.title, toasts.loadError.desc);
        },
      });
  }

  private navigateToList(): void {
    const slug = this.tenant.currentSlug();
    if (!slug) return;
    void this.router.navigate(['/t', slug, ...PUESTO_LIST_PATH]);
  }
}
