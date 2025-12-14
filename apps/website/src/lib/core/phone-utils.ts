/**
 * Phone number utilities
 * Stub file to satisfy build - implement as needed
 */

export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Format as E.164 if US number
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }

  return phone;
}

export function validatePhoneNumber(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

export function normalizePhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '');
}

// Alias for normalizePhoneNumber
export const normalizePhone = normalizePhoneNumber;
