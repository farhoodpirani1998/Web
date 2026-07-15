export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export type AllowedMediaMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

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
