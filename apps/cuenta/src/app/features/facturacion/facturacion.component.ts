import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastService, extractErrorMessage } from '@reddoc/core';
import { Movimiento } from './models/movimiento.model';
import { FacturacionService } from './services/facturacion.service';
import {
  MovimientoGroup,
  formatDia,
  formatMesCorto,
  formatMonto,
  groupByMonth,
  tipoIcon,
  tipoLabel,
} from './utils/movimiento.utils';

@Component({
  selector: 'app-facturacion',
  standalone: true,
  templateUrl: './facturacion.component.html',
})
export class FacturacionComponent implements OnInit {
  private readonly facturacionService = inject(FacturacionService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly isLoading = signal(true);
  readonly isLoadingMore = signal(false);
  readonly movimientos = signal<readonly Movimiento[]>([]);
  readonly hasMore = signal(false);
  readonly lastLoadedPage = signal(0);

  readonly groups = computed<readonly MovimientoGroup[]>(() => groupByMonth(this.movimientos()));

  readonly formatMonto = formatMonto;
  readonly formatDia = formatDia;
  readonly formatMesCorto = formatMesCorto;
  readonly tipoIcon = tipoIcon;
  readonly tipoLabel = tipoLabel;

  ngOnInit(): void {
    this.loadFirstPage();
  }

  loadMore(): void {
    if (this.isLoadingMore() || !this.hasMore()) return;

    const nextPage = this.lastLoadedPage() + 1;
    this.isLoadingMore.set(true);
    this.facturacionService
      .getMovimientos(nextPage)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.movimientos.update((current) => [...current, ...res.results]);
          this.hasMore.set(res.next !== null);
          this.lastLoadedPage.set(nextPage);
          this.isLoadingMore.set(false);
        },
        error: (err) => {
          this.isLoadingMore.set(false);
          this.toast.error(
            'Error',
            extractErrorMessage(err, 'No se pudieron cargar más facturas.'),
          );
        },
      });
  }

  private loadFirstPage(): void {
    this.isLoading.set(true);
    this.facturacionService
      .getMovimientos(1)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.movimientos.set(res.results);
          this.hasMore.set(res.next !== null);
          this.lastLoadedPage.set(1);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.toast.error('Error', 'No se pudieron cargar tus facturas.');
        },
      });
  }
}
