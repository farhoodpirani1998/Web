import { SitemapEntry } from './sitemap.service';

/**
 * Renders SitemapService entries as a sitemaps.org-compliant <urlset>
 * document (https://www.sitemaps.org/protocol.html). Pure function —
 * no DI, no I/O — so PublicSitemapController stays a thin HTTP wrapper
 * around SitemapService.generate() + this.
 */
export function buildSitemapXml(entries: SitemapEntry[], baseUrl: string): string {
  const normalizedBase = baseUrl.replace(/\/+$/, '');

  const urls = entries
    .map((entry) => {
      const loc = escapeXml(`${normalizedBase}${entry.loc}`);
      const lastmod = entry.lastmod
        ? `\n    <lastmod>${entry.lastmod.toISOString()}</lastmod>`
        : '';
      return `  <url>\n    <loc>${loc}</loc>${lastmod}\n  </url>`;
    })
    .join('\n');

  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    (urls ? `${urls}\n` : '') +
    '</urlset>\n'
  );
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
