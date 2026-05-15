import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Ciudad, Identificacion, ToastService } from '@reddoc/core';
import { CiudadAutocompleteComponent, IdentificacionSelectComponent } from '@reddoc/ui';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { BillingProfile } from '../../../../models/billing-profile.model';
import { BillingProfilesService } from '../../../../services/billing-profiles.service';

interface BillingProfileForm {
  identificacion: FormControl<Identificacion | null>;
  numero: FormControl<string>;
  nombre: FormControl<string>;
  email: FormControl<string>;
  telefono: FormControl<string>;
  direccion: FormControl<string>;
  ciudad: FormControl<Ciudad | null>;
}

@Component({
  selector: 'app-billing-profile-create-dialog',
  standalone: true,
  imports: [
    DialogModule,
    InputTextModule,
    ButtonModule,
    ReactiveFormsModule,
    CiudadAutocompleteComponent,
    IdentificacionSelectComponent,
  ],
  templateUrl: './billing-profile-create-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingProfileCreateDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly billingService = inject(BillingProfilesService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly visible = input<boolean>(false);
  readonly visibleChange = output<boolean>();
  readonly created = output<BillingProfile>();

  readonly isSubmitting = signal(false);

  readonly form: FormGroup<BillingProfileForm> = this.fb.group({
    identificacion: this.fb.control<Identificacion | null>(null, {
      validators: [Validators.required],
    }),
    numero: this.fb.nonNullable.control('', {
      validators: [Validators.required, Validators.minLength(5)],
    }),
    nombre: this.fb.nonNullable.control('', {
      validators: [Validators.required, Validators.minLength(3)],
    }),
    email: this.fb.nonNullable.control('', {
      validators: [Validators.required, Validators.email],
    }),
    telefono: this.fb.nonNullable.control('', {
      validators: [Validators.required, Validators.pattern(/^[0-9]{7,15}$/)],
    }),
    direccion: this.fb.nonNullable.control('', {
      validators: [Validators.required, Validators.minLength(5)],
    }),
    ciudad: this.fb.control<Ciudad | null>(null, { validators: [Validators.required] }),
  });

  readonly identificacionSelected = signal<Identificacion | null>(null);

  constructor() {
    this.form.controls.identificacion.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => this.identificacionSelected.set(value));

    effect(() => {
      if (!this.visible()) {
        this.form.reset({
          identificacion: null,
          numero: '',
          nombre: '',
          email: '',
          telefono: '',
          direccion: '',
          ciudad: null,
        });
      }
    });
  }

  // El nombre del tipo (ej. "NIT", "Cédula de ciudadanía") determina la etiqueta.
  readonly nombreLabel = computed(() =>
    this.isNit(this.identificacionSelected()) ? 'Razón social' : 'Nombre completo',
  );

  readonly nombrePlaceholder = computed(() =>
    this.isNit(this.identificacionSelected()) ? 'Empresa Ejemplo S.A.S.' : 'María Camila Restrepo',
  );

  onCancel(): void {
    if (this.isSubmitting()) return;
    this.visibleChange.emit(false);
  }

  submit(): void {
    if (this.form.invalid || this.isSubmitting()) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSubmitting.set(true);

    const v = this.form.getRawValue();
    this.billingService
      .create({
        identificacion: v.identificacion,
        numero: v.numero,
        nombre: v.nombre,
        email: v.email,
        telefono: v.telefono,
        direccion: v.direccion,
        ciudad: v.ciudad,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (profile) => {
          this.isSubmitting.set(false);
          this.toast.success('Perfil creado', `${profile.nombre} se guardó correctamente.`);
          this.created.emit(profile);
          this.visibleChange.emit(false);
        },
        error: (err) => {
          console.error('[billing] create error:', err);
          this.isSubmitting.set(false);
          this.toast.error('Error', 'No se pudo crear el perfil de facturación.');
        },
      });
  }

  private isNit(ident: Identificacion | null): boolean {
    return !!ident && /nit/i.test(ident.nombre);
  }
}
