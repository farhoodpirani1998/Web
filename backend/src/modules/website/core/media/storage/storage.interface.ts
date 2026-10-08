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
  /**
   * Resolves if the storage backend is reachable and writable, rejects
   * otherwise. Used by the /health endpoint — never called from the
   * upload/delete path, so it must not have side effects that would
   * interfere with real media (e.g. writing into the actual upload tree).
   */
  checkHealth(): Promise<void>;
}

export const STORAGE_PROVIDER = 'STORAGE_PROVIDER';
