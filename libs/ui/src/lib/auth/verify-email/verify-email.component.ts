import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AUTH_SERVICE, I18nService, ROUTE_PATHS_TOKEN, extractErrorMessage } from '@reddoc/core';
import type { AuthTranslationsHost } from '../i18n';

@Component({
  selector: 'lib-verify-email',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss',
})
export class VerifyEmailComponent implements OnInit {
  private readonly authService = inject(AUTH_SERVICE);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly routes = inject(ROUTE_PATHS_TOKEN);

  protected readonly t = inject<I18nService<AuthTranslationsHost>>(I18nService).t;

  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly verified = signal(false);

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.router.navigate([this.routes.auth.login]);
      return;
    }

    this.authService.verifyEmail(token).subscribe({
      next: () => {
        this.verified.set(true);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(extractErrorMessage(err, this.t().auth.verifyEmail.errors.generic));
        this.isLoading.set(false);
      },
    });
  }
}
