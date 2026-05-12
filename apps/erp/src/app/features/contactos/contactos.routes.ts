import type { Route } from '@angular/router';

/**
 * Rutas del feature Contactos.
 *
 * Master administrativo (camino B del enfoque híbrido — ver
 * `docs/architecture/erp-module-architecture.md`).
 *
 * Bounded context propio: contactos cubre clientes, proveedores y empleados.
 * Tendrá lógica de negocio específica (segmentación, historial transaccional,
 * vista 360, etc.) que justifica vivir como feature independiente y no
 * dentro de un módulo "general" genérico.
 */
export const CONTACTOS_ROUTES: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/contactos-list/contactos-list.component').then(
        (m) => m.ContactosListComponent,
      ),
  },
];
