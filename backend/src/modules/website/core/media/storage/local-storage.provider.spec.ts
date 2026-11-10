import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import { LocalStorageProvider } from './local-storage.provider';

describe('LocalStorageProvider', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('builds a full absolute URL using the configured public site origin', () => {
    const provider = new LocalStorageProvider(
      new ConfigService({ PUBLIC_SITE_URL: 'http://127.0.0.1:3100' }),
    );

    expect(provider.getUrl('media/sample-image.png')).toBe(
      'http://127.0.0.1:3100/uploads/media/sample-image.png',
    );
  });

  it('falls back to localhost when no public site URL is configured', () => {
    const provider = new LocalStorageProvider(
      new ConfigService({ PORT: '3100' }),
    );

    expect(provider.getUrl('media/sample-image.png')).toBe(
      'http://localhost:3100/uploads/media/sample-image.png',
    );
  });

  it('ignores a file that has already been removed', async () => {
    const provider = new LocalStorageProvider(new ConfigService({}));
    const error = Object.assign(new Error('missing'), { code: 'ENOENT' });
    jest.spyOn(fs, 'unlink').mockRejectedValue(error);

    await expect(provider.delete('media/missing.png')).resolves.toBeUndefined();
  });

  it('logs and rethrows other file deletion errors', async () => {
    const provider = new LocalStorageProvider(new ConfigService({}));
    const error = Object.assign(new Error('permission denied'), {
      code: 'EACCES',
    });
    jest.spyOn(fs, 'unlink').mockRejectedValue(error);
    const loggerError = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation();

    await expect(provider.delete('media/protected.png')).rejects.toBe(error);
    expect(loggerError).toHaveBeenCalledWith(
      expect.stringContaining('permission denied'),
      error.stack,
    );
  });
});
