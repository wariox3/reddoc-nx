/**
 * Ítem de un breadcrumb. El `label` llega ya traducido (el host resuelve i18n);
 * el componente es tonto y solo lo pinta.
 */
export interface BreadcrumbItem {
  /** Texto visible, ya traducido. */
  readonly label: string;
  /**
   * Comandos de `routerLink` para ítems navegables (p. ej. `['/t', slug, 'general']`).
   * El ítem actual (último) normalmente lo omite y se pinta como texto plano.
   */
  readonly routerLink?: string | unknown[];
}
