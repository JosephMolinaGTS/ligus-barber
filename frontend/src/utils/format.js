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

/**
 * Máscara de teléfono para inputs: formatea mientras se escribe.
 * "6671234567" → "667 123 4567"
 * Solo permite dígitos, máximo 10.
 */
export function phoneMask(value) {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}
