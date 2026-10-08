/**
 * Formats a byte count for display (e.g. `sizeBytes` on `CmsMedia`).
 * Presentational only — not a general-purpose utility, kept local to
 * this module since nothing outside media display needs it yet.
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[unitIndex]}`;
}
