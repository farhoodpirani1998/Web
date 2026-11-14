import { mkdtempSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { LocalTextbookStorageService } from './local-textbook-storage.service';

describe('LocalTextbookStorageService', () => {
  let tempRoot: string;

  beforeEach(() => {
    tempRoot = mkdtempSync(join(tmpdir(), 'textbook-storage-'));
    process.env.TEXTBOOK_STORAGE_DIR = tempRoot;
  });

  afterEach(() => {
    delete process.env.TEXTBOOK_STORAGE_DIR;
    rmSync(tempRoot, { recursive: true, force: true });
  });

  it('rejects traversal keys outside the storage root', async () => {
    const service = new LocalTextbookStorageService();

    await expect((service as any).resolveKey('../escape.pdf')).rejects.toThrow(
      'کلید فایل نامعتبر است.',
    );
    await expect(
      (service as any).resolveKey('safe/../escape.pdf'),
    ).rejects.toThrow('کلید فایل نامعتبر است.');
  });

  it('rejects symlinked directories that point outside the storage root', async () => {
    const service = new LocalTextbookStorageService();
    const outsideRoot = mkdtempSync(join(tmpdir(), 'textbook-outside-'));
    const symlinkPath = join(tempRoot, 'linked');

    symlinkSync(
      outsideRoot,
      symlinkPath,
      process.platform === 'win32' ? 'junction' : 'dir',
    );

    await expect(
      (service as any).resolveKey('linked/escape.pdf'),
    ).rejects.toThrow('کلید فایل نامعتبر است.');

    rmSync(outsideRoot, { recursive: true, force: true });
  });

  it('accepts keys that stay within the storage root', async () => {
    const service = new LocalTextbookStorageService();

    await expect((service as any).resolveKey('valid.pdf')).resolves.toBe(
      resolve(tempRoot, 'valid.pdf'),
    );
  });
});
