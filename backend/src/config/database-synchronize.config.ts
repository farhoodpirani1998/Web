/**
 * Resolves the TypeORM `synchronize` flag in a production-safe way.
 *
 * synchronize=true lets TypeORM auto-alter the schema to match entities.
 * That's convenient in local dev but destructive against a real database
 * (it can drop/alter columns and tables), so it must never run in production
 * — regardless of what DATABASE_SYNCHRONIZE is set to.
 *
 * Behavior:
 * - DATABASE_SYNCHRONIZE unset -> defaults to "on" outside production, "off" in production.
 * - DATABASE_SYNCHRONIZE set   -> must be the literal string "true" or "false" (case-insensitive);
 *   any other value fails startup loudly instead of silently falling back.
 * - Final safety net: if the resolved value is ever `true` while NODE_ENV=production,
 *   startup fails instead of allowing synchronize to run.
 */
export function resolveDatabaseSynchronize(): boolean {
  const nodeEnv = process.env.NODE_ENV;
  const isProduction = nodeEnv === 'production';
  const raw = process.env.DATABASE_SYNCHRONIZE;

  let synchronize: boolean;

  if (raw === undefined || raw.trim() === '') {
    synchronize = !isProduction;
  } else {
    const normalized = raw.trim().toLowerCase();
    if (normalized === 'true') {
      synchronize = true;
    } else if (normalized === 'false') {
      synchronize = false;
    } else {
      throw new Error(
        `Invalid DATABASE_SYNCHRONIZE value "${raw}". Expected "true" or "false".`,
      );
    }
  }

  if (synchronize && isProduction) {
    throw new Error(
      'Refusing to start: TypeORM synchronize would be enabled while NODE_ENV=production. ' +
        'Set DATABASE_SYNCHRONIZE=false (or unset it) in production and manage schema changes ' +
        'via migrations (npm run migration:run) instead.',
    );
  }

  return synchronize;
}
