import { Component, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { ENTITY_NAV_GROUP_ORDER, buildNavSections, type NavSection } from './nav-builder';
import {
  ENVIRONMENT,
  I18nService,
  ModuleRegistryService,
  TenantService,
  type EntityKind,
} from '@reddoc/core';
import { UserMenuComponent } from '../../shared/user-menu/user-menu.component';
import type { AppDict } from '../../i18n';

/** Item de navegación de primer nivel no derivado del registry (Dashboard, etc.). */
interface PinnedNavItem {
  readonly label: string;
  readonly icon: string;
  readonly path: string;
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
  private readonly tenant = inject(TenantService);
  private readonly moduleRegistry = inject(ModuleRegistryService);

  protected readonly t = this.i18n.t;

  /** Items fijos del sidebar (independientes del registry de módulos). */
  readonly pinnedItems = computed<readonly PinnedNavItem[]>(() => {
    const labels = this.t().layout.nav;
    const slug = this.tenant.currentSlug();
    if (!slug) return [];
    return [
      {
        label: labels.dashboard,
        icon: 'pi pi-th-large',
        path: `/t/${slug}/dashboard`,
      },
    ];
  });

  /**
   * Acordeones del sidebar derivados del registry de módulos.
   * Se carga una sola vez al inicializar el layout; las configs son inmutables.
   */
  readonly moduleSections = signal<readonly NavSection[]>([]);

  /** Ids de módulos cuyo acordeón está expandido en la UI. */
  private readonly expandedModuleIds = signal<ReadonlySet<string>>(new Set());

  readonly drawerVisible = signal(false);

  /** Orden estable en que se renderizan los grupos de entidades dentro de un módulo. */
  protected readonly groupOrder = ENTITY_NAV_GROUP_ORDER;

  constructor() {
    this.loadSidebarSections();
  }

  protected isExpanded(moduleId: string): boolean {
    return this.expandedModuleIds().has(moduleId);
  }

  protected toggleModule(moduleId: string): void {
    this.expandedModuleIds.update((current) => {
      const next = new Set(current);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  }

  protected toggleDrawer(): void {
    this.drawerVisible.update((v) => !v);
  }

  protected groupLabel(kind: EntityKind): string {
    return this.t().layout.nav.sections[kind];
  }

  /**
   * Resuelve una clave i18n con notación de punto contra el diccionario activo.
   * Las configs almacenan claves como strings (ej. `'modules.general.name'`)
   * porque el dict tiene shape dinámico por módulo.
   *
   * Si la clave no existe se devuelve la clave misma — facilita detectar
   * traducciones faltantes en desarrollo.
   */
  protected translate(key: string): string {
    const parts = key.split('.');
    let current: unknown = this.t();
    for (const part of parts) {
      if (current === null || typeof current !== 'object') return key;
      current = (current as Record<string, unknown>)[part];
    }
    return typeof current === 'string' ? current : key;
  }

  private async loadSidebarSections(): Promise<void> {
    const slug = this.tenant.currentSlug();
    if (!slug) return;
    const modules = await this.moduleRegistry.loadAll();
    const sections = buildNavSections(modules, slug);
    this.moduleSections.set(sections);
    // Por defecto: todos los acordeones expandidos al primer load.
    this.expandedModuleIds.set(new Set(sections.map((s) => s.moduleId)));
  }
}
