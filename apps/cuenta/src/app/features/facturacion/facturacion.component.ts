import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastService } from '@reddoc/core';
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
  readonly movimientos = signal<readonly Movimiento[]>([]);
  readonly groups = computed<readonly MovimientoGroup[]>(() => groupByMonth(this.movimientos()));

  readonly formatMonto = formatMonto;
  readonly formatDia = formatDia;
  readonly formatMesCorto = formatMesCorto;
  readonly tipoIcon = tipoIcon;
  readonly tipoLabel = tipoLabel;

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.isLoading.set(true);
    this.facturacionService
      .getMovimientos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.movimientos.set(res.results ?? []);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.toast.error('Error', 'No se pudieron cargar tus facturas.');
        },
      });
  }
}
