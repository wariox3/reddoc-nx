import { Component, DestroyRef, type OnInit, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import {
  I18nService,
  TenantService,
  ToastService,
  calcularResumen,
  type ResumenDocumento,
} from '@reddoc/core';
import { BreadcrumbComponent, type BreadcrumbItem } from '@reddoc/feature-base';
import { ventaDocumentoBreadcrumb } from '@erp/features/venta/shared/venta-breadcrumb';
import { DocumentoDetalleService, ENTITY_DATA_GATEWAY } from '@erp/core/module-config';
import type { DocumentEntityConfig } from '@erp/core/module-config';
import type { AppDict } from '@erp/i18n';
import { ComercialDocumentoLineasTableComponent } from '@erp/features/documentos/comercial/components/comercial-documento-lineas-table/comercial-documento-lineas-table.component';
import { ComercialDocumentoResumenComponent } from '@erp/features/documentos/comercial/components/comercial-documento-resumen/comercial-documento-resumen.component';
import {
  comercialDetalleToFormValue,
  toLineaCalculo,
} from '@erp/features/documentos/comercial/comercial-documento-detalle.mapper';
import type { ComercialDetalleRead } from '@erp/features/documentos/comercial/comercial-documento-detalle.model';
import type { ComercialDetalleFormRawValue } from '@erp/features/documentos/comercial/comercial-documento-detalle.types';
import { facturaVentaToFormValue } from '../../factura-venta.mapper';
import type { FacturaVentaRead } from '../../factura-venta.model';

/** Cabecera legible de la factura para la ficha (solo lo que trae `getById`). */
interface CabeceraView {
  readonly cliente: string | null;
  readonly fecha: Date | null;
  readonly fechaVence: Date | null;
  readonly plazoPago: string | null;
  readonly sede: string | null;
  readonly metodoPago: string | null;
}

/**
 * Ficha (detalle) de una **Factura de venta** (familia comercial) — solo lectura.
 *
 * Camino A del enfoque híbrido: la cabecera comercial es específica de cada
 * documento (de ahí que viva en `factura-venta/` y no en un `_shared`), pero la
 * tabla de líneas y el resumen los aporta la familia comercial. Carga cabecera
 * (`ENTITY_DATA_GATEWAY.getById`) y líneas (`DocumentoDetalleService`) en paralelo
 * —igual que el form— y las muestra sin formularios. Desde aquí se vuelve a la
 * lista o se salta a editar.
 */
@Component({
  selector: 'app-factura-venta-detail',
  standalone: true,
  imports: [
    ButtonModule,
    BreadcrumbComponent,
    ComercialDocumentoLineasTableComponent,
    ComercialDocumentoResumenComponent,
  ],
  templateUrl: './factura-venta-detail.component.html',
  styleUrl: './factura-venta-detail.component.scss',
})
export class FacturaVentaDetailComponent implements OnInit {
  private readonly gateway = inject(ENTITY_DATA_GATEWAY);
  private readonly detalleService = inject(DocumentoDetalleService);
  private readonly tenant = inject(TenantService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly i18n = inject<I18nService<AppDict>>(I18nService);

  protected readonly t = this.i18n.t;

  /** Documento activo inyectado por `activeDocumentResolver` vía router binding. */
  readonly document = input.required<DocumentEntityConfig>();

  /** Id del documento (route param `:id`, vía `withComponentInputBinding`). */
  readonly id = input<string>();

  protected readonly cabecera = signal<CabeceraView | null>(null);
  /** Líneas del documento, ya mapeadas a la forma del front para alimentar la tabla. */
  protected readonly lines = signal<readonly ComercialDetalleFormRawValue[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly notFound = signal(false);

  /** Resumen financiero del documento: subtotal, descuento, impuestos y total. */
  protected readonly resumen = computed<ResumenDocumento>(() =>
    calcularResumen(this.lines().map(toLineaCalculo)),
  );

  /** Migas: módulo Venta → listado del documento → identificador del documento abierto. */
  protected readonly breadcrumbItems = computed<readonly BreadcrumbItem[]>(() =>
    ventaDocumentoBreadcrumb(
      this.t(),
      this.tenant.currentSlug(),
      this.translateKey(this.document().displayNameKey),
      this.document().id,
      `#${this.id() ?? ''}`,
    ),
  );

  ngOnInit(): void {
    const rawId = this.id();
    const id = rawId != null ? Number(rawId) : NaN;
    if (!Number.isFinite(id)) {
      this.isLoading.set(false);
      this.notFound.set(true);
      return;
    }
    this.loadDocumento(id);
  }

  protected onBack(): void {
    this.navigate(this.document().routes.list);
  }

  protected onEdit(): void {
    const id = this.id();
    if (!id) return;
    this.navigate(this.document().routes.edit, id);
  }

  private loadDocumento(id: number): void {
    // Mismo patrón que el form: cabecera y líneas son independientes → en paralelo.
    // Los nombres de los FK (plazo de pago, método de pago, sede) llegan en los
    // `*_nombre` del read; no hace falta resolverlos con peticiones extra.
    forkJoin({
      cabecera: this.gateway.getById(this.document(), id),
      lineas: this.detalleService.listarPorDocumento<ComercialDetalleRead>(id),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ cabecera, lineas }) => {
          const read = cabecera as FacturaVentaRead;
          const fv = facturaVentaToFormValue(read);
          this.cabecera.set({
            cliente: fv.contacto?.nombre ?? read.contacto_nombre ?? null,
            fecha: fv.fecha ?? null,
            fechaVence: fv.fecha_vence ?? null,
            plazoPago: read.plazo_pago_nombre ?? null,
            sede: read.sede_nombre ?? null,
            metodoPago: read.metodo_pago_nombre ?? null,
          });
          this.lines.set(lineas.map((line) => comercialDetalleToFormValue(line)));
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.notFound.set(true);
          const toasts = this.t().entities.facturaVenta.form.toasts;
          this.toast.error(toasts.loadError.title, toasts.loadError.desc);
        },
      });
  }

  /** Fecha larga de la cabecera (`20 de junio de 2026`). */
  protected formatFecha(date: Date | null): string {
    if (!date) return '—';
    return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  /** Navega dentro del tenant activo: `/t/<slug>/venta/<...routePath>[/extra]`. */
  private navigate(routePath: string, extra?: string): void {
    const slug = this.tenant.currentSlug();
    if (!slug) return;
    const segments = routePath.split('/').filter(Boolean);
    const commands: (string | number)[] = ['/t', slug, 'venta', ...segments];
    if (extra) commands.push(extra);
    void this.router.navigate(commands);
  }

  /** Resuelve una clave i18n con notación de punto (p. ej. `displayNameKey`). */
  private translateKey(key: string): string {
    let current: unknown = this.t();
    for (const part of key.split('.')) {
      if (current === null || typeof current !== 'object') return key;
      current = (current as Record<string, unknown>)[part];
    }
    return typeof current === 'string' ? current : key;
  }
}
