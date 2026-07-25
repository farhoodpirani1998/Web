import {
  readRefreshCookie,
  refreshCookieName,
  refreshCookieOptions,
  refreshTokenTtlMs,
  REFRESH_COOKIE_PATH,
} from './cms-refresh-cookie.util';

function fakeConfig(overrides: Record<string, string> = {}) {
  return {
    get: jest.fn((key: string) => overrides[key]),
  } as any;
}

describe('cms-refresh-cookie.util', () => {
  describe('readRefreshCookie', () => {
    it('finds the refresh cookie among several cookies', () => {
      const req = {
        headers: { cookie: 'other=1; cms_refresh_token=abc123; another=xyz' },
      } as any;

      expect(readRefreshCookie(req, fakeConfig())).toBe('abc123');
    });

    it('returns undefined when the cookie is absent', () => {
      const req = { headers: { cookie: 'other=1; another=xyz' } } as any;
      expect(readRefreshCookie(req, fakeConfig())).toBeUndefined();
    });

    it('returns undefined when there is no Cookie header at all', () => {
      const req = { headers: {} } as any;
      expect(readRefreshCookie(req, fakeConfig())).toBeUndefined();
    });

    it('respects a custom cookie name from config', () => {
      const req = { headers: { cookie: 'custom_name=xyz123' } } as any;
      expect(
        readRefreshCookie(req, fakeConfig({ CMS_REFRESH_COOKIE_NAME: 'custom_name' })),
      ).toBe('xyz123');
    });

    it('decodes a URI-encoded value', () => {
      const req = { headers: { cookie: 'cms_refresh_token=abc%2Fdef' } } as any;
      expect(readRefreshCookie(req, fakeConfig())).toBe('abc/def');
    });
  });

  describe('refreshCookieName', () => {
    it('falls back to "cms_refresh_token" when unset', () => {
      expect(refreshCookieName(fakeConfig())).toBe('cms_refresh_token');
    });
  });

  describe('refreshTokenTtlMs', () => {
    it('falls back to 30 days when unset', () => {
      expect(refreshTokenTtlMs(fakeConfig())).toBe(30 * 24 * 60 * 60 * 1000);
    });

    it('honors a configured day count', () => {
      expect(
        refreshTokenTtlMs(fakeConfig({ CMS_REFRESH_TOKEN_EXPIRES_IN_DAYS: '7' })),
      ).toBe(7 * 24 * 60 * 60 * 1000);
    });

    it('falls back to 30 days for a non-numeric or non-positive override', () => {
      expect(
        refreshTokenTtlMs(fakeConfig({ CMS_REFRESH_TOKEN_EXPIRES_IN_DAYS: 'not-a-number' })),
      ).toBe(30 * 24 * 60 * 60 * 1000);
      expect(
        refreshTokenTtlMs(fakeConfig({ CMS_REFRESH_TOKEN_EXPIRES_IN_DAYS: '-5' })),
      ).toBe(30 * 24 * 60 * 60 * 1000);
    });
  });

  describe('refreshCookieOptions', () => {
    it('is httpOnly, scoped to the auth path, and defaults to sameSite=lax', () => {
      const options = refreshCookieOptions(fakeConfig(), 1000);
      expect(options.httpOnly).toBe(true);
      expect(options.path).toBe(REFRESH_COOKIE_PATH);
      expect(options.sameSite).toBe('lax');
      expect(options.maxAge).toBe(1000);
    });

    it('defaults secure to true in production and false otherwise', () => {
      expect(refreshCookieOptions(fakeConfig({ NODE_ENV: 'production' }), 1000).secure).toBe(true);
      expect(refreshCookieOptions(fakeConfig({ NODE_ENV: 'development' }), 1000).secure).toBe(false);
    });

    it('lets CMS_REFRESH_COOKIE_SECURE override the NODE_ENV-derived default', () => {
      expect(
        refreshCookieOptions(
          fakeConfig({ NODE_ENV: 'development', CMS_REFRESH_COOKIE_SECURE: 'true' }),
          1000,
        ).secure,
      ).toBe(true);
      expect(
        refreshCookieOptions(
          fakeConfig({ NODE_ENV: 'production', CMS_REFRESH_COOKIE_SECURE: 'false' }),
          1000,
        ).secure,
      ).toBe(false);
    });

    it('lets CMS_REFRESH_COOKIE_SAMESITE override the default', () => {
      expect(
        refreshCookieOptions(fakeConfig({ CMS_REFRESH_COOKIE_SAMESITE: 'none' }), 1000).sameSite,
      ).toBe('none');
    });
  });
});
