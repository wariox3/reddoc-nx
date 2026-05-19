import { PLAN_DESCRIPTIONS, PLAN_FEATURES } from './plan-catalog';
import type { PlanCatalogLang, PlanCategory, PlanFeature, PlanTier } from './plan-catalog.types';

const TIER_BY_FIRST_WORD: Readonly<Record<string, PlanTier>> = {
  impulso: 'impulso',
  impulse: 'impulso',
  crecimiento: 'crecimiento',
  growth: 'crecimiento',
  expansión: 'expansion',
  expansion: 'expansion',
  éxito: 'exito',
  exito: 'exito',
  success: 'exito',
};

export function resolvePlanTier(nombre: string): PlanTier | null {
  const first = nombre.trim().split(/\s+/)[0]?.toLowerCase();
  if (!first) return null;
  return TIER_BY_FIRST_WORD[first] ?? null;
}

export function resolvePlanCategory(categoriaId: number): PlanCategory | null {
  if (categoriaId === 1) return 'facturacion';
  if (categoriaId === 2) return 'erp';
  return null;
}

export function getPlanFeatures(
  lang: PlanCatalogLang,
  category: PlanCategory,
  tier: PlanTier,
): readonly PlanFeature[] {
  return PLAN_FEATURES[lang][category][tier];
}

export function getPlanDescription(lang: PlanCatalogLang, tier: PlanTier): string {
  return PLAN_DESCRIPTIONS[lang][tier];
}
