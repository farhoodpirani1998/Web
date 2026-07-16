/**
 * Reads a value from `process.env`, falling back to `fallback` when
 * unset. Used (rather than ConfigService) because these constants are
 * consumed as `FileInterceptor()` decorator options in media.controller.ts
 * — plain-object metadata evaluated at class-definition time, before
 * Nest's DI container (and ConfigService) exists. main.ts loads dotenv
 * before importing AppModule specifically so a .env-file value is
 * already in `process.env` by the time this module is first imported —
 * the same reason public-rate-limit.constants.ts reads process.env
 * directly instead of through ConfigService.
 */
function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/**
 * The full set of formats this module knows how to verify — both the
 * magic-byte signature (`matchesAllowedMimeType`) and the extension it's
 * expected to arrive with (`EXTENSION_MIME_MAP`) are hand-rolled per
 * format below, so an env override can only narrow this list (e.g.
 * disable webp uploads), never add a format neither of those checks
 * knows how to validate.
 */
const KNOWN_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
type KnownMimeType = (typeof KNOWN_MIME_TYPES)[number];

const KNOWN_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'] as const;
type KnownExtension = (typeof KNOWN_EXTENSIONS)[number];

function envMimeTypeList(name: string, fallback: readonly KnownMimeType[]): readonly KnownMimeType[] {
  const raw = process.env[name];
  if (!raw) return fallback;
  const requested = raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
  const valid = requested.filter((entry): entry is KnownMimeType =>
    (KNOWN_MIME_TYPES as readonly string[]).includes(entry),
  );
  return valid.length ? valid : fallback;
}

function envExtensionList(name: string, fallback: readonly KnownExtension[]): readonly KnownExtension[] {
  const raw = process.env[name];
  if (!raw) return fallback;
  const requested = raw
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
    .map((entry) => (entry.startsWith('.') ? entry : `.${entry}`));
  const valid = requested.filter((entry): entry is KnownExtension =>
    (KNOWN_EXTENSIONS as readonly string[]).includes(entry),
  );
  return valid.length ? valid : fallback;
}

// Configurable via MEDIA_ALLOWED_MIME_TYPES (see .env.example); falls
// back to all 3 known formats when unset.
export const ALLOWED_MIME_TYPES = envMimeTypeList('MEDIA_ALLOWED_MIME_TYPES', KNOWN_MIME_TYPES);
export type AllowedMediaMimeType = (typeof ALLOWED_MIME_TYPES)[number];

// Configurable via MEDIA_ALLOWED_EXTENSIONS (see .env.example); falls
// back to all 4 known extensions when unset.
export const ALLOWED_EXTENSIONS = envExtensionList('MEDIA_ALLOWED_EXTENSIONS', KNOWN_EXTENSIONS);

// Configurable via MEDIA_MAX_SIZE_BYTES (see .env.example); falls back
// to the previous hardcoded 10MB when unset.
export const MAX_SIZE_BYTES = envInt('MEDIA_MAX_SIZE_BYTES', 10 * 1024 * 1024);

/**
 * The `mimetype` multer reports on an upload is just the client-supplied
 * Content-Type header — trivially spoofable (e.g. a script renamed with a
 * `.png` extension and an `image/png` header). This sniffs the actual
 * leading bytes of the file against the signature for each allowed type,
 * so a mismatched/spoofed declaration is rejected before the file is ever
 * written to storage. Deliberately hand-rolled rather than pulling in a
 * file-type-sniffing dependency: the allow-list is exactly 3 well-known
 * image formats, so the signatures are small and stable.
 */
export function matchesAllowedMimeType(buffer: Buffer, mimetype: string): boolean {
  if (!buffer || buffer.length < 12) return false;

  switch (mimetype) {
    case 'image/jpeg':
      return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    case 'image/png':
      return (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47 &&
        buffer[4] === 0x0d &&
        buffer[5] === 0x0a &&
        buffer[6] === 0x1a &&
        buffer[7] === 0x0a
      );
    case 'image/webp':
      return (
        buffer.toString('ascii', 0, 4) === 'RIFF' &&
        buffer.toString('ascii', 8, 12) === 'WEBP'
      );
    default:
      return false;
  }
}

const EXTENSION_MIME_MAP: Record<KnownExtension, KnownMimeType> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

/**
 * Guards against a renamed-extension attack (e.g. a file uploaded as
 * "payload.jpg" whose bytes and declared Content-Type both say
 * image/png) by requiring the extension to match the format the bytes
 * were already confirmed to be, not just appear in ALLOWED_EXTENSIONS
 * on its own.
 */
export function extensionMatchesMimeType(extension: string, mimetype: string): boolean {
  return EXTENSION_MIME_MAP[extension as KnownExtension] === mimetype;
}
