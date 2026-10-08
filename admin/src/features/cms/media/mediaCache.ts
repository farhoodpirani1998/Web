import type { CmsMedia } from "./types";

/**
 * In-memory cache of `CmsMedia` keyed by id, plus in-flight request
 * dedup — the shared piece every future content module needs to resolve
 * a `mediaId` to a thumbnail without a repeat network request (see the
 * Sprint 3.3 audit, §6 item 2: "a shared MediaPicker / useMediaById
 * piece … avoids seven near-identical N+1-fetch implementations
 * later").
 *
 * Same shape as `features/auth/authStore.ts` (plain module-level state
 * + `subscribe`/`emit`, not Redux/Zustand/Context) for the same reason
 * documented there: no state library dependency exists in this project
 * yet, and the actual need is simple enough not to warrant one.
 *
 * Deliberately in-memory only, same as `authStore` — cleared on a full
 * page reload. That's fine here: media rows can be edited/archived by
 * another admin at any time, so a cache that outlived a reload would
 * just be stale data with extra steps, not a real benefit.
 *
 * Not exported from `./index.ts`: this is an implementation detail of
 * `useMediaById`/`MediaPicker`, not something a module should read or
 * write directly. Consume it through `useMediaById` (`./useMediaById.ts`).
 */

let entries = new Map<string, CmsMedia>();
const pending = new Map<string, Promise<CmsMedia>>();

type Listener = () => void;
const listeners = new Set<Listener>();

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

/** Current cached entry for `id`, or `undefined` if not yet fetched. */
export function getCachedMedia(id: string): CmsMedia | undefined {
  return entries.get(id);
}

/** Stores/overwrites a media row in the cache (e.g. after a fetch or an edit). */
export function setCachedMedia(media: CmsMedia): void {
  entries = new Map(entries).set(media.id, media);
  emit();
}

/** Removes a media row from the cache (e.g. after `deleteMedia`). */
export function evictCachedMedia(id: string): void {
  if (!entries.has(id)) return;
  entries = new Map(entries);
  entries.delete(id);
  emit();
}

/** Snapshot for `useSyncExternalStore`-style consumers. */
export function getCachedMediaSnapshot(): Map<string, CmsMedia> {
  return entries;
}

export function subscribeToMediaCache(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Returns the in-flight fetch promise for `id` if one is already
 * running (so two components mounting with the same `mediaId` in the
 * same tick share one request), otherwise registers `factory`'s promise
 * as the in-flight one and returns it.
 */
export function dedupeMediaFetch(id: string, factory: () => Promise<CmsMedia>): Promise<CmsMedia> {
  const existing = pending.get(id);
  if (existing) return existing;

  const request = factory().finally(() => {
    pending.delete(id);
  });
  pending.set(id, request);
  return request;
}
