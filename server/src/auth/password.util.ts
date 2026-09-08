import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

/**
 * Hash a plaintext password with scrypt.
 * Format: "scrypt$<saltHex>$<hashHex>" (self-describing, no extra deps).
 */
export function hashPassword(plain: string): string {
  const salt = randomBytes(SALT_LENGTH);
  const hash = scryptSync(plain, salt, KEY_LENGTH);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

/** Constant-time password verification. */
export function verifyPassword(plain: string, stored: string): boolean {
  const parts = stored.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  try {
    const salt = Buffer.from(parts[1], 'hex');
    const expected = Buffer.from(parts[2], 'hex');
    const actual = scryptSync(plain, salt, expected.length);
    return timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

/**
 * Generate a readable but strong random password for admin-created accounts.
 * Excludes ambiguous characters (0/O/1/l/I) to make manual hand-off reliable.
 */
export function generatePassword(length = 12): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const bytes = randomBytes(length);
  let password = '';
  for (let i = 0; i < length; i += 1) {
    password += alphabet[bytes[i] % alphabet.length];
  }
  return password;
}
