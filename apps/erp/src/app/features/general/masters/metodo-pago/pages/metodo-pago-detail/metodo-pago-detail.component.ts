import { Component, DestroyRef, type OnInit, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { I18nService, TenantService, ToastService } from '@reddoc/core';
import { BreadcrumbComponent, type BreadcrumbItem } from '@reddoc/feature-base';
import { ActiveModuleStore, currentModuleId, resolveModuleName } from '@erp/core/erp-modules';
import type { AppDict } from '@erp/i18n';
import { MetodoPagoService } from '../../metodo-pago.service';
import { METODO_PAGO_LIST_PATH } from '../../metodo-pago.constants';
import type { MetodoPago } from '../../metodo-pago.model';

@Component({
  selector: 'app-metodo-pago-detail',
  standalone: true,
  imports: [ButtonModule, BreadcrumbComponent],
  templateUrl: './metodo-pago-detail.component.html',
  styleUrl: './metodo-pago-detail.component.scss',
})
export class MetodoPagoDetailComponent implements OnInit {
  private readonly service = inject(MetodoPagoService);
  private readonly tenant = inject(TenantService);
  private readonly activeModule = inject(ActiveModuleStore);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly i18n = inject<I18nService<AppDict>>(I18nService);

  protected readonly t = this.i18n.t;

  readonly id = input<string>();

  protected readonly metodoPago = signal<MetodoPago | null>(null);
  protected readonly isLoading = signal(true);
  protected readonly notFound = signal(false);

  /** Migas: módulo activo → listado de métodos de pago → nombre abierto. */
  protected readonly breadcrumbItems = computed<readonly BreadcrumbItem[]>(() => {
    const slug = this.tenant.currentSlug();
    const metodoPago = this.metodoPago();
    const moduleId = currentModuleId(this.activeModule);
    const items: BreadcrumbItem[] = [
      {
        label: resolveModuleName(this.activeModule, this.t()),
        routerLink: slug ? ['/t', slug, moduleId] : undefined,
      },
      {
        label: this.t().entities.metodoPago.name,
        routerLink: slug ? ['/t', slug, moduleId, ...METODO_PAGO_LIST_PATH] : undefined,
      },
    ];
    if (metodoPago) items.push({ label: metodoPago.nombre });
    return items;
  });

  ngOnInit(): void {
    const rawId = this.id();
    const id = rawId != null ? Number(rawId) : NaN;
    if (!Number.isFinite(id)) {
      this.isLoading.set(false);
      this.notFound.set(true);
      return;
    }
    this.loadMetodoPago(id);
  }

  protected onBack(): void {
    this.navigate(...METODO_PAGO_LIST_PATH);
  }

  protected onEdit(): void {
    const m = this.metodoPago();
    if (!m) return;
    this.navigate(...METODO_PAGO_LIST_PATH, 'editar', m.id);
  }

  private loadMetodoPago(id: number): void {
    this.service
      .getById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (m) => {
          this.metodoPago.set(m);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.notFound.set(true);
          const toasts = this.t().entities.metodoPago.detail.toasts;
          this.toast.error(toasts.loadError.title, toasts.loadError.desc);
        },
      });
  }

  private navigate(...subPath: (string | number)[]): void {
    const slug = this.tenant.currentSlug();
    if (!slug) return;
    void this.router.navigate(['/t', slug, currentModuleId(this.activeModule), ...subPath]);
  }
}
