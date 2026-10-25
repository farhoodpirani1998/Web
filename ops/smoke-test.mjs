#!/usr/bin/env node

const siteUrl = requireUrl('SITE_URL');
const adminUrl = requireUrl('ADMIN_URL');
const apiUrl = requireUrl('API_URL');
const corsOrigin = process.env.SMOKE_CORS_ORIGIN || siteUrl.origin;
const smokeEmail = process.env.CMS_SMOKE_EMAIL;
const smokePassword = process.env.CMS_SMOKE_PASSWORD;
const skipAuth = process.env.SMOKE_SKIP_AUTH === '1';

const PIXEL_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

let failed = false;

function requireUrl(name) {
  const raw = process.env[name];
  if (!raw) {
    console.error(`Set ${name} before running the smoke test.`);
    process.exit(2);
  }
  return new URL(raw);
}

function fail(message) {
  failed = true;
  console.error(`FAIL ${message}`);
}

function pass(message) {
  console.log(`PASS ${message}`);
}

async function request(url, init = {}) {
  return fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(15_000),
    ...init,
  });
}

function assertHttps(name, url) {
  if (url.protocol !== 'https:') {
    fail(`${name}: expected https (got ${url.protocol})`);
    return;
  }
  pass(`${name}: TLS URL ${url.origin}`);
}

async function checkHtml(name, url) {
  try {
    const response = await request(url);
    if (!response.ok) {
      fail(`${name}: HTTP ${response.status} (${url.href})`);
      return;
    }
    // The edge must actually be serving the header snippets in Caddyfile —
    // a config that builds but was never reloaded looks identical to a
    // hardened one until something checks the bytes on the wire.
    const headers = response.headers;
    const hsts = headers.get('strict-transport-security');
    const csp = headers.get('content-security-policy');
    const frameOptions = headers.get('x-frame-options');
    const nosniff = headers.get('x-content-type-options');
    const missing = [
      hsts && /max-age=\d{6,}/i.test(hsts) ? null : 'Strict-Transport-Security (max-age >= 6 digits)',
      csp ? null : 'Content-Security-Policy',
      frameOptions ? null : 'X-Frame-Options',
      nosniff ? null : 'X-Content-Type-Options',
    ].filter(Boolean);
    if (missing.length > 0) {
      fail(`${name}: HTTP ${response.status} but missing security headers: ${missing.join(', ')}`);
      return;
    }
    pass(
      `${name}: HTTP ${response.status}; HSTS max-age=${/max-age=(\d+)/i.exec(hsts)?.[1]}; CSP ${csp.length} chars; XFO=${frameOptions}; nosniff`,
    );
  } catch (error) {
    fail(`${name}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function checkHealth() {
  const url = new URL('/health', apiUrl);
  try {
    const response = await request(url);
    const health = await response.json().catch(() => ({}));
    if (!response.ok) {
      fail(`health: HTTP ${response.status}`);
      return;
    }
    if (
      health.status !== 'ok' ||
      Object.values(health.info ?? {}).some((dependency) => dependency.status !== 'up')
    ) {
      fail('health: one or more dependencies are unhealthy');
      return;
    }
    const hsts = response.headers.get('strict-transport-security');
    if (apiUrl.protocol === 'https:' && !hsts) {
      fail('health: missing Strict-Transport-Security on HTTPS API');
      return;
    }
    pass('health: ok (database, redis, storage)');
  } catch (error) {
    fail(`health: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function checkCors() {
  const url = new URL('/public/site-settings', apiUrl);
  try {
    const response = await request(url, {
      method: 'OPTIONS',
      headers: {
        Origin: corsOrigin,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'authorization,content-type',
      },
    });
    const allowOrigin = response.headers.get('access-control-allow-origin');
    if (response.status >= 400) {
      fail(`CORS preflight: HTTP ${response.status}`);
      return;
    }
    // A wildcard is a failure, not an acceptable answer. This API issues
    // credentialed requests (the CMS refresh cookie), and the browser rejects
    // `Access-Control-Allow-Origin: *` for credentialed calls outright — so
    // accepting `*` here meant the go-live gate passed a configuration that
    // the admin app cannot actually use, while hiding a genuinely open policy.
    if (allowOrigin === '*') {
      fail('CORS preflight: Allow-Origin is "*" — no credentialed request can rely on it, and an open allow-list in production is the finding this check exists to catch');
      return;
    }
    if (allowOrigin !== corsOrigin) {
      fail(`CORS preflight: Allow-Origin ${allowOrigin ?? '(missing)'} (expected ${corsOrigin})`);
      return;
    }
    pass(`CORS preflight: ${allowOrigin}`);
  } catch (error) {
    fail(`CORS: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function checkPublicApi() {
  const paths = ['/public/site-settings', '/public/news', '/public/hero'];
  for (const path of paths) {
    const url = new URL(path, apiUrl);
    try {
      const response = await request(url, { headers: { Origin: corsOrigin } });
      if (!response.ok) {
        fail(`public API ${path}: HTTP ${response.status}`);
        continue;
      }
      pass(`public API ${path}: HTTP ${response.status}`);
    } catch (error) {
      fail(`public API ${path}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

function cookieFromSetCookie(headers, name) {
  const cookies =
    typeof headers.getSetCookie === 'function' ? headers.getSetCookie() : [headers.get('set-cookie')].filter(Boolean);
  for (const header of cookies) {
    if (!header) continue;
    const match = header.match(new RegExp(`(?:^|,\\s*)${name}=([^;]+)`));
    if (match) return match[1];
  }
  return null;
}

async function checkAuthAndUpload() {
  if (skipAuth) {
    console.log('SKIP auth/refresh/CMS/upload (SMOKE_SKIP_AUTH=1)');
    return;
  }
  if (!smokeEmail || !smokePassword) {
    fail('auth: set CMS_SMOKE_EMAIL and CMS_SMOKE_PASSWORD (or SMOKE_SKIP_AUTH=1)');
    return;
  }

  let accessToken;
  let refreshCookie;

  try {
    const login = await request(new URL('/admin/auth/login', apiUrl), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: corsOrigin,
      },
      body: JSON.stringify({ email: smokeEmail, password: smokePassword }),
    });
    const body = await login.json().catch(() => ({}));
    if (!login.ok || !body.accessToken) {
      fail(`login: HTTP ${login.status}`);
      return;
    }
    accessToken = body.accessToken;
    refreshCookie = cookieFromSetCookie(login.headers, 'cms_refresh_token');
    if (!refreshCookie) {
      fail('login: missing cms_refresh_token cookie');
      return;
    }
    pass('login: access token issued');
  } catch (error) {
    fail(`login: ${error instanceof Error ? error.message : String(error)}`);
    return;
  }

  try {
    const refresh = await request(new URL('/admin/auth/refresh', apiUrl), {
      method: 'POST',
      headers: {
        Origin: corsOrigin,
        Cookie: `cms_refresh_token=${refreshCookie}`,
      },
    });
    const body = await refresh.json().catch(() => ({}));
    if (!refresh.ok || !body.accessToken) {
      fail(`refresh: HTTP ${refresh.status}`);
    } else {
      accessToken = body.accessToken;
      pass('refresh: rotated access token');
    }
  } catch (error) {
    fail(`refresh: ${error instanceof Error ? error.message : String(error)}`);
  }

  const authHeaders = {
    Authorization: `Bearer ${accessToken}`,
    Origin: corsOrigin,
  };

  try {
    const denied = await request(new URL('/admin/news', apiUrl));
    if (denied.status !== 401) {
      fail(`CMS permissions: unauthenticated /admin/news returned HTTP ${denied.status}`);
    } else {
      pass('CMS permissions: unauthenticated list is 401');
    }

    const me = await request(new URL('/admin/auth/me', apiUrl), { headers: authHeaders });
    const identity = await me.json().catch(() => ({}));
    if (!me.ok || !Array.isArray(identity.permissions) || identity.permissions.length === 0) {
      fail(`CMS permissions: /admin/auth/me HTTP ${me.status}`);
    } else {
      pass(`CMS permissions: ${identity.role} (${identity.permissions.length} permissions)`);
    }

    const news = await request(new URL('/admin/news', apiUrl), { headers: authHeaders });
    if (!news.ok) {
      fail(`CMS permissions: authenticated /admin/news HTTP ${news.status}`);
    } else {
      pass('CMS permissions: authenticated news list');
    }
  } catch (error) {
    fail(`CMS permissions: ${error instanceof Error ? error.message : String(error)}`);
  }

  try {
    const form = new FormData();
    form.set('altText', 'smoke-test pixel');
    form.set('file', new Blob([PIXEL_PNG], { type: 'image/png' }), 'smoke.png');
    const upload = await request(new URL('/admin/media', apiUrl), {
      method: 'POST',
      headers: authHeaders,
      body: form,
    });
    const media = await upload.json().catch(() => ({}));
    if (!upload.ok || !media.id) {
      fail(`upload: HTTP ${upload.status}`);
      return;
    }
    pass(`upload: media ${media.id}`);

    const purge = await request(new URL(`/admin/media/${media.id}`, apiUrl), {
      method: 'DELETE',
      headers: authHeaders,
    });
    if (!purge.ok && purge.status !== 204) {
      fail(`upload cleanup: HTTP ${purge.status}`);
    }
  } catch (error) {
    fail(`upload: ${error instanceof Error ? error.message : String(error)}`);
  }
}

assertHttps('public site', siteUrl);
assertHttps('admin application', adminUrl);
assertHttps('backend API', apiUrl);
await checkHtml('public site', siteUrl);
await checkHtml('admin application', adminUrl);
await checkHealth();
await checkCors();
await checkPublicApi();
await checkAuthAndUpload();

if (failed) process.exit(1);
console.log('Smoke test passed.');
