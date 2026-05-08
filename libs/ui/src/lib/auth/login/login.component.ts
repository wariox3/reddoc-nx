import { Component, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
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
  selector: 'lib-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    MessageModule,
    TurnstileComponent,
  ],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AUTH_SERVICE);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly routes = inject(ROUTE_PATHS_TOKEN);
  private readonly turnstile = viewChild(TurnstileComponent);

  protected readonly branding = inject(APP_BRANDING, { optional: true }) ?? {
    appName: 'Plataforma',
    tagline: 'Gestiona tu empresa desde un solo lugar.',
  };
  protected readonly t = inject<I18nService<AuthTranslationsHost>>(I18nService).t;

  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly captchaToken = signal<string | null>(null);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.form.getRawValue();

    this.authService
      .login({
        email: email!,
        password: password!,
        turnstile_token: this.captchaToken()!,
      })
      .subscribe({
        next: () => {
          this.turnstile()?.reset();
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
          const safeUrl =
            returnUrl?.startsWith('/') && !returnUrl.startsWith('//')
              ? returnUrl
              : this.routes.dashboard.root;
          this.router.navigateByUrl(safeUrl);
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
            extractErrorMessage(err, this.t().auth.login.errors.invalidCredentials),
          );
          this.isLoading.set(false);
        },
      });
  }

  get emailControl() {
    return this.form.controls.email;
  }
  get passwordControl() {
    return this.form.controls.password;
  }
}
