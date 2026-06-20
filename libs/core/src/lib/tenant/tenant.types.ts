export type TenantSlug = string;

export const LAST_TENANT_KEY = 'reddoc-last-tenant';

export interface ContenedorAccess {
  schema_name: string;
  nombre: string;
  activo: boolean;
}
