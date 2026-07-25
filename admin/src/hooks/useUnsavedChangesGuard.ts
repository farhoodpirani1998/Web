import { useCallback, useEffect, useRef, useState } from "react";
import { useBlocker } from "react-router-dom";

/**
 * Detects whether a form's current values differ from their initial
 * snapshot, for `useUnsavedChangesGuard` below.
 *
 * Captures `values` on first render as the baseline (via `useRef`,
 * which only runs its initializer once), then compares by structural
 * equality (`JSON.stringify`) on every render after. Correctly
 * reports "not dirty" again once a save completes and the form is
 * re-initialized with the saved values from a fresh `key`/remount, or
 * if the caller explicitly re-baselines (see `resetBaseline`).
 *
 * `values` should be a plain, JSON-serializable snapshot of just the
 * form's persisted-field state (the values that would go into the
 * save payload) — not transient UI state like "is a picker dialog
 * open" or "is a save in flight", which would otherwise make the form
 * look dirty for reasons that have nothing to do with unsaved data.
 */
export function useIsDirty(values: unknown): {
  isDirty: boolean;
  resetBaseline: () => void;
} {
  const initialRef = useRef(values);
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialRef.current);

  const resetBaseline = useCallback(() => {
    initialRef.current = values;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(values)]);

  return { isDirty, resetBaseline };
}

export interface UnsavedChangesGuardResult {
  /** Whether the "discard unsaved changes?" confirm should be shown. */
  isConfirmOpen: boolean;
  /**
   * Wrap any action that would close/navigate away from the form
   * (e.g. a Cancel button's `onClick`) with this. Runs `action`
   * immediately if the form isn't dirty; otherwise holds it and opens
   * the confirm dialog.
   */
  guardedAction: (action: () => void) => void;
  /** "Discard changes" — runs the held action (or lets the in-app navigation proceed), then closes the dialog. */
  confirmLeave: () => void;
  /** "Keep editing" — cancels the held action (or the in-app navigation), then closes the dialog. */
  cancelLeave: () => void;
}

/**
 * Shared unsaved-changes protection for admin forms/dialogs.
 *
 * Given whether a form is currently dirty (see `useIsDirty` above),
 * this:
 *  - shows the browser's native confirmation prompt on tab close,
 *    refresh, or typed-URL navigation while dirty (`beforeunload`);
 *  - blocks in-app route changes (sidebar links, breadcrumbs, etc.)
 *    while dirty, via react-router's `useBlocker` — this app's router
 *    is a data router (`createBrowserRouter`, see `routes/index.tsx`),
 *    which `useBlocker` requires;
 *  - exposes `guardedAction` for the form's own Cancel button to call
 *    instead of its close handler directly, so an in-form cancel is
 *    guarded the same way as navigating away.
 *
 * Both the in-app-navigation case and the guarded-action case share
 * one confirm dialog: consumers render `<UnsavedChangesDialog>` (or
 * equivalent) when `isConfirmOpen` is true, wiring its two buttons to
 * `confirmLeave` / `cancelLeave`.
 *
 * Forms with no cancel/close action of their own (e.g.
 * `SettingsForm`'s always-visible sections, which save in place
 * rather than through a dismissible dialog) can use this hook for
 * just the `beforeunload`/in-app-navigation protection and never call
 * `guardedAction`.
 */
export function useUnsavedChangesGuard(isDirty: boolean): UnsavedChangesGuardResult {
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (!isDirty) return;

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      // Legacy requirement for some browsers to show the prompt.
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const shouldBlock = useCallback(
    ({
      currentLocation,
      nextLocation,
    }: {
      currentLocation: { pathname: string };
      nextLocation: { pathname: string };
    }) => isDirty && currentLocation.pathname !== nextLocation.pathname,
    [isDirty],
  );
  const blocker = useBlocker(shouldBlock);

  useEffect(() => {
    if (blocker.state === "blocked") {
      setPendingAction(() => () => blocker.proceed());
    }
    // `blocker` is a stable-shaped object from `useBlocker`; re-run
    // whenever its state transitions (e.g. "unblocked" -> "blocked").
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocker.state]);

  const guardedAction = useCallback(
    (action: () => void) => {
      if (isDirty) {
        setPendingAction(() => action);
      } else {
        action();
      }
    },
    [isDirty],
  );

  const confirmLeave = useCallback(() => {
    pendingAction?.();
    setPendingAction(null);
  }, [pendingAction]);

  const cancelLeave = useCallback(() => {
    if (blocker.state === "blocked") {
      blocker.reset();
    }
    setPendingAction(null);
  }, [blocker]);

  return {
    isConfirmOpen: pendingAction !== null,
    guardedAction,
    confirmLeave,
    cancelLeave,
  };
}
