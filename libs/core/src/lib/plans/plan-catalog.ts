import type { PlanCatalogLang, PlanCategory, PlanFeature, PlanTier } from './plan-catalog.types';

export const PLAN_DESCRIPTIONS: Readonly<
  Record<PlanCatalogLang, Readonly<Record<PlanTier, string>>>
> = {
  es: {
    impulso: 'Da el primer paso hacia tu éxito.',
    crecimiento: 'Tu negocio comienza a crecer.',
    expansion: 'Desarrolla tu potencial al máximo.',
    exito: 'Lleva tu empresa a nuevas alturas.',
  },
  en: {
    impulso: 'Take your first step to success.',
    crecimiento: 'Your business starts to grow.',
    expansion: 'Develop your potential to the max.',
    exito: 'Take your company to new heights.',
  },
};

type FeatureMap = Readonly<
  Record<
    PlanCatalogLang,
    Readonly<Record<PlanCategory, Readonly<Record<PlanTier, readonly PlanFeature[]>>>>
  >
>;

export const PLAN_FEATURES: FeatureMap = {
  es: {
    facturacion: {
      impulso: [
        { label: 'Documentos ilimitados', included: true },
        { label: '1 Usuario con acceso', included: true },
        { label: 'Ingresos hasta $10.000.000 COP / mes', included: true },
        { label: 'Soporte técnico', included: true },
      ],
      crecimiento: [
        { label: 'Documentos ilimitados', included: true },
        { label: '2 Usuarios con acceso', included: true },
        { label: 'Ingresos hasta $50.000.000 COP / mes', included: true },
        { label: 'Soporte técnico', included: true },
      ],
      expansion: [
        { label: 'Documentos ilimitados', included: true },
        { label: '3 Usuarios con acceso', included: true },
        { label: 'Ingresos hasta $200.000.000 COP / mes', included: true },
        { label: 'Soporte técnico', included: true },
      ],
      exito: [
        { label: 'Documentos ilimitados', included: true },
        { label: '8 Usuarios con acceso', included: true },
        { label: 'Ingresos hasta $500.000.000 COP / mes', included: true },
        { label: 'Soporte técnico', included: true },
      ],
    },
    erp: {
      impulso: [
        { label: 'Documentos ilimitados', included: true },
        { label: '1 Usuario con acceso', included: true },
        { label: 'Ingresos hasta $10.000.000 COP / mes', included: true },
        { label: 'Soporte técnico', included: true },
        { label: 'Facturación y compras', included: true },
        { label: 'Tesorería y cartera', included: true },
        { label: 'Inventario y POS+', included: false },
        { label: 'Contabilidad', included: false },
        { label: 'Nómina', included: false },
        { label: 'API integración', included: false },
        { label: 'Tablero analítica', included: false },
      ],
      crecimiento: [
        { label: 'Documentos ilimitados', included: true },
        { label: '2 Usuarios con acceso', included: true },
        { label: 'Ingresos hasta $50.000.000 COP / mes', included: true },
        { label: 'Soporte técnico', included: true },
        { label: 'Facturación y compras', included: true },
        { label: 'Tesorería y cartera', included: true },
        { label: 'Inventario y POS+', included: true },
        { label: 'Contabilidad', included: true },
        { label: 'Nómina', included: false },
        { label: 'API integración', included: false },
        { label: 'Tablero analítica', included: false },
      ],
      expansion: [
        { label: 'Documentos ilimitados', included: true },
        { label: '3 Usuarios con acceso', included: true },
        { label: 'Ingresos hasta $200.000.000 COP / mes', included: true },
        { label: 'Soporte técnico', included: true },
        { label: 'Facturación y compras', included: true },
        { label: 'Tesorería y cartera', included: true },
        { label: 'Inventario y POS+', included: true },
        { label: 'Contabilidad', included: true },
        { label: 'Nómina', included: true },
        { label: 'API integración', included: false },
        { label: 'Tablero analítica', included: false },
      ],
      exito: [
        { label: 'Documentos ilimitados', included: true },
        { label: '8 Usuarios con acceso', included: true },
        { label: 'Ingresos hasta $500.000.000 COP / mes', included: true },
        { label: 'Soporte especializado', included: true },
        { label: 'Facturación y compras', included: true },
        { label: 'Tesorería y cartera', included: true },
        { label: 'Inventario y POS+', included: true },
        { label: 'Contabilidad', included: true },
        { label: 'Nómina', included: true },
        { label: 'API integración', included: true },
        { label: 'Tablero analítica', included: true },
      ],
    },
  },
  en: {
    facturacion: {
      impulso: [
        { label: 'Unlimited documents', included: true },
        { label: '1 User', included: true },
        { label: 'Revenue up to $10,000,000 COP / mo', included: true },
        { label: 'Standard support', included: true },
      ],
      crecimiento: [
        { label: 'Unlimited documents', included: true },
        { label: '2 Users', included: true },
        { label: 'Revenue up to $50,000,000 COP / mo', included: true },
        { label: 'Standard support', included: true },
      ],
      expansion: [
        { label: 'Unlimited documents', included: true },
        { label: '3 Users', included: true },
        { label: 'Revenue up to $200,000,000 COP / mo', included: true },
        { label: 'Standard support', included: true },
      ],
      exito: [
        { label: 'Unlimited documents', included: true },
        { label: '8 Users', included: true },
        { label: 'Revenue up to $500,000,000 COP / mo', included: true },
        { label: 'Standard support', included: true },
      ],
    },
    erp: {
      impulso: [
        { label: 'Unlimited documents', included: true },
        { label: '1 User', included: true },
        { label: 'Revenue up to $10,000,000 COP / mo', included: true },
        { label: 'Standard support', included: true },
        { label: 'Billing & purchases', included: true },
        { label: 'Treasury & receivables', included: true },
        { label: 'Inventory & POS+', included: false },
        { label: 'Accounting', included: false },
        { label: 'Payroll', included: false },
        { label: 'API integration', included: false },
        { label: 'Analytics dashboard', included: false },
      ],
      crecimiento: [
        { label: 'Unlimited documents', included: true },
        { label: '2 Users', included: true },
        { label: 'Revenue up to $50,000,000 COP / mo', included: true },
        { label: 'Standard support', included: true },
        { label: 'Billing & purchases', included: true },
        { label: 'Treasury & receivables', included: true },
        { label: 'Inventory & POS+', included: true },
        { label: 'Accounting', included: true },
        { label: 'Payroll', included: false },
        { label: 'API integration', included: false },
        { label: 'Analytics dashboard', included: false },
      ],
      expansion: [
        { label: 'Unlimited documents', included: true },
        { label: '3 Users', included: true },
        { label: 'Revenue up to $200,000,000 COP / mo', included: true },
        { label: 'Standard support', included: true },
        { label: 'Billing & purchases', included: true },
        { label: 'Treasury & receivables', included: true },
        { label: 'Inventory & POS+', included: true },
        { label: 'Accounting', included: true },
        { label: 'Payroll', included: true },
        { label: 'API integration', included: false },
        { label: 'Analytics dashboard', included: false },
      ],
      exito: [
        { label: 'Unlimited documents', included: true },
        { label: '8 Users', included: true },
        { label: 'Revenue up to $500,000,000 COP / mo', included: true },
        { label: 'Specialized support', included: true },
        { label: 'Billing & purchases', included: true },
        { label: 'Treasury & receivables', included: true },
        { label: 'Inventory & POS+', included: true },
        { label: 'Accounting', included: true },
        { label: 'Payroll', included: true },
        { label: 'API integration', included: true },
        { label: 'Analytics dashboard', included: true },
      ],
    },
  },
};
