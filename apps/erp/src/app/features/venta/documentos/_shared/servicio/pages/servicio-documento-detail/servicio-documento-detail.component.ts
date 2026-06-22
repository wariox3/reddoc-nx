import { Component, DestroyRef, type OnInit, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import {
  I18nService,
  TenantService,
  ToastService,
  calcularResumen,
  formatCop,
  toFiniteNumber,
  type ResumenDocumento,
} from '@reddoc/core';
import { BreadcrumbComponent, type BreadcrumbItem } from '@reddoc/feature-base';
import { ventaDocumentoBreadcrumb } from '@erp/features/venta/shared/venta-breadcrumb';
import { DocumentoDetalleService, ENTITY_DATA_GATEWAY } from '@erp/core/module-config';
import type { DocumentEntityConfig } from '@erp/core/module-config';
import type { AppDict } from '@erp/i18n';
import { servicioDocumentoToFormValue, detalleToFormValue } from '../../servicio-documento.mapper';
import { toLineaCalculo } from '../../servicio-documento-detalle.utils';
import type {
  ServicioDocumentoRead,
  ServicioDocumentoDetalleRead,
} from '../../servicio-documento.model';
import type { DetalleFormRawValue } from '../../servicio-documento-detalle.types';
import { ServicioDocumentoResumenComponent } from '../../components/servicio-documento-resumen/servicio-documento-resumen.component';
import { ServicioDocumentoLineasTableComponent } from '../../components/servicio-documento-lineas-table/servicio-documento-lineas-table.component';
import { DocumentDetailActionsComponent } from '@erp/core/module-config/components/document-detail-actions/document-detail-actions.component';

/** Cabecera legible del documento para la ficha (solo lo que trae `getById`). */
interface CabeceraView {
  readonly contacto: string | null;
  readonly fecha: Date | null;
  readonly sector: string | null;
  readonly estrato: number | null;
  readonly salario: number | null;
}

/**
 * Ficha (detalle) de un **documento de servicio** (vigilancia) — solo lectura.
 *
 * Camino A del enfoque híbrido: la comparte toda la familia servicio (contrato
 * servicio, pedido servicio…) igual que el form. Recibe el `DocumentEntityConfig`
 * por input binding (resuelto por `activeDocumentResolver` en la ruta padre) y el
 * `:id` del documento; carga cabecera (`ENTITY_DATA_GATEWAY.getById`) y líneas
 * (`DocumentoDetalleService.listarPorDocumento`) en paralelo, como el form, pero
 * las muestra sin formularios: cabecera, tabla de líneas agrupadas por puesto y
 * el resumen financiero. Desde aquí se vuelve a la lista o se salta a editar.
 */
@Component({
  selector: 'app-servicio-documento-detail',
  standalone: true,
  imports: [
    ButtonModule,
    ConfirmDialogModule,
    BreadcrumbComponent,
    ServicioDocumentoResumenComponent,
    ServicioDocumentoLineasTableComponent,
    DocumentDetailActionsComponent,
  ],
  providers: [ConfirmationService],
  templateUrl: './servicio-documento-detail.component.html',
  styleUrl: './servicio-documento-detail.component.scss',
})
export class ServicioDocumentoDetailComponent implements OnInit {
  private readonly gateway = inject(ENTITY_DATA_GATEWAY);
  private readonly detalleService = inject(DocumentoDetalleService);
  private readonly tenant = inject(TenantService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly confirmation = inject(ConfirmationService);
  private readonly i18n = inject<I18nService<AppDict>>(I18nService);

  protected readonly t = this.i18n.t;

  /** Documento activo inyectado por `activeDocumentResolver` vía router binding. */
  readonly document = input.required<DocumentEntityConfig>();

  /** Id del documento (route param `:id`, vía `withComponentInputBinding`). */
  readonly id = input<string>();

  protected readonly cabecera = signal<CabeceraView | null>(null);
  /** Líneas del documento, ya mapeadas a la forma del front para alimentar la tabla. */
  protected readonly lines = signal<readonly DetalleFormRawValue[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly notFound = signal(false);

  /** Resumen financiero del documento: subtotal, desglose por impuesto y total. */
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

  /** Aprueba el documento previa confirmación; al éxito recarga la ficha. */
  protected onAprobar(): void {
    const id = this.id();
    if (!id) return;
    const a = this.t().documentActions.detail;
    this.confirmation.confirm({
      message: a.confirmAprobar.message,
      header: a.confirmAprobar.header,
      icon: 'pi pi-check-circle',
      acceptLabel: a.aprobar,
      rejectLabel: this.t().common.actions.cancel,
      accept: () => this.aprobarDocumento(Number(id)),
    });
  }

  private aprobarDocumento(id: number): void {
    this.gateway
      .aprobar(this.document(), id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          const ts = this.t().documentActions.detail.toasts.aprobarSuccess;
          this.toast.success(ts.title, ts.desc);
          this.loadDocumento(id);
        },
        error: () => {
          const ts = this.t().documentActions.detail.toasts.aprobarError;
          this.toast.error(ts.title, ts.desc);
        },
      });
  }

  /** Descarga el PDF del documento. */
  protected onImprimir(): void {
    const id = this.id();
    if (!id) return;
    this.gateway
      .imprimir(this.document(), Number(id))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: () => {
          const ts = this.t().documentActions.detail.toasts.imprimirError;
          this.toast.error(ts.title, ts.desc);
        },
      });
  }

  protected onArchivos(): void {
    this.toast.info(this.t().common.comingSoon);
  }

  private loadDocumento(id: number): void {
    // Mismo patrón que el form: cabecera y líneas son independientes → en paralelo.
    forkJoin({
      cabecera: this.gateway.getById(this.document(), id),
      lineas: this.detalleService.listarPorDocumento<ServicioDocumentoDetalleRead>(id),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ cabecera, lineas }) => {
          const read = cabecera as ServicioDocumentoRead;
          const fv = servicioDocumentoToFormValue(read);
          this.cabecera.set({
            contacto: fv.contacto?.nombre ?? read.contacto_nombre ?? null,
            fecha: fv.fecha ?? null,
            sector: fv.sector?.nombre ?? read.sector_nombre ?? null,
            estrato: fv.estrato ?? null,
            salario: fv.salario ?? null,
          });
          const salarioDoc = toFiniteNumber(read.salario);
          this.lines.set(lineas.map((line) => detalleToFormValue(line, salarioDoc)));
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.notFound.set(true);
          const toasts = this.t().entities.servicioDocumento.form.toasts;
          this.toast.error(toasts.loadError.title, toasts.loadError.desc);
        },
      });
  }

  /** Formatea un monto a pesos colombianos sin decimales (`$ 1.000.000`). */
  protected readonly formatMoney = formatCop;

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
