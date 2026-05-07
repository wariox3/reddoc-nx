import { Routes } from '@angular/router';
import { publicGuard } from '@reddoc/core';
import { LoginComponent } from '@reddoc/ui';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    canActivate: [publicGuard],
    component: LoginComponent,
  },
  {
    path: 'forgot-password',
    canActivate: [publicGuard],
    loadComponent: () =>
      import('./pages/forgot-password/forgot-password.component').then(
        (m) => m.ForgotPasswordComponent,
      ),
  },
  {
    path: 'restablecer-clave',
    canActivate: [publicGuard],
    loadComponent: () =>
      import('./pages/reset-password/reset-password.component').then(
        (m) => m.ResetPasswordComponent,
      ),
  },
  {
    path: 'register',
    canActivate: [publicGuard],
    loadComponent: () =>
      import('./pages/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'verify-email',
    canActivate: [publicGuard],
    loadComponent: () =>
      import('./pages/verify-email/verify-email.component').then((m) => m.VerifyEmailComponent),
  },
  {
    path: 'resend-verification',
    canActivate: [publicGuard],
    loadComponent: () =>
      import('./pages/resend-verification/resend-verification.component').then(
        (m) => m.ResendVerificationComponent,
      ),
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
