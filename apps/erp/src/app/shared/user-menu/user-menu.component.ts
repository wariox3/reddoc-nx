import { Component, ViewChild, computed, inject } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { Menu, MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { ENVIRONMENT } from '@reddoc/core';
import { AuthService } from '../../features/auth/services/auth.service';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [AvatarModule, MenuModule],
  templateUrl: './user-menu.component.html',
  styleUrl: './user-menu.component.scss',
})
export class UserMenuComponent {
  private readonly authService = inject(AuthService);
  private readonly env = inject(ENVIRONMENT);

  @ViewChild('menu') menu!: Menu;

  readonly initials = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return '?';
    const parts = user.nombre_corto?.trim().split(/\s+/) ?? [];
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return user.email.charAt(0).toUpperCase();
  });

  readonly displayName = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return '';
    return user.nombre_corto || user.email;
  });

  readonly email = computed(() => this.authService.currentUser()?.email ?? '');

  readonly items: MenuItem[] = [
    {
      label: 'Gestionar cuenta',
      icon: 'pi pi-user',
      url: this.env.cuentaUrl,
      target: '_blank',
    },
    {
      label: 'Cerrar sesión',
      icon: 'pi pi-sign-out',
      command: () => this.authService.logout(),
    },
  ];

  toggle(event: Event): void {
    this.menu.toggle(event);
  }
}
