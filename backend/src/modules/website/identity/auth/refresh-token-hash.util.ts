import { createHash, randomBytes } from 'crypto';

/**
 * Generates a new raw refresh token: 256 bits of CSPRNG output,
 * base64url-encoded so it's URL/cookie-safe with no padding characters
 * to escape. Never persisted or logged in this form — only its hash
 * (`hashRefreshToken`) is stored; the raw value exists only long enough
 * to be handed to the client once (via the httpOnly cookie) and, on the
 * next `/refresh` call, hashed again to look up its row.
 */
export function generateRefreshToken(): string {
  return randomBytes(32).toString('base64url');
}

/**
 * SHA-256 hex digest of a raw refresh token. See
 * `CmsRefreshToken.tokenHash`'s doc comment for why a fast hash (not
 * `PasswordHasherService`'s argon2id) is the right choice here: the
 * input is already high-entropy random data, not a human-chosen secret.
 */
export function hashRefreshToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex');
}
