import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';
import { StorageProvider, UploadResult } from './storage.interface';
import { sanitizeFilename } from './sanitize-filename';

/**
 * Single implementation targeting the S3 API surface — not "AWS-only".
 * AWS S3, Cloudflare R2, DigitalOcean Spaces, and MinIO all speak the
 * same S3-compatible API, so switching between them is a config change
 * (endpoint + credentials), never a new class.
 */
@Injectable()
export class S3CompatibleStorageProvider implements StorageProvider {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  constructor(private readonly config: ConfigService) {
    const endpoint = this.config.get<string>('S3_ENDPOINT');
    this.bucket = this.config.getOrThrow<string>('S3_BUCKET');
    this.client = new S3Client({
      endpoint: endpoint || undefined,
      region: this.config.get<string>('S3_REGION', 'auto'),
      credentials: {
        accessKeyId: this.config.getOrThrow<string>('S3_ACCESS_KEY_ID'),
        secretAccessKey: this.config.getOrThrow<string>('S3_SECRET_ACCESS_KEY'),
      },
      forcePathStyle: true,
    });
    this.publicBaseUrl = endpoint
      ? `${endpoint}/${this.bucket}`
      : `https://${this.bucket}.s3.amazonaws.com`;
  }

  async upload(file: Express.Multer.File, path: string): Promise<UploadResult> {
    const key = `${path}/${randomUUID()}-${sanitizeFilename(file.originalname)}`;
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );
    return { url: this.getUrl(key), storageKey: key };
  }

  async delete(storageKey: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: storageKey }),
    );
  }

  getUrl(storageKey: string): string {
    return `${this.publicBaseUrl}/${storageKey}`;
  }
}
