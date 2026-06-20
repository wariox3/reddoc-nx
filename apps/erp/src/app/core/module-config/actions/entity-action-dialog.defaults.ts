import type { DynamicDialogConfig } from 'primeng/dynamicdialog';

/**
 * Config base de los modales de acciones extra (`DialogService.open`).
 *
 * Centraliza el "frame" para que TODOS los modales de acción compartan el mismo
 * chrome del ERP sin repetir config en cada strategy:
 *  - `showHeader: false` → el header (badge + título + subtítulo) lo dibuja el
 *    propio componente, como el resto de modales de la app.
 *  - `styleClass: 'erp-action-dialog'` → frame (radio 16px, sombra suave, padding)
 *    definido como estilo global en `styles.scss` (el dialog se teletransporta al
 *    body, fuera del alcance de los estilos scoped).
 *
 * Cada strategy hace `this.dialog.open(Comp, { ...ENTITY_ACTION_DIALOG_DEFAULTS, width })`.
 */
export const ENTITY_ACTION_DIALOG_DEFAULTS: Partial<DynamicDialogConfig> = {
  showHeader: false,
  modal: true,
  dismissableMask: true,
  styleClass: 'erp-action-dialog',
  breakpoints: { '640px': '92vw' },
};
