import { Component, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { ENVIRONMENT } from '@reddoc/core';
import { UserMenuComponent } from '../../shared/user-menu/user-menu.component';

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

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'pi pi-th-large', path: '/dashboard' },
    { label: 'Gestionar cuenta', icon: 'pi pi-user', externalUrl: this.env.cuentaUrl },
  ];

  readonly drawerVisible = signal(false);

  toggleDrawer(): void {
    this.drawerVisible.update((v) => !v);
  }
}
