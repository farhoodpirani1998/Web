import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { StorageProvider, UploadResult } from './storage.interface';

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly basePath: string;

  constructor(private readonly config: ConfigService) {
    this.basePath = this.config.get<string>('LOCAL_STORAGE_PATH', './uploads');
  }

  async upload(file: Express.Multer.File, path: string): Promise<UploadResult> {
    const key = `${path}/${randomUUID()}-${file.originalname}`;
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
