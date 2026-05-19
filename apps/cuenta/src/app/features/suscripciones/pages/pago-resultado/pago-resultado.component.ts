import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WOMPI_REF_STORAGE_KEY } from '../../utils/wompi-payload';

const DISPLAY_MS = 4_000;

@Component({
  selector: 'app-pago-resultado',
  standalone: true,
  imports: [],
  templateUrl: './pago-resultado.component.html',
  styleUrl: './pago-resultado.component.scss',
  host: { class: 'block' },
})
export class PagoResultadoComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly referencia = signal<string | null>(null);

  ngOnInit(): void {
    const qp = this.route.snapshot.queryParamMap;
    const ref =
      qp.get('ref') ??
      (typeof sessionStorage !== 'undefined'
        ? sessionStorage.getItem(WOMPI_REF_STORAGE_KEY)
        : null);

    this.referencia.set(ref);

    setTimeout(() => this.router.navigate(['/suscripciones']), DISPLAY_MS);
  }
}
