import type { BreadcrumbItem } from '@reddoc/feature-base';
import type { AppDict } from '@erp/i18n';

export function ventaDocumentoBreadcrumb(
  t: AppDict,
  slug: string | null,
  entityLabel: string,
  entityListPath: string,
  actionLabel: string,
): readonly BreadcrumbItem[] {
  const ventaBase = slug ? ['/t', slug, 'venta'] : undefined;
  return [
    { label: t.modules.venta.name, routerLink: ventaBase },
    {
      label: entityLabel,
      routerLink: ventaBase ? [...ventaBase, entityListPath, 'list'] : undefined,
    },
    { label: actionLabel },
  ];
}
