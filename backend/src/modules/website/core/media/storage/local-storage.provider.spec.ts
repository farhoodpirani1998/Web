import { ConfigService } from '@nestjs/config';
import { LocalStorageProvider } from './local-storage.provider';

describe('LocalStorageProvider', () => {
  it('builds a full absolute URL using the configured public site origin', () => {
    const provider = new LocalStorageProvider(
      new ConfigService({ PUBLIC_SITE_URL: 'http://127.0.0.1:3100' }),
    );

    expect(provider.getUrl('media/sample-image.png')).toBe(
      'http://127.0.0.1:3100/uploads/media/sample-image.png',
    );
  });

  it('falls back to localhost when no public site URL is configured', () => {
    const provider = new LocalStorageProvider(new ConfigService({ PORT: '3100' }));

    expect(provider.getUrl('media/sample-image.png')).toBe(
      'http://localhost:3100/uploads/media/sample-image.png',
    );
  });
});
