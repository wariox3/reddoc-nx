import { Component, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { ENVIRONMENT, I18nService } from '@reddoc/core';
import { UserMenuComponent } from '../../shared/user-menu/user-menu.component';
import type { AppDict } from '../../i18n';

interface NavItem {
  label: string;
  icon: string;
  path?: string;
  externalUrl?: string;
}

@Component({
  selector: 'app-workspace-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NgTemplateOutlet,
    DrawerModule,
    UserMenuComponent,
  ],
  templateUrl: './workspace-layout.component.html',
  styleUrl: './workspace-layout.component.scss',
})
export class WorkspaceLayoutComponent {
  private readonly env = inject(ENVIRONMENT);
  private readonly i18n = inject<I18nService<AppDict>>(I18nService);

  protected readonly t = this.i18n.t;

  readonly navItems = computed<NavItem[]>(() => {
    const labels = this.t().layout.nav;
    return [{ label: labels.dashboard, icon: 'pi pi-th-large', path: '/dashboard' }];
  });

  readonly drawerVisible = signal(false);

  toggleDrawer(): void {
    this.drawerVisible.update((v) => !v);
  }
}
