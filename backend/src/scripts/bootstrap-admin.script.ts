import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as argon2 from 'argon2';
import { CmsAdminUser } from '../modules/website/identity/admin-users/entities/admin-user.entity';
import { WebsiteRole } from '../modules/website/auth/website-role.enum';

config();

/**
 * One-time bootstrap for the very first CMS Admin account, run
 * directly with ts-node/typeorm's runtime (see the `bootstrap:admin`
 * npm script) rather than through Nest's DI container — there is no
 * HTTP request, guard, or controller involved, so spinning up the
 * whole Nest application context would be pure overhead for a script
 * that runs once per environment.
 *
 * Deliberately minimal, matching this sprint's scope ("prepare for
 * first Super Admin creation... do not create full admin management
 * yet"): no CLI flags, no interactive prompts, no update/list/delete
 * path. It reads exactly three env vars, and refuses to run at all if
 * any admin row already exists — see the guard below.
 *
 * Uses `argon2` directly (the same algorithm/options as
 * `PasswordHasherService.hash`) rather than importing that service,
 * since pulling in a NestJS-decorated `@Injectable()` outside of a
 * Nest application context adds complexity for no benefit here; if
 * the hashing parameters in `PasswordHasherService` ever change,
 * update this call to match.
 *
 * Usage:
 *   CMS_BOOTSTRAP_ADMIN_EMAIL=admin@example.com \
 *   CMS_BOOTSTRAP_ADMIN_PASSWORD='a strong password' \
 *   npm run bootstrap:admin
 */
async function main(): Promise<void> {
  // Normalized (trimmed + lowercased) the same way `LoginDto` normalizes
  // login input (Sprint 2.3B) — this is what keeps a case-insensitive
  // login working correctly against a row created by this script.
  const email = process.env.CMS_BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.CMS_BOOTSTRAP_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'Set CMS_BOOTSTRAP_ADMIN_EMAIL and CMS_BOOTSTRAP_ADMIN_PASSWORD before running this script.',
    );
  }
  if (password.length < 12) {
    throw new Error('CMS_BOOTSTRAP_ADMIN_PASSWORD must be at least 12 characters.');
  }

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    entities: [CmsAdminUser],
  });
  await dataSource.initialize();

  try {
    const repo = dataSource.getRepository(CmsAdminUser);

    // Refuses to run once *any* admin exists — this is a first-run
    // bootstrap only, not a general "create an admin" tool. Creating
    // additional admins once one Super Admin exists is Sprint 2.3B
    // scope (an authenticated admin-management endpoint, gated by
    // CmsAuthGuard + a Super Admin check, not an unauthenticated script).
    const existingCount = await repo.count();
    if (existingCount > 0) {
      throw new Error(
        `Refusing to bootstrap: ${existingCount} admin_users row(s) already exist. ` +
          'This script only creates the very first Super Admin.',
      );
    }

    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
    const admin = repo.create({
      email,
      passwordHash,
      role: WebsiteRole.SUPER_ADMIN,
      isActive: true,
    });
    await repo.save(admin);

    console.log(`Created first CMS Super Admin: ${email}`);
  } finally {
    await dataSource.destroy();
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
