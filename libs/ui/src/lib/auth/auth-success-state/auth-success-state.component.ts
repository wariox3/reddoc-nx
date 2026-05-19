import { Component, input } from '@angular/core';

@Component({
  selector: 'lib-auth-success-state',
  standalone: true,
  templateUrl: './auth-success-state.component.html',
})
export class AuthSuccessStateComponent {
  icon = input.required<string>();
  title = input.required<string>();
  description = input.required<string>();
  variant = input<'success' | 'error'>('success');
}
