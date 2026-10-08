import { extname } from 'path';

const UNSAFE_CHARS = /[^a-zA-Z0-9._-]/g;
const MAX_BASENAME_LENGTH = 100;
const MAX_EXTENSION_LENGTH = 10;

/**
 * Reduces a client-supplied filename to a filesystem/S3-key-safe
 * basename. `file.originalname` is attacker-controlled input — as sent,
 * it may contain path separators, ".." segments, null bytes, or
 * arbitrary-length unicode, any of which could otherwise let a crafted
 * upload escape the intended storage prefix (see LocalStorageProvider's
 * `join(basePath, storageKey)`) or produce an invalid object key.
 *
 * The caller is still expected to prefix the result with a random id
 * (both storage providers already do this via `randomUUID()`), so this
 * only needs to make the name *safe*, not unique.
 */
export function sanitizeFilename(originalName: string): string {
  // Drop any directory component the client may have sent, POSIX- or
  // Windows-style, before anything else.
  const base = originalName.split(/[/\\]/).pop() || 'file';

  const ext = extname(base).slice(0, MAX_EXTENSION_LENGTH).replace(UNSAFE_CHARS, '');
  const stem = base
    .slice(0, base.length - extname(base).length)
    .replace(UNSAFE_CHARS, '')
    .slice(0, MAX_BASENAME_LENGTH);

  return `${stem || 'file'}${ext}`;
}
