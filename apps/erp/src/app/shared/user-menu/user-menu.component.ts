import { Component, ViewChild, computed, effect, inject } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { Menu, MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { ENVIRONMENT, I18nService, TenantService } from '@reddoc/core';
import { LanguageToggleComponent } from '@reddoc/ui';
import { AuthService } from '../../features/auth/services/auth.service';
import type { AppDict } from '../../i18n';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [AvatarModule, MenuModule, LanguageToggleComponent],
  templateUrl: './user-menu.component.html',
  styleUrl: './user-menu.component.scss',
})
export class UserMenuComponent {
  private readonly authService = inject(AuthService);
  private readonly env = inject(ENVIRONMENT);
  private readonly tenant = inject(TenantService);
  private readonly i18n = inject<I18nService<AppDict>>(I18nService);

  protected readonly t = this.i18n.t;

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

  items: MenuItem[] = [];

  constructor() {
    effect(() => {
      const labels = this.t().layout.userMenu;
      this.items = [
        {
          label: labels.manageAccount,
          icon: 'pi pi-user',
          url: this.env.cuentaUrl,
          target: '_blank',
        },
        {
          label: labels.logout,
          icon: 'pi pi-sign-out',
          command: () => {
            this.tenant.clear();
            this.authService.logout();
          },
        },
      ];
    });
  }

  toggle(event: Event): void {
    this.menu.toggle(event);
  }
}
