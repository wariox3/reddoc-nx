import { Component, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { UserMenuComponent } from '../../shared/user-menu/user-menu.component';

interface NavItem {
  label: string;
  icon: string;
  path: string;
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
  readonly navItems: NavItem[] = [
    { label: 'Perfil', icon: 'pi pi-user', path: '/perfil' },
    { label: 'Seguridad', icon: 'pi pi-shield', path: '/seguridad' },
  ];

  readonly drawerVisible = signal(false);

  toggleDrawer(): void {
    this.drawerVisible.update((v) => !v);
  }
}
