/**
 * Valida placa brasileira (formato antigo ABC-1234 ou Mercosul ABC1D23)
 */
const PLACA_ANTIGA = /^[A-Z]{3}-?\d{4}$/;
const PLACA_MERCOSUL = /^[A-Z]{3}\d[A-Z]\d{2}$/;

export function validarPlaca(placa: string): boolean {
  const p = placa.replace(/\s/g, "").toUpperCase();
  if (p.length < 7 || p.length > 8) return false;
  return PLACA_ANTIGA.test(p) || PLACA_MERCOSUL.test(p);
}

export function normalizarPlaca(placa: string): string {
  return placa.replace(/\s|-/g, "").toUpperCase();
}
