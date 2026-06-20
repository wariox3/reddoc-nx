import type { CanDeactivateFn } from '@angular/router';
import type { Observable } from 'rxjs';

/**
 * Contrato que implementa un componente ruteado que quiere proteger cambios sin
 * guardar al salir. El guard solo delega: la decisión (incluida la confirmación
 * visual) vive en el componente, que conoce su propio estado.
 */
export interface CanComponentDeactivate {
  /** `true` deja salir; `false` cancela la navegación. Puede resolver async (confirm). */
  canDeactivate(): boolean | Observable<boolean>;
}

/**
 * Guard genérico de "cambios sin guardar": pregunta al componente saliente si
 * puede desactivarse. Cualquier form del ERP con cambios pendientes (líneas no
 * persistidas, etc.) lo cablea en su ruta y expone `canDeactivate()`.
 */
export const unsavedChangesGuard: CanDeactivateFn<CanComponentDeactivate> = (component) =>
  component.canDeactivate();
