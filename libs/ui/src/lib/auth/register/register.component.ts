import { Component, inject, signal, viewChild } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { APP_BRANDING, AUTH_SERVICE, I18nService, extractErrorMessage } from '@reddoc/core';
import { TurnstileComponent } from '../../turnstile/turnstile.component';
import type { AuthTranslationsHost } from '../i18n';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return password && confirmPassword && password !== confirmPassword
    ? { passwordMismatch: true }
    : null;
}

@Component({
  selector: 'lib-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    MessageModule,
    CheckboxModule,
    DialogModule,
    TurnstileComponent,
  ],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AUTH_SERVICE);
  private readonly turnstile = viewChild(TurnstileComponent);

  protected readonly branding = inject(APP_BRANDING, { optional: true }) ?? {
    appName: 'Plataforma',
    tagline: 'Gestiona tu empresa desde un solo lugar.',
  };
  protected readonly t = inject<I18nService<AuthTranslationsHost>>(I18nService).t;

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly submitted = signal(false);
  readonly captchaToken = signal<string | null>(null);
  readonly termsAccepted = signal(false);
  readonly termsDialogVisible = signal(false);

  readonly form = this.fb.group(
    {
      nombre_corto: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator },
  );

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { nombre_corto, email, password } = this.form.getRawValue();

    this.authService
      .register({
        nombre_corto: nombre_corto!,
        email: email!,
        password: password!,
        turnstile_token: this.captchaToken()!,
      })
      .subscribe({
        next: () => {
          this.turnstile()?.reset();
          this.submitted.set(true);
          this.isLoading.set(false);
        },
        error: (err) => {
          this.turnstile()?.reset();
          this.captchaToken.set(null);
          this.errorMessage.set(extractErrorMessage(err, this.t().auth.register.errors.generic));
          this.isLoading.set(false);
        },
      });
  }

  get nombreCortoControl() {
    return this.form.controls.nombre_corto;
  }
  get emailControl() {
    return this.form.controls.email;
  }
  get passwordControl() {
    return this.form.controls.password;
  }
  get confirmPasswordControl() {
    return this.form.controls.confirmPassword;
  }
}
