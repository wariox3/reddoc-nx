import type { Ciudad } from '@reddoc/core';

export type TipoIdentificacion = 'CC' | 'NIT' | 'CE' | 'PA';

export interface BillingProfile {
  readonly id: number;
  readonly tipo: TipoIdentificacion;
  readonly numero: string;
  readonly nombre: string;
  readonly email: string;
  readonly direccion: string;
  readonly ciudad: string;
  readonly ciudad_id?: number;
}

export interface BillingProfileDraft {
  tipo: TipoIdentificacion | null;
  numero: string;
  nombre: string;
  email: string;
  direccion: string;
  ciudad: Ciudad | null;
}

export const EMPTY_BILLING_DRAFT: BillingProfileDraft = {
  tipo: null,
  numero: '',
  nombre: '',
  email: '',
  direccion: '',
  ciudad: null,
};

export const TIPO_IDENTIFICACION_OPTIONS: ReadonlyArray<{
  readonly value: TipoIdentificacion;
  readonly label: string;
  readonly hint: string;
}> = [
  { value: 'CC', label: 'CC', hint: 'Cédula de ciudadanía' },
  { value: 'NIT', label: 'NIT', hint: 'Número de identificación tributaria' },
  { value: 'CE', label: 'CE', hint: 'Cédula de extranjería' },
  { value: 'PA', label: 'PA', hint: 'Pasaporte' },
];

export function formatIdentificacion(tipo: TipoIdentificacion, raw: string): string {
  const cleaned = raw.replace(/[^0-9A-Za-z]/g, '');
  if (tipo === 'CC' || tipo === 'NIT') {
    const digits = cleaned.replace(/\D/g, '');
    if (tipo === 'NIT' && digits.length >= 2) {
      const body = digits.slice(0, -1);
      const dv = digits.slice(-1);
      return `${groupThousands(body)}-${dv}`;
    }
    return groupThousands(digits);
  }
  return cleaned.toUpperCase();
}

function groupThousands(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isBillingDraftValid(draft: BillingProfileDraft): boolean {
  if (!draft.tipo) return false;
  if (draft.numero.replace(/\D/g, '').length < 5) return false;
  if (draft.nombre.trim().length < 3) return false;
  if (!EMAIL_RE.test(draft.email.trim())) return false;
  if (draft.direccion.trim().length < 5) return false;
  if (!draft.ciudad || draft.ciudad.nombre.trim().length < 2) return false;
  return true;
}
