# Textbook library module contract

## Integration decisions

- Admin entry: `/admin/textbooks`, under the existing CMS content navigation.
- Public entry: `/library`; book detail: `/library/:slug`.
- Backend admin API: `/admin/textbooks`; public API: `/public/textbooks`.
- Public list response follows `{ items, meta }` pagination. List filters are
  `stage`, `grade`, `field`, `subject`, `year`, and `q`; supported ordering is
  `title`, `year`, and `sortOrder`.
- Public detail is addressed by slug. Public records and downloads expose only
  `PUBLISHED` books. Admin CRUD and publishing use existing CMS permissions.
- Records are site-scoped. Persian title, stage, grade, and subject are
  required; `field` is optional. Uploaded PDFs use a document-specific storage
  provider and never enter the image-only media API.
- Source types are `UPLOADED` and `EXTERNAL_LINK`. External links must use
  HTTPS and identify their attribution. Storage keys are never returned by
  public DTOs.
- Taxonomy values are held in a typed reference table (`stage`, `grade`,
  `field`, `subject`) so the admin can manage them without duplicating
  relationship models for each category.

## Data/API shape

`Textbook` stores UUID, site ID, title, slug, code, stage/grade/field/subject,
academic year, edition, page count, file size, SHA-256, cover and document
storage keys, source type/URL/attribution/license, draft/published/archived
status, sort order, download count, and timestamps. A taxonomy row stores its
type, Persian label, stable value, sort order, and timestamps. Download events
store the book ID, timestamp, and an optional one-way hash of the requester;
raw IP addresses are not persisted.

- `GET /public/textbooks?page=&limit=&stage=&grade=&field=&subject=&year=&q=`
- `GET /public/textbooks/:slug`
- `GET /public/textbooks/:slug/download` (supports byte ranges for uploaded
  files; external sources redirect only to validated HTTPS URLs)
- `GET/POST /admin/textbooks`, `GET/PATCH/DELETE /admin/textbooks/:id`
- `PATCH /admin/textbooks/:id/status`
- `POST /admin/textbooks/:id/file` (multipart field `file`, PDF only)
- `GET/POST/PATCH/DELETE /admin/textbooks/taxonomies`

Admin create/update DTOs use JSON fields; uploads are separate from metadata.
No crawler or third-party content fetcher is part of this module.

## Scope notes

This contract intentionally reuses the site's existing CMS permissions and
site scoping. The document storage adapter is swappable, while the initial
provider stores files under the configured local uploads directory. An
external official URL is stored as supplied after HTTPS validation; the module
does not mirror its contents.
