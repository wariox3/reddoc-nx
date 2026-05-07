import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AUTH_SERVICE, ROUTE_PATHS_TOKEN, extractErrorMessage } from '@reddoc/core';

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
        this.errorMessage.set(
          extractErrorMessage(
            err,
            'No se pudo verificar la cuenta. El enlace puede haber expirado o ser inválido.',
          ),
        );
        this.isLoading.set(false);
      },
    });
  }
}
