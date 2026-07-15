import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import { join, resolve } from 'path';
import { randomUUID } from 'crypto';
import { StorageProvider, UploadResult } from './storage.interface';
import { sanitizeFilename } from './sanitize-filename';

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly basePath: string;

  constructor(private readonly config: ConfigService) {
    // Resolved to an absolute path so it's independent of whatever the
    // process's cwd happens to be at call time — and so it matches
    // exactly what main.ts mounts via `useStaticAssets` for serving
    // these files back out again. `resolve` (not `join(cwd, ...)`)
    // handles an already-absolute LOCAL_STORAGE_PATH correctly too.
    this.basePath = resolve(
      this.config.get<string>('LOCAL_STORAGE_PATH', './uploads'),
    );
  }

  async upload(file: Express.Multer.File, path: string): Promise<UploadResult> {
    const key = `${path}/${randomUUID()}-${sanitizeFilename(file.originalname)}`;
    const fullPath = join(this.basePath, key);
    await fs.mkdir(join(fullPath, '..'), { recursive: true });
    await fs.writeFile(fullPath, file.buffer);
    return { url: this.getUrl(key), storageKey: key };
  }

  async delete(storageKey: string): Promise<void> {
    await fs.unlink(join(this.basePath, storageKey)).catch(() => undefined);
  }

  getUrl(storageKey: string): string {
    return `/uploads/${storageKey}`;
  }
}
