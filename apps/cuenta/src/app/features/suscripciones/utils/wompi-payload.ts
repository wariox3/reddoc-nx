import { BillingProfile } from '../models/billing-profile.model';
import { WompiCustomerData } from '../models/pago.model';
import { annualTotal, displayedMonthly } from '../pages/planes/utils/plan-pricing';

export const WOMPI_REF_STORAGE_KEY = 'reddoc:wompi:ref';

// Wompi exige el código corto en `customer-data:legal-id-type`. Si recibe el
// nombre largo cae al primer item del select ("Registro civil"), por eso
// mapeamos del nombre que devuelve /api/general/identificacion/ al código.
const LEGAL_ID_TYPE_TO_WOMPI: Record<string, string> = {
  'cédula de ciudadanía': 'CC',
  'cedula de ciudadania': 'CC',
  'cédula de extranjería': 'CE',
  'cedula de extranjeria': 'CE',
  nit: 'NIT',
  pasaporte: 'PP',
  'tarjeta de identidad': 'TI',
  'registro civil': 'RC',
};

export function calcularMontoCents(precio: string, anual: boolean): number {
  const valor = anual ? annualTotal(precio) : displayedMonthly(precio, false);
  return valor * 100;
}

export function armarCustomerData(bp: BillingProfile): WompiCustomerData {
  return {
    email: bp.email,
    full_name: bp.nombre,
    phone_number: normalizePhoneNumber(bp.telefono),
    legal_id: bp.numero || undefined,
    legal_id_type: mapLegalIdType(bp.tipo),
  };
}

function mapLegalIdType(tipo: string | undefined): string | undefined {
  if (!tipo) return undefined;
  return LEGAL_ID_TYPE_TO_WOMPI[tipo.trim().toLowerCase()];
}

/**
 * Wompi espera el celular en formato E.164 (`+573163557856`). Si no detecta
 * el prefijo lo descarta del autocomplete. Asume Colombia (+57) cuando el
 * número sin caracteres no-dígito tiene 10 cifras y empieza con 3.
 */
function normalizePhoneNumber(telefono: string | undefined): string | undefined {
  if (!telefono) return undefined;
  const trimmed = telefono.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith('+')) return trimmed;
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('57')) return `+${digits}`;
  if (digits.length === 10 && digits.startsWith('3')) return `+57${digits}`;
  return undefined;
}
