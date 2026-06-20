import { inject } from '@angular/core';
import type { ResolveFn } from '@angular/router';
import { ActiveModuleStore } from './active-module.store';

/**
 * Resolver que marca un módulo como activo antes de montar sus rutas hijas.
 *
 * Se ata a la ruta raíz de cada módulo (general, compra, venta, inventario)
 * para que el topbar y el sidebar se sincronicen sin tener que escuchar
 * `NavigationEnd` ni parsear la URL manualmente.
 *
 * Las rutas globales bajo el workspace que no son módulo (dashboard,
 * configuracion) lo usan con `null` para limpiar el módulo activo y así
 * ocultar el sidebar.
 */
export function erpModuleResolver(id: string | null): ResolveFn<true> {
  return () => {
    inject(ActiveModuleStore).setActive(id);
    return true;
  };
}
