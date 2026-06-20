import { Component, inject, OnDestroy, OnInit, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { APP_BRANDING, AUTH_SERVICE, I18nService, extractErrorMessage } from '@reddoc/core';
import { TurnstileComponent } from '../../turnstile/turnstile.component';
import { AuthSuccessStateComponent } from '../auth-success-state/auth-success-state.component';
import type { AuthTranslationsHost } from '../i18n';

@Component({
  selector: 'lib-resend-verification',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    MessageModule,
    TurnstileComponent,
    AuthSuccessStateComponent,
  ],
  templateUrl: './resend-verification.component.html',
  styleUrl: './resend-verification.component.scss',
})
export class ResendVerificationComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AUTH_SERVICE);
  private readonly route = inject(ActivatedRoute);
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
  readonly cooldown = signal(0);
  readonly isUnverified = signal(false);

  private cooldownInterval: ReturnType<typeof setInterval> | null = null;

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const email = params.get('email');
    if (email) {
      this.form.patchValue({ email });
    }
    if (params.get('unverified') === 'true') {
      this.isUnverified.set(true);
    }
  }

  ngOnDestroy(): void {
    if (this.cooldownInterval) {
      clearInterval(this.cooldownInterval);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email } = this.form.getRawValue();

    this.authService
      .resendVerification({ email: email!, turnstile_token: this.captchaToken()! })
      .subscribe({
        next: () => {
          this.turnstile()?.reset();
          this.captchaToken.set(null);
          this.submitted.set(true);
          this.isLoading.set(false);
          this.startCooldown();
        },
        error: (err) => {
          this.turnstile()?.reset();
          this.captchaToken.set(null);
          this.errorMessage.set(
            extractErrorMessage(err, this.t().auth.resendVerification.errors.generic),
          );
          this.isLoading.set(false);
        },
      });
  }

  resendAgain(): void {
    this.submitted.set(false);
  }

  private startCooldown(): void {
    this.cooldown.set(60);
    this.cooldownInterval = setInterval(() => {
      const current = this.cooldown();
      if (current <= 1) {
        this.cooldown.set(0);
        if (this.cooldownInterval) {
          clearInterval(this.cooldownInterval);
          this.cooldownInterval = null;
        }
      } else {
        this.cooldown.set(current - 1);
      }
    }, 1000);
  }

  get emailControl() {
    return this.form.controls.email;
  }
}
