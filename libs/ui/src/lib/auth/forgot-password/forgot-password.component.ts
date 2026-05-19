import { Component, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import {
  APP_BRANDING,
  AUTH_SERVICE,
  I18nService,
  ROUTE_PATHS_TOKEN,
  extractErrorMessage,
} from '@reddoc/core';
import { TurnstileComponent } from '../../turnstile/turnstile.component';
import type { AuthTranslationsHost } from '../i18n';

@Component({
  selector: 'lib-forgot-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    MessageModule,
    TurnstileComponent,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AUTH_SERVICE);
  private readonly router = inject(Router);
  private readonly routes = inject(ROUTE_PATHS_TOKEN);
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

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email } = this.form.getRawValue();

    this.authService.forgotPassword(email!, this.captchaToken()!).subscribe({
      next: () => {
        this.turnstile()?.reset();
        this.submitted.set(true);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.turnstile()?.reset();
        this.captchaToken.set(null);

        if (err.error?.error?.is_verified === false) {
          this.router.navigate([this.routes.auth.resendVerification], {
            queryParams: { email: this.form.getRawValue().email, unverified: true },
          });
          return;
        }

        this.errorMessage.set(
          extractErrorMessage(err, this.t().auth.forgotPassword.errors.generic),
        );
        this.isLoading.set(false);
      },
    });
  }

  get emailControl() {
    return this.form.controls.email;
  }
}
