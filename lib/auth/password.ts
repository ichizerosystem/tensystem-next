import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * Hashes a plain text password.
 * @param password Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verifies a password against a hash.
 * @param password Plain text password
 * @param hash Stored hash
 * @returns true if match
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
