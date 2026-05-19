import { Component, ViewChild, computed, inject } from '@angular/core';
import { Menu, MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { UserAvatarComponent } from '@reddoc/ui';
import { AuthService } from '../../features/auth/services/auth.service';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [MenuModule, UserAvatarComponent],
  templateUrl: './user-menu.component.html',
  styleUrl: './user-menu.component.scss',
})
export class UserMenuComponent {
  private readonly authService = inject(AuthService);

  @ViewChild('menu') menu!: Menu;

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
