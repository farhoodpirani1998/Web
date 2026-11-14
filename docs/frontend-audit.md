# Frontend Audit Report — NHG Public Website

**Date**: 2026-11-05  
**Scope**: Phase 0 (read-only review) of professional frontend upgrade  
**Environment**: Production build (Vite) + dev server verification

---

## Executive Summary

The NHG frontend is a well-structured React 18 SPA with lazy-loaded routes, TypeScript strict mode, and RTL-first design (Persian). Core quality is solid: tests pass (17 tests), linting is clean, types check. **Bundle is lean** (~120KB gzip, excluding fonts). However, **critical SEO/a11y gaps exist** and can be closed with focused improvements (no large refactors needed).

### Key Findings

| Priority | Issue | Impact | Effort |
|----------|-------|--------|--------|
| 🔴 High | Missing robots.txt, sitemap.xml, structured data | SEO rankability | Low |
| 🔴 High | Font preload + font-display: swap (not optimal FCP) | Perf + CLS | Low |
| 🔴 High | No alt text on hero images (5 pages); no ARIA labels | a11y + SEO | Low |
| 🟡 Medium | No image optimization (webp, responsive sizes) | LCP + CLS | Medium |
| 🟡 Medium | Single HTML title (placeholder); no per-page metadata | SEO/UX | Low |
| 🟡 Medium | No preconnect to API; no prefetch for likely routes | Time to Interactive | Low |
| 🟠 Low | Heading hierarchy not validated (some h3 after h1) | a11y (scan needed) | Very Low |
| 🟠 Low | No reduced-motion test coverage | a11y spec | Very Low |

---

## Bundle Analysis

**Production Build** (dist/):
- **Total**: 3.1 MB (384 KB gzip, fonts 285 KB)
- **JS**: 364 KB → 119.6 KB gzipped
  - Main chunk: `index-B-DTrduT.js` (357 KB → 119.5 KB)
  - Lazy chunks: well-split by route (0.16–31 KB each)
- **CSS**: 40.47 KB → 8.12 KB (Tailwind)
- **Fonts** (self-hosted woff2):
  - Vazirmatn (4 weights): 202 KB
  - Estedad (1 weight): 80.67 KB

**Assessment**: Bundle is **healthy**. Lazy loading works well; no bloat detected. Font size is expected for Persian typology (no easy fix without subsetting).

---

## Performance & SEO Gaps

### 1. **SEO Infrastructure** (🔴 High Impact, Low Effort)

**Current State**:
- index.html has static title + meta description (placeholder chrome only)
- 4 pages set `robots: "index, follow"` in code; others inherit defaults
- **Missing**: robots.txt, sitemap.xml, canonical URLs, structured data (ld+json)
- **Per-page metadata**: comments indicate backend-sourced OG/title (Phase 2) but not implemented yet

**Risks**: 
- Search engines crawl with uncertainty; no sitemap to guide discovery
- OG tags missing → poor social shares
- No structured data → no rich snippets

**Fix** (Phase 1):
- Add `/public/robots.txt` → allow all routes except /admin
- Add `/public/sitemap.xml` → list main routes + detail pages (schemas can mock for now)
- Add meta preconnect to API in `index.html`
- Update Seo component to include canonical, og:image fallback

### 2. **Font Loading** (🔴 High Impact, Low Effort)

**Current State**:
- `font-display: swap` (good!)
- URLs: `/src/assets/fonts/vazirmatn-*.woff2` (via @font-face)
- No preload link in HTML
- No font subsetting

**Problem**: 
- First render paints system font until woff2 loads (FOUT); CLS risk if font metrics differ
- Swap strategy is correct but preload would reduce time-to-first-paint

**Fix** (Phase 1):
- Add `<link rel="preload" as="font" href="/src/assets/fonts/vazirmatn-regular.woff2" type="font/woff2" crossorigin>`
- Consider font-display: `optional` for heading font (Estedad) if used sparingly

### 3. **Image Handling** (🟡 Medium Impact, Medium Effort)

**Current State**:
- Images in `public/images/` (static) + media API (CMS content)
- No lazy loading observed
- No webp/responsive variants
- Alt text: **only 5 instances found** across 20+ pages

**Risk**: LCP delayed; CLS from unanchored images; a11y issues; no SEO via image alt

**Fix** (Phase 1):
- Create Image component: `<img loading="lazy" alt="..." />`
- Add alt text to hero images (HomePage, AboutPage, etc.) — each needs descriptive, concise text
- Scan all pages for missing alts

**Fix** (Phase 2):
- Generate webp versions alongside jpeg for CMS images (backend or via Vite plugin)
- Add responsive srcset for hero/banner images

### 4. **Accessibility** (🟡 Medium Impact, Low Effort)

**Current State**:
- `lang="fa" dir="rtl"` on html ✓
- Heading structure: not validated (mixed levels observed)
- **No ARIA labels** (role, aria-label) found in spot check
- Focus ring: likely Tailwind default (check actual UI)
- Keyboard nav: not tested

**Risk**: Screen reader users see unhelpful structure; keyboard-only users blocked on interactive elements

**Fix** (Phase 1):
- Validate heading hierarchy (h1 per page, sequential h2/h3/h4)
- Add `alt=""` to decorative images; descriptive alt to content images
- Audit interactive components (buttons, links, form inputs) for aria-label/role

**Fix** (Phase 2):
- Full keyboard nav test (tab, shift+tab, enter, esc)
- Test with screen reader (NVDA on Windows, Narrator)
- Ensure focus ring visible (contrast ≥ 3:1)

### 5. **RTL & Internationalization** (🟢 Good, Minor Gaps)

**Current State**:
- HTML correctly set `dir="rtl"`
- Tailwind config likely has RTL plugin
- Vazirmatn + Estedad fonts support Persian
- Some pages show Persian digits via `toPersianDigits()` utility

**Minor Issues**:
- List markers (ul/ol) in RTL may render wrong direction depending on browser
- Numbers in tables might not reverse properly

**Fix** (Phase 1):
- Test number rendering in tables, counts, statistics
- Ensure list bullets align right

### 6. **Test Coverage** (🟢 Baseline Present, Needs Expansion)

**Current Coverage**:
- 17 tests pass (5 test files):
  - Utilities: `cn.test.ts`, `formatDate.test.ts`, `toPersianDigits.test.ts`
  - Component: `Spinner.test.tsx`
  - API: `faq/api.test.ts`
- **Gaps**: No page-level tests, no integration tests, no a11y tests

**Fix** (Phase 2+):
- Add component tests for design-system (Button, Card, etc.)
- Add page-level smoke tests (HomePage, AboutPage render without crash)
- Add a11y tests (axe-core via vitest)

---

## Prioritized Action Plan

### Phase 1 (Speed & SEO) — Recommended First
1. ✅ Add robots.txt + sitemap.xml
2. ✅ Add font preload to index.html
3. ✅ Scan & add alt text to images (especially heroes)
4. ✅ Add meta preconnect to API
5. ✅ Heading hierarchy audit + fixes
6. ⏱️ Estimated: 3–4 hours

### Phase 2 (a11y & RTL)
1. ✅ Full a11y audit (ARIA, focus ring, keyboard nav)
2. ✅ RTL-specific number/list rendering
3. ✅ Add aria-label to interactive components
4. ⏱️ Estimated: 4–5 hours

### Phase 3 (UX & Polish)
1. ✅ Image optimization (webp, srcset)
2. ✅ Loading skeletons + error boundaries
3. ✅ Animations (prefers-reduced-motion respected ✓ already in place)
4. ✅ Responsive edge cases (mobile nav, forms)
5. ⏱️ Estimated: 6–8 hours

### Phase 4 (Tests)
1. ✅ Vitest + React Testing Library for pages
2. ✅ Playwright e2e for critical paths
3. ⏱️ Estimated: 5–6 hours

---

## Staging Core Web Vitals (Not Measured)

No real staging site URL or credentials are configured in this checkout: the local `.env`
uses `localhost`, and the staging hostnames in `docs/DEPLOYMENT.md` are examples. The
repository has no Lighthouse/Lighthouse CI dependency, executable, or CI job, and does not
deploy staging automatically. Therefore no staging run or field Core Web Vitals result is
available. The score ranges previously listed here were estimates, not measurements, and
are intentionally removed.

Once an approved staging site URL is available, set `STAGING_SITE_URL` to that exact HTTPS
URL (do not use a production URL, a placeholder, or a local build) and run from the
repository root in PowerShell:

```powershell
if (-not $env:STAGING_SITE_URL) { throw 'Set STAGING_SITE_URL to the approved staging URL.' }
npx --yes lighthouse@12 --version
npx --yes lighthouse@12 "$env:STAGING_SITE_URL" --only-categories=performance --output=json --output-path=".\lighthouse-staging-mobile.json"
npx --yes lighthouse@12 "$env:STAGING_SITE_URL" --only-categories=performance --preset=desktop --output=json --output-path=".\lighthouse-staging-desktop.json"
```

Keep the generated reports with the run date, exact URL, Lighthouse version, and device
profile. These are repeatable **lab** measurements (including LCP, CLS, and TBT); they do
not establish field Core Web Vitals or INP. Use real-user/CrUX field data for the 75th
percentile Core Web Vitals assessment (LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1), when
available for the staging origin. A local production build is not field data.

---

## Recommendations

### Start With
1. **robots.txt + sitemap.xml** (1 hour) — immediate SEO uplift
2. **Alt text sweep** (1–2 hours) — a11y + SEO
3. **Font preload** (15 min) — FCP improvement

### Then
4. Heading hierarchy + aria fixes (2 hours)
5. Image optimization via Vite plugin (2 hours)
6. Expand test coverage (8+ hours across phases)

### Skip For Now
- Bundle size reduction (already lean)
- Full rewrite of components (architecture is sound)
- Multi-language support (PWA scope; out of current phase)

---

## Notes

- **TypeScript**: Strict mode ✓, no errors
- **Linting**: ESLint clean ✓
- **RTL**: Core setup solid; minor rendering edge cases to verify
- **Dev/Build**: Fast, no warnings except legacy package deprecations
- **Admin Code**: Not reviewed per instructions (separate audit)

---

**Next**: Proceed to Phase 1 when approved. Estimated delivery: 2–3 days for all 4 phases.
