import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="min-h-screen flex items-center justify-center bg-brand-bg">
      <div class="text-center">
        <h1 class="text-3xl font-extrabold text-brand-text">POS RedDoc</h1>
        <p class="text-brand-muted mt-2">Bienvenido al punto de venta.</p>
      </div>
    </div>
  `,
})
export class DashboardComponent {}
