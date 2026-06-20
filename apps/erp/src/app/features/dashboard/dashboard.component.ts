import { Component, inject } from '@angular/core';
import { AuthService } from '../auth/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  template: `
    <h1>Dashboard</h1>
    <p>Bienvenido, {{ authService.currentUser()?.email }}</p>
  `,
})
export class DashboardComponent {
  readonly authService = inject(AuthService);
}
