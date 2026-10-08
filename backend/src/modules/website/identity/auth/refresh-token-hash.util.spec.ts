import { generateRefreshToken, hashRefreshToken } from './refresh-token-hash.util';

describe('refresh-token-hash.util', () => {
  describe('generateRefreshToken', () => {
    it('generates a URL-safe token with no padding characters', () => {
      const token = generateRefreshToken();
      expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it('generates a different token on every call', () => {
      const a = generateRefreshToken();
      const b = generateRefreshToken();
      expect(a).not.toBe(b);
    });
  });

  describe('hashRefreshToken', () => {
    it('is deterministic for the same input', () => {
      const token = generateRefreshToken();
      expect(hashRefreshToken(token)).toBe(hashRefreshToken(token));
    });

    it('produces different hashes for different tokens', () => {
      expect(hashRefreshToken('token-a')).not.toBe(hashRefreshToken('token-b'));
    });

    it('never returns the raw input', () => {
      const token = 'some-raw-token';
      expect(hashRefreshToken(token)).not.toBe(token);
    });

    it('produces a 64-character hex digest (SHA-256)', () => {
      expect(hashRefreshToken('anything')).toMatch(/^[0-9a-f]{64}$/);
    });
  });
});
