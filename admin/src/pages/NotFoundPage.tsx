/**
 * Not Found page.
 *
 * Rendered for any route that doesn't match the defined route tree
 * (the `*` wildcard route).
 */
export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <h1 className="text-2xl font-semibold text-slate-900">Not Found</h1>
    </div>
  );
}
