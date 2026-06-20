export type PlanCatalogLang = 'es' | 'en';

export type PlanTier = 'impulso' | 'crecimiento' | 'expansion' | 'exito';

export type PlanCategory = 'facturacion' | 'erp';

export interface PlanFeature {
  readonly label: string;
  readonly included: boolean;
}
