# Comprehensive Bug Audit Report
**Date**: 2026-11-07  
**Baseline**: Commit 36545b7 (design(teachers): brand palette + RTL + shadow refinement)  
**Scope**: Full-stack audit (Backend NestJS, Admin React, Frontend React)

## Executive Summary
- **Total Bugs Found**: 48
- **Critical**: 5
- **High**: 14  
- **Medium**: 16
- **Low**: 13

---

## CRITICAL BUGS (Must Fix Immediately)

### Backend

#### 1. Publishing Service - Missing Await on Async Transitions
- **File**: `backend/src/modules/website/core/publishing/publishing.service.ts:35`
- **Severity**: CRITICAL
- **Issue**: Multiple service files call `this.publishing.transition()` without awaiting it (pages.service.ts:299, events.service.ts:269, etc.). Events emit asynchronously but callers don't wait for completion.
- **Fix**: Make `transition()` properly async-aware; ensure all callers await or use event listeners.
- **Impact**: Events may not propagate; cache invalidation may fail silently.

#### 2. JWT Issuer Not Enforced in Verify Options
- **File**: `backend/src/modules/website/auth/website-auth.guard.ts:51`
- **Severity**: CRITICAL
- **Issue**: JWT verification doesn't pass `issuer` option to `jwt.verifyAsync()`. Issuer is validated manually after (line 59) but bypasses cryptographic enforcement.
- **Fix**: Add `issuer: this.expectedIssuer` to verifyAsync options.
- **Impact**: Issuer spoofing vulnerability; JWT tokens from other issuers may be accepted.

#### 3. Last Super-Admin Deactivation Race Condition
- **File**: `backend/src/modules/website/identity/admin-users/admin-users.service.ts:79-96`
- **Severity**: CRITICAL
- **Issue**: Count check (line 140-145) and update (line 99) are not atomic. Between them, another admin could be deleted, leaving zero super-admins.
- **Fix**: Wrap count check and update in a transaction or database constraint.
- **Impact**: System could lose all super-admins; recovery impossible without database access.

#### 4. RTL Transform Direction Bug in Mobile Drawer
- **File**: `admin/src/components/layout/AdminLayout.tsx:85`
- **Severity**: CRITICAL
- **Issue**: Mobile drawer uses `translate-x-full` for RTL (Persian). When closed, drawer should translate RIGHT (negative), not left (positive).
- **Current**: `mobileOpen ? "translate-x-0" : "translate-x-full"`
- **Fix**: Use `-translate-x-full` or logical properties for RTL.
- **Impact**: Mobile drawer animation broken for RTL; UI unusable on mobile.

#### 5. Duplicate Media Grid Label Creating Accessibility Issue
- **File**: `admin/src/features/cms/media/MediaGrid.tsx:81-82`
- **Severity**: CRITICAL
- **Issue**: Select-all label rendered twice ("انتخاب همه" as text + `<span>انتخاب همه</span>`). Creates dead/inaccessible text.
- **Fix**: Remove line 82 duplicate.
- **Impact**: Screen readers announce redundant text; visual clutter.

---

## HIGH SEVERITY BUGS (Fix This Sprint)

### Backend (4 High)

#### 6. Refresh Token Non-Atomic Rotation Race Condition
- **File**: `backend/src/modules/website/identity/auth/cms-refresh-token.service.ts:99-132`
- **Severity**: HIGH
- **Issue**: Between failed UPDATE (line 108) and SELECT (line 113), another process could revoke the token, causing incorrect grace period calculation.
- **Fix**: Use SELECT FOR UPDATE lock or transaction wrapping.
- **Impact**: Refresh token reuse window could misfire under high concurrency.

#### 7. Multiple Services Missing Await on Publishing Transitions
- **Files**: 
  - `backend/src/modules/website/content/pages/pages.service.ts:299`
  - `backend/src/modules/website/content/events/events.service.ts:269`
- **Severity**: HIGH
- **Issue**: Publishing transitions called without await. Event emission may not complete before method returns.
- **Fix**: Add `await` to all `this.publishing.transition()` calls.
- **Impact**: Cache invalidation may not occur; stale data served to frontend.

#### 8. Media Service Missing Null Check on File Upload
- **File**: `backend/src/modules/website/core/media/media.service.ts:44,54`
- **Severity**: HIGH
- **Issue**: File buffer checked (line 44) but `file.size` accessed (line 54) without verifying `file` exists. Malformed multer response could crash.
- **Fix**: Verify `file` object exists before accessing properties.
- **Impact**: Upload endpoint crashes on malformed requests; DoS vulnerability.

#### 9. CmsAuthController Refresh Route - Error Handling Leak
- **File**: `backend/src/modules/website/identity/auth/cms-auth.controller.ts:143-149`
- **Severity**: HIGH
- **Issue**: If `revoke()` throws during error handling, the error is not caught. Unhandled rejection possible.
- **Fix**: Wrap revoke in try-catch or use Promise.allSettled().
- **Impact**: Unhandled promise rejection crashes request handler.

### Admin (6 High)

#### 10. Stale Dependency in useTeachers Hook - Export Mismatch
- **File**: `admin/src/features/cms/teachers/hooks/useTeachers.ts:26-29`
- **Severity**: HIGH
- **Issue**: Imports `fetchTeacherList` (doesn't exist, should be `fetchTeachersList`), `ScheduleTeacherPayload` (not exported), `UpdateTeacherPayload` (not exported).
- **Fix**: Correct imports to match api.ts exports.
- **Impact**: TeacherList page doesn't render; import errors block entire module.

#### 11. TanStack Table v8 API Used Instead of v9
- **File**: `admin/src/features/cms/teachers/TeacherList.tsx:14-18`
- **Severity**: HIGH
- **Issue**: Uses v8 API: `useReactTable`, `getCoreRowModel`, `getSortedRowModel`, etc. Project uses v9 (`createCoreRowModel`, etc.).
- **Fix**: Update all imports to v9 API or downgrade package.
- **Impact**: TeacherList component doesn't compile; entire teachers module broken.

#### 12. Missing aria-label on Notification Button
- **File**: `admin/src/components/layout/AdminHeader.tsx:116`
- **Severity**: HIGH
- **Issue**: Notifications button has no click handler—it's a dead button. Either unfinished feature or broken state.
- **Fix**: Implement handler or disable the button.
- **Impact**: Confuses users; appears to be a feature but doesn't work.

#### 13. Social Links Use Index as Key in .map()
- **File**: `admin/src/features/cms/site-settings/SettingsForm.tsx:635`
- **Severity**: HIGH
- **Issue**: `links.map((link, index) => <div key={index}...>)` uses unstable keys. Adding/removing links causes re-renders and data loss.
- **Fix**: Use stable identifier: `key={`${link.platform}-${index}`}` or add ID field.
- **Impact**: Form data corruption when editing social links.

#### 14. Missing Keyboard Handling on Error Retry Button
- **File**: `admin/src/features/cms/audit-log/AuditLogPage.tsx:132`
- **Severity**: HIGH
- **Issue**: Retry button after error has no focus management. Users can't tab to it easily.
- **Fix**: Add `autoFocus` or manage focus via useEffect when error appears.
- **Impact**: Keyboard navigation broken after errors.

#### 15. Checkbox Aria-Label Not Unique
- **File**: `admin/src/features/cms/media/MediaCard.tsx:70`
- **Severity**: HIGH
- **Issue**: `aria-label={`Select ${media.altText}`}` doesn't uniquely identify which item. Screen reader says same thing for many items.
- **Fix**: Include media ID: `aria-label={`Select media: ${media.altText} (ID: ${media.id})`}`
- **Impact**: Screen reader users can't distinguish between similar items.

### Frontend (4 High)

#### 16. Skeleton Loader Keys Use Array Index
- **Files**:
  - `frontend/src/features/cms/audit-log/AuditLogPage.tsx:109-110`
  - `frontend/src/features/cms/dashboard/DashboardRecentActivity.tsx:53-54`
- **Severity**: HIGH
- **Issue**: `Array.from({ length: N }).map((_, index) => <li key={index}...)` uses unstable keys. If list length changes, keys collide.
- **Fix**: Generate stable keys: `key={`skeleton-${i}`}`.
- **Impact**: React reconciliation bugs; skeleton flickering/duplication.

#### 17. CommandPalette Missing Modal Trap Validation
- **File**: `frontend/src/features/cms/global-search/CommandPalette.tsx:102-113`
- **Severity**: HIGH
- **Issue**: Modal doesn't properly trap focus. Background overlay has no `role` attribute. Escape key might not close dialog from inner elements.
- **Fix**: Add `role="button"` to overlay; ensure Escape key handler is on dialog root.
- **Impact**: Keyboard and screen reader navigation broken in command palette.

#### 18. Hardcoded English Error Messages in Persian App
- **Files**:
  - `frontend/src/features/cms/dashboard/DashboardRecentActivity.tsx:38`
  - `frontend/src/features/cms/audit-log/AuditLogPage.tsx:132`
- **Severity**: HIGH
- **Issue**: Error messages hardcoded in English ("Something went wrong...") while entire app is Persian.
- **Fix**: Use Persian: "مشکلی پیش آمد. لطفاً دوباره تلاش کنید."
- **Impact**: i18n inconsistency; confusing for users.

#### 19. RTL Transform Direction Wrong in Drawer Animation
- **File**: `frontend/src/components/layout/AdminLayout.tsx:85` (same as admin)
- **Severity**: HIGH
- **Issue**: Mobile drawer animation uses `translate-x-full` (left) instead of `-translate-x-full` (right) for RTL.
- **Fix**: Use logical properties or condition on dir attribute.
- **Impact**: Mobile drawer doesn't animate smoothly; stuck off-screen.

---

## MEDIUM SEVERITY BUGS (Fix Next Sprint)

### Backend (4 Medium)

#### 20. Pagination Input Not Fully Validated
- **File**: `backend/src/modules/website/public-api/news/public-news.controller.ts:85-86`
- **Severity**: MEDIUM
- **Issue**: `page` and `limit` parameters only use `ParseIntPipe` with defaults. Negative or very large values not explicitly blocked.
- **Fix**: Add `@Min(0)` and `@Max(100)` decorators.
- **Impact**: Potential DoS via large pagination requests.

#### 21. N+1 Query Inconsistency in List Endpoints
- **File**: `backend/src/modules/website/public-api/news/public-news.controller.ts:134-136`
- **Severity**: MEDIUM
- **Issue**: Some endpoints batch-load media (`resolveMany()`); others may loop per-item. Inconsistent pattern.
- **Fix**: Audit all list endpoints; standardize on batch loading.
- **Impact**: Unpredictable performance; some endpoints scale badly.

#### 22. OrderingService Error Handling Missing
- **File**: `backend/src/modules/website/core/ordering/ordering.service.ts:18-27`
- **Severity**: MEDIUM
- **Issue**: `Promise.all()` updates don't validate all succeeded. If any fail, transaction may complete partially.
- **Fix**: Use `Promise.allSettled()` or check results.
- **Impact**: Some items may not reorder; data inconsistency.

#### 23. RevisionsService - Version Number Race Condition
- **File**: `backend/src/modules/website/core/revisions/revisions.service.ts:42-46`
- **Severity**: MEDIUM
- **Issue**: Version calculated as `(last?.versionNumber ?? 0) + 1` without lock. Concurrent calls could create same version.
- **Fix**: Use SELECT FOR UPDATE or database constraint.
- **Impact**: Version number collisions; revision history broken.

### Admin (6 Medium)

#### 24. useIsDirty Hook Dependency Issue
- **File**: `admin/src/hooks/useUnsavedChangesGuard.ts:28-31`
- **Severity**: MEDIUM
- **Issue**: `resetBaseline` callback has `JSON.stringify(values)` in dependency array. Breaks callback semantics; creates new callback on every render.
- **Fix**: Use `[values]` as dependency, not stringified version.
- **Impact**: useCallback loses memoization benefit; unnecessary re-renders.

#### 25. Unsafe Type Cast in reorder Mutation
- **File**: `admin/src/features/cms/teachers/hooks/useTeachers.ts:216`
- **Severity**: MEDIUM
- **Issue**: `byId.get(id)!` non-null assertion hides missing items. `filter(Boolean)` silently drops them, causing data loss during reorder.
- **Fix**: Validate all IDs exist; throw error if missing.
- **Impact**: Silent data loss during reorder operations.

#### 26. Missing Error Handling in MediaList Fetch
- **File**: `admin/src/features/cms/media/useMediaList.ts:44-55`
- **Severity**: MEDIUM
- **Issue**: Error cast `as ApiError` without validation. Non-ApiError exceptions crash when accessing `.message`.
- **Fix**: Use proper error normalization: `err instanceof ApiError ? err : new ApiError(...)`
- **Impact**: App crashes on network errors or unexpected exception types.

#### 27. SettingsForm Race Condition
- **File**: `admin/src/features/cms/site-settings/SettingsForm.tsx:584-589`
- **Severity**: MEDIUM
- **Issue**: `pendingBaselineReset` ref checked in useEffect. No guarantee save completes before component unmounts.
- **Fix**: Add mounted check or move logic outside effect.
- **Impact**: Memory leak warnings; stale state updates.

#### 28. RTL Layout Direction Not Context-Aware
- **File**: `admin/src/features/cms/teachers/TeacherForm.tsx:112`
- **Severity**: MEDIUM
- **Issue**: Form hardcodes `dir="rtl"` on container. Breaks if app needs LTR support; not context-driven.
- **Fix**: Read from locale context or config.
- **Impact**: Coupling; hard to add LTR support later.

#### 29. SEO Metadata Handling Inconsistent
- **File**: `admin/src/features/cms/teachers/schema.ts:104-117, 154-168`
- **Severity**: MEDIUM
- **Issue**: SEO object created only when "at least one sub-field set", but `noindex` is always included. Empty object created if only `noindex: false`.
- **Fix**: Exclude `noindex` from the check; only create object if truly needed.
- **Impact**: Sends unnecessary empty objects to backend; inconsistent data structure.

### Frontend (6 Medium)

#### 30. Media Upload Dialog Broken RTL Margin
- **File**: `frontend/src/features/cms/media/MediaUploadDialog.tsx:79`
- **Severity**: MEDIUM
- **Issue**: Uses hardcoded `file:mr-3` (margin-right) for file input. Breaks in RTL; should use `file:me-3` (margin-end).
- **Fix**: Replace `mr-3` with `me-3`.
- **Impact**: File input layout broken in RTL.

#### 31. Missing Loading State on Form Selects
- **File**: `admin/src/features/cms/site-settings/SettingsForm.tsx:642`
- **Severity**: MEDIUM
- **Issue**: Social platform select doesn't disable when `isSaving` is true. Other inputs do.
- **Fix**: Add `disabled={isSaving}` to select.
- **Impact**: Users can change select while saving; data inconsistency.

#### 32. Unsaved Changes Guard Missing React Hook Cleanup
- **File**: `admin/src/hooks/useUnsavedChangesGuard.ts`
- **Severity**: MEDIUM
- **Issue**: No cleanup on unmount. If component remounts, listeners may double-fire.
- **Fix**: Add useEffect cleanup returning unregister function.
- **Impact**: Multiple unsaved warnings on remount.

#### 33. Close Button Accessibility on Media Picker
- **File**: `admin/src/features/cms/site-settings/SettingsForm.tsx:343-355`
- **Severity**: MEDIUM
- **Issue**: Close button has no `aria-label`. Just shows text "بستن" (Close) without context.
- **Fix**: Add `aria-label="بستن پیکر رسانه"`.
- **Impact**: Screen readers don't announce purpose clearly.

#### 34. Active Command Result Not Bounds-Checked
- **File**: `frontend/src/features/cms/global-search/CommandPalette.tsx:54`
- **Severity**: MEDIUM
- **Issue**: `results[activeIndex]` accessed without bounds check. If results load after index set, could be undefined.
- **Fix**: Add bounds check or reset index when results change.
- **Impact**: Command palette crashes when results update mid-navigation.

#### 35. Notifications Button Dead/Unimplemented
- **File**: `frontend/src/components/layout/AdminHeader.tsx:116`
- **Severity**: MEDIUM
- **Issue**: Notifications button has no onclick or handler. Appears clickable but does nothing.
- **Fix**: Implement handler or disable button.
- **Impact**: User confusion; appears to be feature but broken.

---

## LOW SEVERITY BUGS (Fix When Possible)

### Backend (4 Low)

#### 36. Environment Variable Validation - Missing Optional Chain
- **File**: `backend/src/config/env-validation.config.ts:483`
- **Severity**: LOW
- **Issue**: `readFileSync(keyPath)` called without pre-checking `keyPath` is non-empty. Should validate before read.
- **Fix**: Add explicit non-empty check before file read.
- **Impact**: Unclear error messages on misconfiguration.

#### 37. Global Exception Filter - Missing Stack Trace in Dev
- **File**: `backend/src/modules/website/core/common/global-exception.filter.ts:113`
- **Severity**: LOW
- **Issue**: In non-production, error message included but not stack trace in response body. Harder to debug locally.
- **Fix**: Consider adding stack traces in dev mode (design choice).
- **Impact**: Slightly harder debugging; stack still in server logs.

#### 38. Missing Validation on Raw SQL Query
- **File**: Any service using QueryBuilder without parameter binding
- **Severity**: LOW
- **Issue**: If any raw SQL is used without parameterized queries, SQL injection possible.
- **Fix**: Audit all QueryBuilder usage; ensure parameterized queries.
- **Impact**: Potential SQL injection if user input reaches queries.

#### 39. Transaction Isolation Level Not Specified
- **File**: `backend/src/config/migration.config.ts`
- **Severity**: LOW
- **Issue**: Database transactions don't specify isolation level. Uses database default (READ COMMITTED in Postgres). May need SERIALIZABLE for consistency.
- **Fix**: Review transaction isolation requirements; set explicitly where needed.
- **Impact**: Under high concurrency, unexpected behavior possible.

### Admin (3 Low)

#### 40. Unused Import in Component Files
- **File**: Multiple (e.g., `admin/src/features/cms/media/MediaCard.tsx:1`)
- **Severity**: LOW
- **Issue**: Some imports declared but not used. Creates bundle bloat.
- **Fix**: Use eslint to identify and remove unused imports.
- **Impact**: Minor bundle size overhead.

#### 41. Inconsistent Boolean Casting in useGlobalSearch
- **File**: `admin/src/features/cms/global-search/useGlobalSearch.ts:96`
- **Severity**: LOW
- **Issue**: Uses `Boolean()` wrapper unnecessarily on line 96; inconsistent with line 92.
- **Fix**: Remove wrapper or standardize pattern.
- **Impact**: Code clarity only; no runtime impact.

#### 42. Missing Hydration Check in AdminLayout
- **File**: `admin/src/components/layout/AdminLayout.tsx:26-29`
- **Severity**: LOW
- **Issue**: `readInitialCollapsed()` called synchronously at mount. If running in SSR or no localStorage, could throw. No error handling.
- **Fix**: Wrap in try-catch; handle gracefully.
- **Impact**: Potential crash in SSR scenarios.

### Frontend (6 Low)

#### 43. Placeholder Text Not RTL-Safe
- **File**: `frontend/src/features/cms/media/MediaUploadDialog.tsx`
- **Severity**: LOW
- **Issue**: File input uses English placeholder "https://…" Should be bilingual or localized.
- **Fix**: Add Persian text guidance.
- **Impact**: UX clarity only.

#### 44. Keyboard Shortcut Display Hardcoded English
- **File**: `frontend/src/components/layout/AdminHeader.tsx:100`
- **Severity**: LOW
- **Issue**: Shows "Ctrl+K" in English. Acceptable for keyboard shortcuts but inconsistent with Persian UI.
- **Fix**: This is acceptable as-is (keyboard shortcuts are typically Latin).
- **Impact**: Minor i18n inconsistency.

#### 45. Error Message Not Localized
- **File**: Multiple error displays
- **Severity**: LOW
- **Issue**: Fallback errors sometimes English, sometimes Persian. Inconsistent i18n.
- **Fix**: Standardize all error messages to Persian.
- **Impact**: UX consistency.

#### 46. SelectAllCheckbox Missing aria-describedby
- **File**: `admin/src/components/ui/SelectAllCheckbox.tsx`
- **Severity**: LOW
- **Issue**: Checkbox in table context has no `aria-describedby`. Could link to description of what "select all" does.
- **Fix**: Add `aria-describedby` if description exists.
- **Impact**: Minor accessibility enhancement.

#### 47. Duplicate Text Rendering
- **File**: `admin/src/features/cms/media/MediaGrid.tsx:81-82`
- **Severity**: LOW
- **Issue**: Already covered as CRITICAL but also affects visual design.
- **Fix**: Already in critical list.
- **Impact**: Visual clutter.

#### 48. Form Input Missing Loading Disabled State
- **File**: Multiple form components
- **Severity**: LOW
- **Issue**: Some inputs disable during `isSaving`; others don't. Inconsistent UX.
- **Fix**: Standardize across all form inputs.
- **Impact**: UX inconsistency; minor.

---

## Recommended Fix Priority

### Phase 1 (This Week): CRITICAL + HIGH BLOCKER
1. Backend: JWT issuer validation (security)
2. Backend: Publishing transitions missing await (data consistency)
3. Backend: Last super-admin race condition (data integrity)
4. Admin: Fix TeacherList imports/TanStack Table API (unblocks build)
5. Admin: RTL drawer transform direction (mobile UX)
6. Frontend: RTL drawer transform (mobile UX)

### Phase 2 (Next Week): Remaining HIGH
7. Fix all error handling race conditions
8. Fix N+1 query inconsistencies
9. Fix keyboard navigation issues
10. Standardize error messages to Persian
11. Fix stale key usage in maps

### Phase 3 (Following Week): MEDIUM
- Fix race conditions (refresh token, super-admin, versions)
- Fix accessibility gaps (aria-labels, focus)
- Standardize RTL/LTR handling

### Phase 4 (Backlog): LOW
- Clean up unused imports
- Standardize i18n
- Enhance accessibility further

---

## Testing Recommendations

After fixes:
1. Run full TypeScript build: `npm run build` (backend & admin)
2. Run full test suite: `npm test`
3. Manual RTL testing on mobile (drawer, forms)
4. Accessibility audit with screen reader (NVDA/JAWS)
5. Security audit: JWT handling, SQL queries, CORS
6. Load testing: Pagination, concurrent requests
7. Regression testing: All CRUD operations per module

---

**Report Generated**: 2026-11-07  
**Auditors**: Automated QA Agents (Frontend, Admin, Backend)  
**Status**: Ready for implementation
