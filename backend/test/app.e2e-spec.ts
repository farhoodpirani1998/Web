import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as argon2 from 'argon2';
import { mkdtemp, rm } from 'fs/promises';
import type { Server } from 'http';
import type { AddressInfo } from 'net';
import { tmpdir } from 'os';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { WebsiteRole } from '../src/modules/website/auth/website-role.enum';
import { CmsAdminUser } from '../src/modules/website/identity/admin-users/entities/admin-user.entity';

const PIXEL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

function cookieValue(headers: Headers, name: string): string | null {
  const cookies =
    typeof headers.getSetCookie === 'function'
      ? headers.getSetCookie()
      : [headers.get('set-cookie')].filter((value): value is string =>
          Boolean(value),
        );
  for (const header of cookies) {
    const match = header.match(new RegExp(`(?:^|,\\s*)${name}=([^;]+)`));
    if (match) return match[1];
  }
  return null;
}

describe('Application integration', () => {
  let app: INestApplication | undefined;
  let baseUrl: string;
  let storagePath: string;
  let adminId: string;
  const adminEmail = `e2e-admin-${Date.now()}@example.com`;
  const adminPassword = 'e2e-integration-password';

  beforeAll(async () => {
    const requiredEnvironment = [
      'DATABASE_HOST',
      'DATABASE_NAME',
      'DATABASE_USER',
      'DATABASE_PASSWORD',
      'CMS_JWT_SECRET',
      'SMS_JWT_PUBLIC_KEY_PATH',
      'SMS_JWT_ISSUER',
    ];
    const missing = requiredEnvironment.filter((key) => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(
        `Integration tests require configured services and environment variables: ${missing.join(', ')}`,
      );
    }

    storagePath = await mkdtemp(join(tmpdir(), 'nhg-backend-e2e-'));
    process.env.LOCAL_STORAGE_PATH = storagePath;
    app = await NestFactory.create(AppModule, { logger: false });
    await app.listen(0, '127.0.0.1');

    const address = (app.getHttpServer() as Server).address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;

    const admins = app.get(DataSource).getRepository(CmsAdminUser);
    const admin = admins.create({
      email: adminEmail,
      passwordHash: await argon2.hash(adminPassword, { type: argon2.argon2id }),
      role: WebsiteRole.SUPER_ADMIN,
      isActive: true,
    });
    await admins.save(admin);
    adminId = admin.id;
  });

  afterAll(async () => {
    if (app && adminId) {
      await app
        .get(DataSource)
        .getRepository(CmsAdminUser)
        .delete({ id: adminId });
    }
    await app?.close();
    if (storagePath) {
      await rm(storagePath, { recursive: true, force: true });
    }
  });

  it('has applied TypeORM migrations', async () => {
    const rows = (await app!
      .get(DataSource)
      .query('SELECT COUNT(*)::int AS count FROM migrations')) as Array<{
      count: number;
    }>;
    expect(rows[0].count).toBeGreaterThan(0);
  });

  it('starts the application and reports PostgreSQL, Redis, and media storage healthy', async () => {
    const response = await fetch(`${baseUrl}/health`);
    const body = (await response.json()) as {
      status: string;
      info?: Record<string, { status: string }>;
    };

    expect(response.status).toBe(200);
    expect(body.status).toBe('ok');
    expect(body.info).toEqual(
      expect.objectContaining({
        database: { status: 'up' },
        redis: { status: 'up' },
        storage: { status: 'up' },
      }),
    );
  });

  it('serves the public content API without authentication', async () => {
    const settings = await fetch(`${baseUrl}/public/site-settings`);
    const news = await fetch(`${baseUrl}/public/news`);

    expect(settings.status).toBe(200);
    expect(news.status).toBe(200);
    await expect(settings.json()).resolves.toEqual(
      expect.objectContaining({ siteName: expect.anything() }),
    );
    await expect(news.json()).resolves.toEqual(
      expect.objectContaining({ items: expect.any(Array) }),
    );
  });

  it('rejects CMS access without a token and allows login, refresh, and permissioned reads', async () => {
    const denied = await fetch(`${baseUrl}/admin/news`);
    expect(denied.status).toBe(401);

    const login = await fetch(`${baseUrl}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password: adminPassword }),
    });
    const loginBody = (await login.json()) as { accessToken?: string };
    expect(login.status).toBe(200);
    expect(loginBody.accessToken).toEqual(expect.any(String));

    const refreshToken = cookieValue(login.headers, 'cms_refresh_token');
    expect(refreshToken).toBeTruthy();

    const refresh = await fetch(`${baseUrl}/admin/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: `cms_refresh_token=${refreshToken}` },
    });
    const refreshBody = (await refresh.json()) as { accessToken?: string };
    expect(refresh.status).toBe(200);
    expect(refreshBody.accessToken).toEqual(expect.any(String));

    const me = await fetch(`${baseUrl}/admin/auth/me`, {
      headers: { Authorization: `Bearer ${refreshBody.accessToken}` },
    });
    const identity = (await me.json()) as { permissions?: string[] };
    expect(me.status).toBe(200);
    expect(identity.permissions).toEqual(
      expect.arrayContaining(['website.content:read', 'website.media:manage']),
    );

    const news = await fetch(`${baseUrl}/admin/news`, {
      headers: { Authorization: `Bearer ${refreshBody.accessToken}` },
    });
    expect(news.status).toBe(200);
  });

  it('uploads an image through the CMS media endpoint', async () => {
    const login = await fetch(`${baseUrl}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: adminEmail, password: adminPassword }),
    });
    const { accessToken } = (await login.json()) as { accessToken: string };

    const form = new FormData();
    form.set('altText', 'e2e pixel');
    form.set('file', new Blob([PIXEL_PNG], { type: 'image/png' }), 'e2e.png');

    const upload = await fetch(`${baseUrl}/admin/media`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
      body: form,
    });
    const media = (await upload.json()) as { id?: string };
    expect(upload.status).toBe(201);
    expect(media.id).toEqual(expect.any(String));

    const purge = await fetch(`${baseUrl}/admin/media/${media.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect([200, 204]).toContain(purge.status);
  });
});
