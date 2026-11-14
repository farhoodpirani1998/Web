import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { mkdir, realpath, rm, stat, writeFile } from 'node:fs/promises';
import {
  basename,
  dirname,
  extname,
  isAbsolute,
  relative,
  resolve,
} from 'node:path';
import {
  TEXTBOOK_STORAGE,
  TextbookStorage,
} from './textbook-storage.interface';
import { TextbookByteRange } from './textbook-storage.interface';

const PDF_MAGIC = Buffer.from('%PDF-');
const MAX_FILE_SIZE = 100 * 1024 * 1024;
const MAX_COVER_SIZE = 5 * 1024 * 1024;
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

@Injectable()
export class LocalTextbookStorageService implements TextbookStorage {
  private readonly root = resolve(
    process.env.TEXTBOOK_STORAGE_DIR ??
      resolve(process.cwd(), 'uploads', 'textbooks'),
  );

  async save(data: Buffer, originalName: string) {
    if (
      data.length < PDF_MAGIC.length ||
      !data.subarray(0, PDF_MAGIC.length).equals(PDF_MAGIC)
    ) {
      throw new Error('فایل انتخاب‌شده PDF معتبر نیست.');
    }
    if (data.length > MAX_FILE_SIZE) {
      throw new Error('حجم فایل از سقف ۱۰۰ مگابایت بیشتر است.');
    }
    const safeName = basename(originalName).replace(/[^\p{L}\p{N}._-]/gu, '_');
    if (extname(safeName).toLowerCase() !== '.pdf') {
      throw new Error('پسوند فایل باید PDF باشد.');
    }
    const key = `${randomUUID()}.pdf`;
    const resolvedPath = await this.resolveKey(key);
    await mkdir(dirname(resolvedPath), { recursive: true });
    await writeFile(resolvedPath, data, { flag: 'wx' });
    return {
      key,
      size: data.length,
      checksum: createHash('sha256').update(data).digest('hex'),
    };
  }

  async saveCover(data: Buffer) {
    if (data.length > MAX_COVER_SIZE) {
      throw new BadRequestException('حجم تصویر جلد نباید بیشتر از ۵ مگابایت باشد.');
    }

    const extension = this.coverExtension(data);
    if (!extension) {
      throw new BadRequestException(
        'فرمت تصویر جلد باید JPEG، PNG یا WebP باشد.',
      );
    }

    const key = `${randomUUID()}.${extension}`;
    const resolvedPath = await this.resolveKey(key);
    await mkdir(dirname(resolvedPath), { recursive: true });
    await writeFile(resolvedPath, data, { flag: 'wx' });
    return {
      key,
      size: data.length,
      checksum: createHash('sha256').update(data).digest('hex'),
    };
  }

  async remove(key: string): Promise<void> {
    await rm(await this.resolveKey(key), { force: true });
  }

  async open(key: string, range?: TextbookByteRange) {
    const path = await this.resolveKey(key);
    try {
      const file = await stat(path);
      const start = range?.start ?? 0;
      const end = range?.end ?? file.size - 1;
      return {
        stream: createReadStream(path, range ? { start, end } : undefined),
        size: file.size,
        etag: `"${createHash('sha256').update(`${file.size}:${file.mtimeMs}`).digest('hex')}"`,
        start,
        end,
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new NotFoundException('فایل کتاب پیدا نشد.');
      }
      throw error;
    }
  }

  private async resolveKey(key: string): Promise<string> {
    if (!key || isAbsolute(key) || key.includes('\0')) {
      throw new Error('کلید فایل نامعتبر است.');
    }

    const segments = key.split(/[\\/]+/).filter(Boolean);
    if (segments.includes('..') || segments.includes('.')) {
      throw new Error('کلید فایل نامعتبر است.');
    }

    const root = await this.ensureRoot();
    const resolved = resolve(root, key);
    const relativePath = relative(root, resolved);
    const isWithinRoot =
      relativePath !== '' &&
      !relativePath.startsWith('..') &&
      !relativePath.startsWith('../') &&
      !isAbsolute(relativePath);

    if (!isWithinRoot) {
      throw new Error('کلید فایل نامعتبر است.');
    }

    const candidateParent = dirname(resolved);
    const realParent = await realpath(candidateParent).catch(
      () => candidateParent,
    );
    const parentRelativePath = relative(root, realParent);
    const isParentWithinRoot =
      parentRelativePath === '' ||
      (parentRelativePath !== '' &&
        !parentRelativePath.startsWith('..') &&
        !parentRelativePath.startsWith('../') &&
        !isAbsolute(parentRelativePath));

    if (!isParentWithinRoot) {
      throw new Error('کلید فایل نامعتبر است.');
    }

    const realResolved = await realpath(resolved).catch(() => null);
    if (realResolved) {
      const realRelativePath = relative(root, realResolved);
      const isRealPathWithinRoot =
        realRelativePath === '' ||
        (!realRelativePath.startsWith('..') &&
          !realRelativePath.startsWith('../') &&
          !isAbsolute(realRelativePath));

      if (!isRealPathWithinRoot) {
        throw new Error('کلید فایل نامعتبر است.');
      }
    }

    return resolved;
  }

  private coverExtension(data: Buffer): 'jpg' | 'png' | 'webp' | null {
    if (
      data.length >= 3 &&
      data[0] === 0xff &&
      data[1] === 0xd8 &&
      data[2] === 0xff
    ) {
      return 'jpg';
    }
    if (data.length >= PNG_MAGIC.length && data.subarray(0, 8).equals(PNG_MAGIC)) {
      return 'png';
    }
    if (
      data.length >= 12 &&
      data.toString('ascii', 0, 4) === 'RIFF' &&
      data.toString('ascii', 8, 12) === 'WEBP'
    ) {
      return 'webp';
    }
    return null;
  }

  private async ensureRoot(): Promise<string> {
    await mkdir(this.root, { recursive: true });
    return realpath(this.root);
  }
}

export const localTextbookStorageProvider = {
  provide: TEXTBOOK_STORAGE,
  useExisting: LocalTextbookStorageService,
};
