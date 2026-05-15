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
import { Ciudad, ToastService } from '@reddoc/core';
import { CiudadAutocompleteComponent } from '@reddoc/ui';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import {
  BillingProfile,
  TIPO_IDENTIFICACION_OPTIONS,
  TipoIdentificacion,
  formatIdentificacion,
} from '../../../../models/billing-profile.model';
import { BillingProfilesService } from '../../../../services/billing-profiles.service';

interface BillingProfileForm {
  tipo: FormControl<TipoIdentificacion | null>;
  numero: FormControl<string>;
  nombre: FormControl<string>;
  email: FormControl<string>;
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

  readonly tipoOptions = TIPO_IDENTIFICACION_OPTIONS;
  readonly isSubmitting = signal(false);

  readonly form: FormGroup<BillingProfileForm> = this.fb.group({
    tipo: this.fb.control<TipoIdentificacion | null>(null, { validators: [Validators.required] }),
    numero: this.fb.nonNullable.control('', {
      validators: [Validators.required, Validators.minLength(5)],
    }),
    nombre: this.fb.nonNullable.control('', {
      validators: [Validators.required, Validators.minLength(3)],
    }),
    email: this.fb.nonNullable.control('', {
      validators: [Validators.required, Validators.email],
    }),
    direccion: this.fb.nonNullable.control('', {
      validators: [Validators.required, Validators.minLength(5)],
    }),
    ciudad: this.fb.control<Ciudad | null>(null, { validators: [Validators.required] }),
  });

  readonly tipoSelected = signal<TipoIdentificacion | null>(null);

  constructor() {
    // Sync local signal for template reads of tipo (so `pInputText` can react)
    this.form.controls.tipo.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => this.tipoSelected.set(value));

    // Reset form when dialog closes
    effect(() => {
      if (!this.visible()) {
        this.form.reset({
          tipo: null,
          numero: '',
          nombre: '',
          email: '',
          direccion: '',
          ciudad: null,
        });
      }
    });
  }

  readonly nombreLabel = computed(() =>
    this.tipoSelected() === 'NIT' ? 'Razón social' : 'Nombre completo',
  );

  readonly nombrePlaceholder = computed(() =>
    this.tipoSelected() === 'NIT' ? 'Empresa Ejemplo S.A.S.' : 'María Camila Restrepo',
  );

  setTipo(tipo: TipoIdentificacion): void {
    this.form.controls.tipo.setValue(tipo);
    this.form.controls.tipo.markAsTouched();
    // Re-format current numero against the new tipo
    const current = this.form.controls.numero.value;
    if (current) {
      this.form.controls.numero.setValue(formatIdentificacion(tipo, current));
    }
  }

  onNumeroInput(value: string): void {
    const tipo = this.form.controls.tipo.value;
    const formatted = tipo ? formatIdentificacion(tipo, value) : value;
    this.form.controls.numero.setValue(formatted, { emitEvent: false });
  }

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
        tipo: v.tipo,
        numero: v.numero,
        nombre: v.nombre,
        email: v.email,
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
}
