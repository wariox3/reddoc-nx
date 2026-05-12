import { Component, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DrawerModule } from 'primeng/drawer';
import { I18nService, TenantService } from '@reddoc/core';
import { UserMenuComponent } from '../../shared/user-menu/user-menu.component';
import { SIDEBAR_MENU } from '../sidebar/sidebar-menu';
import type {
  SidebarLeafItem,
  SidebarModuleAccordion,
  SidebarSection,
  SidebarSimpleItem,
} from '../sidebar/sidebar-menu.types';
import type { AppDict } from '../../i18n';

/**
 * Layout principal del workspace de un tenant.
 *
 * Sidebar híbrido:
 *  - Items declarativos desde `SIDEBAR_MENU` (camino B — masters y enlaces fijos).
 *  - (Futuro) acordeones derivados del `MODULE_REGISTRY` para módulos con
 *    documentos del framework configuracional.
 *
 * Las dos fuentes se traducen al tipo `SidebarSection` antes de renderizar,
 * así el template no se preocupa por el origen.
 */
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
  private readonly i18n = inject<I18nService<AppDict>>(I18nService);
  private readonly tenant = inject(TenantService);

  protected readonly t = this.i18n.t;

  /** Secciones del sidebar. Por ahora solo declarativas. */
  protected readonly sections = computed<readonly SidebarSection[]>(() => SIDEBAR_MENU);

  /** Slug del tenant activo; necesario para resolver paths absolutos. */
  protected readonly tenantSlug = this.tenant.currentSlug;

  /** Ids de módulos cuyo acordeón está expandido. */
  private readonly expandedModuleIds = signal<ReadonlySet<string>>(
    new Set(
      SIDEBAR_MENU.filter((s): s is SidebarModuleAccordion => s.kind === 'module').map(
        (s) => s.moduleId,
      ),
    ),
  );

  protected readonly drawerVisible = signal(false);

  // ── API protegida (template) ──────────────────────────────────────────────

  protected isItem(section: SidebarSection): section is SidebarSimpleItem {
    return section.kind === 'item';
  }

  protected asModule(section: SidebarSection): SidebarModuleAccordion {
    return section as SidebarModuleAccordion;
  }

  protected isExpanded(moduleId: string): boolean {
    return this.expandedModuleIds().has(moduleId);
  }

  protected toggleModule(moduleId: string): void {
    this.expandedModuleIds.update((current) => {
      const next = new Set(current);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  }

  protected toggleDrawer(): void {
    this.drawerVisible.update((v) => !v);
  }

  /** Path absoluto para un item simple del sidebar. */
  protected itemPath(item: SidebarSimpleItem): string {
    const slug = this.tenantSlug();
    return slug ? `/t/${slug}/${item.path}` : `/${item.path}`;
  }

  /** Path absoluto para un item dentro de un acordeón de módulo. */
  protected leafPath(moduleId: string, leaf: SidebarLeafItem): string {
    const slug = this.tenantSlug();
    return slug ? `/t/${slug}/${moduleId}/${leaf.path}` : `/${moduleId}/${leaf.path}`;
  }

  /**
   * Resuelve una clave i18n con notación de punto contra el diccionario activo.
   * Devuelve la clave misma si no existe — útil para detectar faltantes en dev.
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
}
