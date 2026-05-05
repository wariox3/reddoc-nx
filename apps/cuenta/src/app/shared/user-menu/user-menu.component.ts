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
    const name = user.nombre_corto?.trim();
    return name ? name[0].toUpperCase() : user.email.charAt(0).toUpperCase();
  });

  readonly avatarImage = computed(() => this.authService.currentUser()?.imagen_thumbnail ?? null);

  readonly displayName = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return '';
    return user.nombre_corto?.trim() || user.email;
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
