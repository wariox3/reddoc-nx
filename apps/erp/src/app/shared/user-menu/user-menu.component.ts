import { Component, ViewChild, computed, inject } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { Menu, MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
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

  @ViewChild('menu') menu!: Menu;

  readonly initials = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return '?';
    if (user.name && user.apellidos) {
      return (user.name[0] + user.apellidos[0]).toUpperCase();
    }
    if (user.name) return user.name[0].toUpperCase();
    return user.email.charAt(0).toUpperCase();
  });

  readonly displayName = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return '';
    if (user.name && user.apellidos) return `${user.name} ${user.apellidos}`;
    return user.name || user.email;
  });

  readonly email = computed(() => this.authService.currentUser()?.email ?? '');

  readonly items: MenuItem[] = [
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
