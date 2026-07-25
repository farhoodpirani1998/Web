/**
 * Login page.
 *
 * Sprint 2.4B scope: the full login flow —
 *   submit credentials -> POST /admin/auth/login -> store token
 *   -> GET /admin/auth/me -> store admin -> redirect.
 *
 * The redirect itself isn't triggered from here: once `setCurrentAdmin`
 * runs, `useAuth()`'s derived status flips to `"authenticated"`, and
 * this route's `RedirectIfAuthenticated` wrapper (see
 * `routes/index.tsx`) re-renders and navigates away. That keeps the
 * "don't stay on /login when authenticated" rule in exactly one place
 * instead of duplicating a `navigate()` call here too.
 */
import { useId, useState, type FormEvent } from "react";

import { ApiError } from "@/lib/apiError";
import {
  clearAuth,
  fetchCurrentAdmin,
  login,
  setAccessToken,
  setCurrentAdmin,
} from "@/features/auth";

export function LoginPage() {
  const emailId = useId();
  const passwordId = useId();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { accessToken } = await login({ email, password });
      setAccessToken(accessToken);

      const admin = await fetchCurrentAdmin();
      setCurrentAdmin(admin);
    } catch (err) {
      // Reset to a clean, fully-logged-out state on any failure in this
      // flow (invalid credentials, or a token that somehow didn't
      // resolve to a valid admin) rather than leaving a token set with
      // no admin info.
      clearAuth();

      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again.",
      );
      setIsSubmitting(false);
    }
    // No `finally` for isSubmitting=false on the success path: once
    // `setCurrentAdmin` runs, this component is about to be replaced by
    // `RedirectIfAuthenticated`'s `<Navigate>` — leaving the button in
    // its submitting state avoids a flash of an interactive form right
    // before the redirect.
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 sm:p-8">
        <h1 className="text-2xl font-semibold text-slate-900">Admin Login</h1>
        <p className="mt-1 text-sm text-slate-600">
          Sign in with your CMS admin account.
        </p>

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-1.5">
            <label htmlFor={emailId} className="text-sm font-medium text-slate-900">
              Email
            </label>
            <input
              id={emailId}
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={isSubmitting}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor={passwordId} className="text-sm font-medium text-slate-900">
              Password
            </label>
            <input
              id={passwordId}
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isSubmitting}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 disabled:bg-slate-100"
            />
          </div>

          {error ? (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
