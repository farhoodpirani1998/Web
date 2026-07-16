import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
  validateSync,
} from 'class-validator';
import { existsSync, readFileSync } from 'fs';

enum NodeEnvironment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

enum StorageDriver {
  Local = 'local',
  S3 = 's3',
}

/**
 * Shape of every environment variable this backend reads anywhere in the
 * app (see app.module.ts, data-source.ts, website-auth.guard.ts, and the
 * media module's storage providers). This class only describes and
 * validates that shape — it doesn't change how any of those places
 * consume the values once ConfigModule/`process.env` hands them out.
 */
class EnvironmentVariables {
  @IsOptional()
  @IsEnum(NodeEnvironment)
  NODE_ENV: NodeEnvironment = NodeEnvironment.Development;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 3100;

  // --- Database (see app.module.ts / data-source.ts) ---
  @IsString()
  @IsNotEmpty()
  DATABASE_HOST!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  DATABASE_PORT: number = 5432;

  @IsString()
  @IsNotEmpty()
  DATABASE_NAME!: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_USER!: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_PASSWORD!: string;

  // Shape only ("true" / "false" / unset). Whether synchronize is
  // actually *safe* to enable (e.g. never in production) is
  // resolveDatabaseSynchronize()'s job, not this validator's — that
  // business rule is left untouched.
  @IsOptional()
  @IsIn(['true', 'false'])
  DATABASE_SYNCHRONIZE?: string;

  // --- SMS identity trust (see website-auth.guard.ts) ---
  @IsString()
  @IsNotEmpty()
  SMS_JWT_PUBLIC_KEY_PATH!: string;

  @IsString()
  @IsNotEmpty()
  SMS_JWT_ISSUER!: string;

  // --- Object storage (see media/media.module.ts + storage providers) ---
  @IsOptional()
  @IsEnum(StorageDriver)
  STORAGE_DRIVER: StorageDriver = StorageDriver.Local;

  @ValidateIf((env: EnvironmentVariables) => env.STORAGE_DRIVER === StorageDriver.S3)
  @IsString()
  @IsNotEmpty()
  S3_BUCKET?: string;

  @ValidateIf((env: EnvironmentVariables) => env.STORAGE_DRIVER === StorageDriver.S3)
  @IsString()
  @IsNotEmpty()
  S3_ACCESS_KEY_ID?: string;

  @ValidateIf((env: EnvironmentVariables) => env.STORAGE_DRIVER === StorageDriver.S3)
  @IsString()
  @IsNotEmpty()
  S3_SECRET_ACCESS_KEY?: string;

  // Optional even under the S3 driver: S3CompatibleStorageProvider falls
  // back to the AWS virtual-hosted URL when unset and defaults region to
  // "auto" — this validator doesn't second-guess that.
  @IsOptional()
  @IsString()
  S3_ENDPOINT?: string;

  @IsOptional()
  @IsString()
  S3_REGION?: string;

  @IsOptional()
  @IsString()
  LOCAL_STORAGE_PATH?: string;

  // --- Trust proxy (see main.ts) ---
  // "true"/"false", a hop count (e.g. "1"), or a comma-separated list of
  // specific IPs/CIDR ranges/keywords (e.g. "loopback,linklocal"). Left
  // unset, main.ts falls back to `false` (express's own default,
  // unchanged).
  @IsOptional()
  @IsString()
  TRUST_PROXY?: string;

  // --- CORS (see main.ts) ---
  // Comma-separated allow-list, e.g. "https://nhg.example,https://admin.nhg.example".
  // Left unset, main.ts falls back to "*" (today's default, unchanged).
  @IsOptional()
  @IsString()
  CORS_ALLOWED_ORIGINS?: string;

  // --- Request payload limits (see main.ts) ---
  // Byte ceiling for a single JSON/urlencoded request body, enforced by
  // express's body parsers before any controller or ValidationPipe runs.
  // Optional; each falls back to a 1 MiB default (1_048_576 bytes) when
  // unset, so behavior is unchanged until a deployment opts in.
  @IsOptional()
  @IsInt()
  @Min(1)
  BODY_LIMIT_JSON_BYTES?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  BODY_LIMIT_URLENCODED_BYTES?: number;

  // --- Public site (see public-api/sitemap/public-sitemap.controller.ts) ---
  // Absolute origin (no trailing slash) the public site is served at,
  // e.g. "https://nedayehaghighat.example". Used only to turn each
  // SitemapService entry's relative `loc` (e.g. "/news/some-article")
  // into the absolute URL /sitemap.xml requires. Left unset, it falls
  // back to "http://localhost:{PORT}" — fine for local development,
  // but should always be set explicitly in any real deployment.
  @IsOptional()
  @IsString()
  PUBLIC_SITE_URL?: string;

  // --- Redis (see core/redis/redis.module.ts) ---
  // Connection for RedisService's single shared client. All optional
  // with dev-friendly defaults (a local Redis on its standard port,
  // no auth, db 0) — same reasoning STORAGE_DRIVER/local defaults to
  // "just works" without configuration, unlike DATABASE_* which has no
  // safe default and is required.
  @IsOptional()
  @IsString()
  REDIS_HOST?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  REDIS_PORT?: number;

  @IsOptional()
  @IsString()
  REDIS_PASSWORD?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  REDIS_DB?: number;

  @IsOptional()
  @IsIn(['true', 'false'])
  REDIS_TLS?: string;

  // --- Rate limiting (see app.module.ts / public-api/common/public-rate-limit.constants.ts) ---
  // All optional; each falls back to today's hardcoded value when unset,
  // so behavior is unchanged until a deployment opts in by setting one.
  // TTL is the throttling window in milliseconds; LIMIT is the max
  // requests allowed within that window.
  @IsOptional()
  @IsInt()
  @Min(1)
  THROTTLE_DEFAULT_TTL_MS?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  THROTTLE_DEFAULT_LIMIT?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  THROTTLE_PUBLIC_TTL_MS?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  THROTTLE_PUBLIC_LIMIT?: number;

  // Stricter profile for any public endpoint that accepts user input
  // (see PUBLIC_FORM_THROTTLE) rather than only serving cached reads.
  @IsOptional()
  @IsInt()
  @Min(1)
  THROTTLE_PUBLIC_FORM_TTL_MS?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  THROTTLE_PUBLIC_FORM_LIMIT?: number;
}

/**
 * Passed as `ConfigModule.forRoot({ validate })` in app.module.ts. Runs
 * once, synchronously, as part of evaluating that `forRoot()` call —
 * before any other provider (the TypeORM connection, the SMS JWT guard,
 * the storage providers) gets a chance to read `process.env` or
 * ConfigService itself. A missing or malformed variable fails startup
 * immediately with one readable list, instead of surfacing later as a
 * raw ENOENT, a TypeORM connection error, or a `getOrThrow` "not found"
 * deep inside some provider's constructor.
 */
export function validateEnvironment(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, { skipMissingProperties: false });
  const messages = errors.flatMap((error) => Object.values(error.constraints ?? {}));

  // Shape is valid at this point; confirming the JWT public key actually
  // exists and looks like a PEM key needs the filesystem, not a
  // class-validator decorator, so it runs as a separate step.
  if (messages.length === 0) {
    messages.push(...validateSmsPublicKey(validatedConfig.SMS_JWT_PUBLIC_KEY_PATH));
  }

  if (messages.length > 0) {
    throw new Error(
      `Invalid environment configuration:\n${messages.map((m) => `  - ${m}`).join('\n')}`,
    );
  }

  return validatedConfig;
}

function validateSmsPublicKey(keyPath: string): string[] {
  if (!existsSync(keyPath)) {
    return [`SMS_JWT_PUBLIC_KEY_PATH does not point to an existing file: "${keyPath}"`];
  }
  try {
    const contents = readFileSync(keyPath, 'utf8');
    if (!contents.includes('BEGIN PUBLIC KEY') && !contents.includes('BEGIN RSA PUBLIC KEY')) {
      return [`SMS_JWT_PUBLIC_KEY_PATH ("${keyPath}") does not look like a PEM public key`];
    }
  } catch (err) {
    return [
      `SMS_JWT_PUBLIC_KEY_PATH ("${keyPath}") could not be read: ${(err as Error).message}`,
    ];
  }
  return [];
}
