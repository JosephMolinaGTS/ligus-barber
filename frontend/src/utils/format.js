// ============================================================
// Funciones de formato para la aplicación
// ============================================================

/**
 * Formatea un teléfono de 10 dígitos a "XXX XXX XXXX"
 * Ejemplo: "6675286398" → "667 528 6398"
 */
export function formatPhone(phone) {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length !== 10) return phone;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}
