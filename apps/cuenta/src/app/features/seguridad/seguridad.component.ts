import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { DividerModule } from 'primeng/divider';
import { MessageService } from 'primeng/api';
import { extractErrorMessage } from '@reddoc/core';
import { SeguridadService } from './services/seguridad.service';

function passwordsMatchValidator(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const nueva = group.get('passwordNueva');
    const confirmar = group.get('passwordConfirmar');
    if (!nueva || !confirmar) return null;

    if (nueva.value && confirmar.value && nueva.value !== confirmar.value) {
      confirmar.setErrors({ ...confirmar.errors, notMatching: true });
      return { notMatching: true };
    }

    if (confirmar.errors?.['notMatching']) {
      const { notMatching: _, ...rest } = confirmar.errors;
      confirmar.setErrors(Object.keys(rest).length ? rest : null);
    }

    return null;
  };
}

@Component({
  selector: 'app-seguridad',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, PasswordModule, MessageModule, DividerModule],
  templateUrl: './seguridad.component.html',
  styleUrl: './seguridad.component.scss',
})
export class SeguridadComponent {
  private readonly fb = inject(FormBuilder);
  private readonly seguridadService = inject(SeguridadService);
  private readonly messageService = inject(MessageService);

  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.group(
    {
      passwordNueva: ['', [Validators.required, Validators.minLength(8)]],
      passwordConfirmar: ['', [Validators.required]],
    },
    { validators: [passwordsMatchValidator()] },
  );

  get nuevaControl() {
    return this.form.controls.passwordNueva;
  }
  get confirmarControl() {
    return this.form.controls.passwordConfirmar;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    this.seguridadService.cambiarClave(this.form.getRawValue().passwordNueva!).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.form.reset();
        this.messageService.add({
          severity: 'success',
          summary: 'Contraseña actualizada',
          detail: 'Tu contraseña ha sido cambiada correctamente.',
          life: 3000,
        });
      },
      error: (err) => {
        this.errorMessage.set(extractErrorMessage(err, 'No se pudo cambiar la contraseña.'));
        this.isSaving.set(false);
      },
    });
  }
}
