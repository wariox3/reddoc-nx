import { Component, computed, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { getInitials } from '@reddoc/core';
import { Contenedor } from '../../models/contenedor.model';
import { getSuscripcionExpiryLabel } from '../../utils/contenedor-suscripcion.utils';

@Component({
  selector: 'app-contenedor-card-item',
  standalone: true,
  imports: [NgClass],
  templateUrl: './contenedor-card-item.component.html',
  styleUrl: './contenedor-card-item.component.scss',
})
export class ContenedorCardItemComponent {
  readonly contenedor = input.required<Contenedor>();
  readonly index = input<number>(0);
  readonly menuLabel = input<string>('Opciones');
  readonly enterLabel = input<string>('Ingresar');

  readonly enter = output<void>();
  readonly menuOpen = output<Event>();

  readonly avatarLabel = computed(() => getInitials(this.contenedor().nombre));

  readonly frecuenciaLabel = computed(() => {
    const map: Record<string, string> = { P: 'Prueba', M: 'Mensual', A: 'Anual' };
    return map[this.contenedor().suscripcion_frecuencia ?? ''] ?? '';
  });

  readonly expiryLabel = computed(() =>
    getSuscripcionExpiryLabel(this.contenedor().suscripcion_fecha_fin),
  );

  readonly isOwner = computed(() => this.contenedor().rol_id === 1);
}
