import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

/**
 * The only place in this backend that touches a raw password or its
 * hash. `CmsAuthService` (login) and the future admin-bootstrap path
 * both go through this instead of calling `argon2` directly, so the
 * algorithm/parameters live in exactly one place if they ever need to
 * change.
 *
 * Algorithm: argon2id (the variant OWASP recommends by default — a
 * hybrid of argon2i's side-channel resistance and argon2d's
 * GPU-cracking resistance), via the `argon2` package's own defaults
 * for memory/time/parallelism cost. Deliberately not bcrypt: bcrypt
 * has no memory-hardness, which makes it comparatively cheaper to
 * attack with GPU/ASIC hardware; argon2id is the current OWASP
 * Password Storage Cheat Sheet first choice.
 *
 * `argon2.hash()` generates and embeds its own random salt in the
 * output string — there is deliberately no separate `salt` column on
 * `CmsAdminUser`; the encoded hash (`$argon2id$v=19$m=...,t=...,p=...$<salt>$<hash>`)
 * is fully self-describing, so `verify()` never needs the original
 * parameters passed back in.
 */
@Injectable()
export class PasswordHasherService {
  /** Never store or log the plaintext this receives — only the returned hash. */
  hash(plainTextPassword: string): Promise<string> {
    return argon2.hash(plainTextPassword, { type: argon2.argon2id });
  }

  /**
   * Constant-time-by-design (argon2's own verify implementation) check
   * of a plaintext candidate against a previously stored hash. Never
   * throws on a *mismatched* password — only on a malformed hash
   * string — so callers can treat any falsy/rejected result as "wrong
   * password" uniformly.
   */
  async verify(hash: string, plainTextPassword: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plainTextPassword);
    } catch {
      // Malformed/unrecognized hash (e.g. corrupted data) — treat as a
      // failed verification rather than letting the exception escape
      // and potentially leak internals to the caller.
      return false;
    }
  }
}
