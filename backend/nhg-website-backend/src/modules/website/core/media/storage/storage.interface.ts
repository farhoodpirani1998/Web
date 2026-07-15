export interface UploadResult {
  url: string;
  storageKey: string;
}

/**
 * MediaService only ever depends on this interface, never a concrete
 * implementation. Swapping providers (local -> S3-compatible, or between
 * S3-compatible providers) is a configuration change, not a code change.
 */
export interface StorageProvider {
  upload(file: Express.Multer.File, path: string): Promise<UploadResult>;
  delete(storageKey: string): Promise<void>;
  getUrl(storageKey: string): string;
}

export const STORAGE_PROVIDER = 'STORAGE_PROVIDER';
