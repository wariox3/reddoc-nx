import { Component, computed, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { Contenedor } from '../../models/contenedor.model';
import { getSuscripcionExpiryLabel } from '../../utils/contenedor-suscripcion.utils';

@Component({
  selector: 'app-contenedor-row-item',
  standalone: true,
  imports: [NgClass],
  templateUrl: './contenedor-row-item.component.html',
  styleUrl: './contenedor-row-item.component.scss',
})
export class ContenedorRowItemComponent {
  readonly contenedor = input.required<Contenedor>();
  readonly index = input<number>(0);
  readonly menuLabel = input<string>('Opciones');
  readonly enterLabel = input<string>('Ingresar');

  readonly enter = output<void>();
  readonly menuOpen = output<Event>();

  readonly avatarLabel = computed(() =>
    this.contenedor()
      .nombre.split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase(),
  );

  readonly frecuenciaLabel = computed(() => {
    const map: Record<string, string> = { P: 'Prueba', M: 'Mensual', A: 'Anual' };
    return map[this.contenedor().suscripcion_frecuencia ?? ''] ?? '';
  });

  readonly expiryLabel = computed(() =>
    getSuscripcionExpiryLabel(this.contenedor().suscripcion_fecha_fin),
  );
}
