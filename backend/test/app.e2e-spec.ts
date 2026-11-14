import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as argon2 from 'argon2';
import { access, mkdir, rm } from 'fs/promises';
import type { Server } from 'http';
import type { AddressInfo } from 'net';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { DataSource, IsNull } from 'typeorm';
import { AppModule } from '../src/app.module';
import { WebsiteRole } from '../src/modules/website/auth/website-role.enum';
import { CmsAdminUser } from '../src/modules/website/identity/admin-users/entities/admin-user.entity';
import { CmsRefreshToken } from '../src/modules/website/identity/auth/entities/cms-refresh-token.entity';
import { hashRefreshToken } from '../src/modules/website/identity/auth/refresh-token-hash.util';
import { PublishStatus } from '../src/modules/website/core/publishing/publish-status.enum';
import {
  Textbook,
  TextbookSourceType,
} from '../src/modules/website/content/textbooks/entities/textbook.entity';
import { TextbooksService } from '../src/modules/website/content/textbooks/textbooks.service';

const PIXEL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);
const SAMPLE_PDF = Buffer.from('%PDF-1.4\n% e2e test file\n%%EOF\n', 'ascii');

interface E2eSession {
  accessToken: string;
  refreshToken: string;
}

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
  let readerId: string;
  let editorId: string;
  const adminEmail = `e2e-admin-${Date.now()}@example.com`;
  const adminPassword = 'e2e-integration-password';
  const readerEmail = `e2e-reader-${Date.now()}@example.com`;
  const editorEmail = `e2e-editor-${Date.now()}@example.com`;
  const readerPassword = 'e2e-reader-password';
  const editorPassword = 'e2e-editor-password';
  const sessions = new Map<string, E2eSession>();
  const textbookIds: string[] = [];
  const originalStorageEnvironment = {
    local: process.env.LOCAL_STORAGE_PATH,
    textbooks: process.env.TEXTBOOK_STORAGE_DIR,
  };

  async function signIn(email: string, password: string): Promise<E2eSession> {
    const cached = sessions.get(email);
    if (cached) return cached;

    const response = await fetch(`${baseUrl}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const body = (await response.json()) as { accessToken?: string };
    const refreshToken = cookieValue(response.headers, 'cms_refresh_token');
    expect(response.status).toBe(200);
    expect(body.accessToken).toEqual(expect.any(String));
    expect(refreshToken).toBeTruthy();

    const session = {
      accessToken: body.accessToken!,
      refreshToken: refreshToken!,
    };
    sessions.set(email, session);
    return session;
  }

  beforeAll(async () => {
    const requiredEnvironment = [
      'DATABASE_HOST',
      'DATABASE_NAME',
      'DATABASE_USER',
      'DATABASE_PASSWORD',
      'REDIS_HOST',
      'CMS_JWT_SECRET',
    ];
    const missing = requiredEnvironment.filter((key) => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(
        `Integration tests require configured services and environment variables: ${missing.join(', ')}`,
      );
    }

    storagePath = join(process.cwd(), `.nhg-backend-e2e-${randomUUID()}`);
    await mkdir(storagePath, { recursive: true });
    process.env.LOCAL_STORAGE_PATH = join(storagePath, 'media');
    process.env.TEXTBOOK_STORAGE_DIR = join(storagePath, 'textbooks');
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

    const reader = admins.create({
      email: readerEmail,
      passwordHash: await argon2.hash(readerPassword, {
        type: argon2.argon2id,
      }),
      role: WebsiteRole.SEO_MARKETING_MANAGER,
      isActive: true,
    });
    await admins.save(reader);
    readerId = reader.id;

    const editor = admins.create({
      email: editorEmail,
      passwordHash: await argon2.hash(editorPassword, {
        type: argon2.argon2id,
      }),
      role: WebsiteRole.CONTENT_EDITOR,
      isActive: true,
    });
    await admins.save(editor);
    editorId = editor.id;
  });

  afterAll(async () => {
    try {
      if (app) {
        const dataSource = app.get(DataSource);
        const textbooks = app.get(TextbooksService);
        const textbookRepository = dataSource.getRepository(Textbook);
        for (const id of textbookIds) {
          const activeTextbook = await textbookRepository.findOneBy({
            id,
            deletedAt: IsNull(),
          });
          if (activeTextbook) {
            await textbooks.remove(id);
          }
        }

        const refreshTokens = dataSource.getRepository(CmsRefreshToken);
        const admins = dataSource.getRepository(CmsAdminUser);
        for (const id of [adminId, readerId, editorId].filter(Boolean)) {
          await refreshTokens.delete({ adminId: id });
          await admins.delete({ id });
        }
      }
    } finally {
      await app?.close();
      if (originalStorageEnvironment.local === undefined) {
        delete process.env.LOCAL_STORAGE_PATH;
      } else {
        process.env.LOCAL_STORAGE_PATH = originalStorageEnvironment.local;
      }
      if (originalStorageEnvironment.textbooks === undefined) {
        delete process.env.TEXTBOOK_STORAGE_DIR;
      } else {
        process.env.TEXTBOOK_STORAGE_DIR = originalStorageEnvironment.textbooks;
      }
      if (storagePath) {
        await rm(storagePath, { recursive: true, force: true });
      }
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
    const settingsBody = (await settings.json()) as { siteName?: unknown };
    const newsBody = (await news.json()) as { items?: unknown };
    expect(settingsBody.siteName).toBeDefined();
    expect(Array.isArray(newsBody.items)).toBe(true);
  });

  it('rejects CMS access without a token and allows login, refresh, and permissioned reads', async () => {
    const denied = await fetch(`${baseUrl}/admin/news`);
    expect(denied.status).toBe(401);

    const session = await signIn(adminEmail, adminPassword);

    const refresh = await fetch(`${baseUrl}/admin/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: `cms_refresh_token=${session.refreshToken}` },
    });
    const refreshBody = (await refresh.json()) as { accessToken?: string };
    const rotatedRefreshToken = cookieValue(
      refresh.headers,
      'cms_refresh_token',
    );
    expect(refresh.status).toBe(200);
    expect(refreshBody.accessToken).toEqual(expect.any(String));
    expect(rotatedRefreshToken).toEqual(expect.any(String));
    expect(rotatedRefreshToken).not.toBe(session.refreshToken);
    sessions.set(adminEmail, {
      accessToken: refreshBody.accessToken!,
      refreshToken: rotatedRefreshToken!,
    });

    const replay = await fetch(`${baseUrl}/admin/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: `cms_refresh_token=${session.refreshToken}` },
    });
    expect(replay.status).toBe(401);

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
    const { accessToken } = await signIn(adminEmail, adminPassword);

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

  it('enforces textbook read/write/publish permissions and completes textbook PDF CRUD', async () => {
    const reader = await signIn(readerEmail, readerPassword);
    const editor = await signIn(editorEmail, editorPassword);
    const superAdmin = await signIn(adminEmail, adminPassword);
    const readableList = await fetch(`${baseUrl}/admin/textbooks`, {
      headers: { Authorization: `Bearer ${reader.accessToken}` },
    });
    expect(readableList.status).toBe(200);

    const testKey = randomUUID().replace(/-/g, '');
    const slug = `e2e-textbook-${testKey}`;
    const createBody = {
      title: { fa: 'کتاب آزمون یکپارچه', en: 'Integration textbook' },
      slug,
      code: `E2E-${testKey.slice(0, 8)}`,
      stage: 'secondary',
      grade: '10',
      subject: 'Mathematics',
      academicYear: '2026-2027',
      sourceType: TextbookSourceType.UPLOADED,
      sourceAttribution: 'E2E integration test',
    };
    const readerCreate = await fetch(`${baseUrl}/admin/textbooks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${reader.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createBody),
    });
    expect(readerCreate.status).toBe(403);

    const create = await fetch(`${baseUrl}/admin/textbooks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${editor.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createBody),
    });
    const textbook = (await create.json()) as { id?: string };
    expect(create.status).toBe(201);
    expect(textbook.id).toEqual(expect.any(String));
    const textbookId = textbook.id!;
    textbookIds.push(textbookId);

    const readerDelete = await fetch(
      `${baseUrl}/admin/textbooks/${textbookId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${reader.accessToken}` },
      },
    );
    expect(readerDelete.status).toBe(403);

    const updatedTitle = {
      fa: 'کتاب به‌روزشده',
      en: 'Updated integration textbook',
    };
    const update = await fetch(`${baseUrl}/admin/textbooks/${textbookId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${editor.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: updatedTitle, edition: 'Second edition' }),
    });
    expect(update.status).toBe(200);
    await expect(update.json()).resolves.toEqual(
      expect.objectContaining({ id: textbookId, title: updatedTitle }),
    );

    const getOne = await fetch(`${baseUrl}/admin/textbooks/${textbookId}`, {
      headers: { Authorization: `Bearer ${editor.accessToken}` },
    });
    expect(getOne.status).toBe(200);

    const form = new FormData();
    form.set(
      'file',
      new Blob([SAMPLE_PDF], { type: 'application/pdf' }),
      'integration.pdf',
    );
    const upload = await fetch(
      `${baseUrl}/admin/textbooks/${textbookId}/file`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${editor.accessToken}` },
        body: form,
      },
    );
    const uploaded = (await upload.json()) as {
      fileKey?: string;
      fileSize?: string;
      checksum?: string;
    };
    expect(upload.status).toBe(201);
    expect(uploaded.fileKey).toEqual(expect.any(String));
    expect(uploaded.fileSize).toBe(String(SAMPLE_PDF.length));
    expect(uploaded.checksum).toMatch(/^[a-f0-9]{64}$/);

    const filePath = join(process.env.TEXTBOOK_STORAGE_DIR!, uploaded.fileKey!);
    await expect(access(filePath)).resolves.toBeUndefined();

    const editorPublish = await fetch(
      `${baseUrl}/admin/textbooks/${textbookId}/status`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${editor.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: PublishStatus.PUBLISHED }),
      },
    );
    expect(editorPublish.status).toBe(403);

    const publish = await fetch(
      `${baseUrl}/admin/textbooks/${textbookId}/status`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${superAdmin.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: PublishStatus.PUBLISHED }),
      },
    );
    expect(publish.status).toBe(200);

    const download = await fetch(
      `${baseUrl}/public/textbooks/${slug}/download`,
    );
    expect(download.status).toBe(200);
    expect(download.headers.get('content-type')).toContain('application/pdf');
    expect(Buffer.from(await download.arrayBuffer())).toEqual(SAMPLE_PDF);

    const remove = await fetch(`${baseUrl}/admin/textbooks/${textbookId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${editor.accessToken}` },
    });
    expect(remove.status).toBe(200);
    await expect(access(filePath)).rejects.toMatchObject({ code: 'ENOENT' });

    const deleted = await fetch(`${baseUrl}/admin/textbooks/${textbookId}`, {
      headers: { Authorization: `Bearer ${editor.accessToken}` },
    });
    expect(deleted.status).toBe(404);
  });

  it('revokes an active refresh-token chain when a superseded token is replayed', async () => {
    const session = await signIn(editorEmail, editorPassword);
    const rotate = await fetch(`${baseUrl}/admin/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: `cms_refresh_token=${session.refreshToken}` },
    });
    expect(rotate.status).toBe(200);
    const replacementToken = cookieValue(rotate.headers, 'cms_refresh_token');
    expect(replacementToken).toEqual(expect.any(String));

    const tokenRepository = app!.get(DataSource).getRepository(CmsRefreshToken);
    const originalRow = await tokenRepository.findOneBy({
      tokenHash: hashRefreshToken(session.refreshToken),
    });
    expect(originalRow?.revokedAt).toBeInstanceOf(Date);
    await tokenRepository.update(
      { id: originalRow!.id },
      { revokedAt: new Date(Date.now() - 11_000) },
    );

    const replay = await fetch(`${baseUrl}/admin/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: `cms_refresh_token=${session.refreshToken}` },
    });
    expect(replay.status).toBe(401);

    const replacementReplay = await fetch(`${baseUrl}/admin/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: `cms_refresh_token=${replacementToken}` },
    });
    expect(replacementReplay.status).toBe(401);
  });

  it('revokes the presented refresh token on logout', async () => {
    const session = await signIn(adminEmail, adminPassword);
    const logout = await fetch(`${baseUrl}/admin/auth/logout`, {
      method: 'POST',
      headers: { Cookie: `cms_refresh_token=${session.refreshToken}` },
    });
    expect(logout.status).toBe(204);

    const refresh = await fetch(`${baseUrl}/admin/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: `cms_refresh_token=${session.refreshToken}` },
    });
    expect(refresh.status).toBe(401);
  });
});
