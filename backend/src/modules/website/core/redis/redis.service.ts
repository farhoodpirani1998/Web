import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * Thin wrapper around a single ioredis connection, read from
 * REDIS_HOST/REDIS_PORT/... (see env-validation.config.ts) the same way
 * TypeOrmModule.forRootAsync in app.module.ts reads DATABASE_* — one
 * connection for the whole process, not per-request.
 *
 * get/set/delete plus one pattern-based delete (deleteByPrefix, for
 * invalidating a whole family of parameterized list-cache keys at
 * once): anything cache-key-shape/TTL-policy-specific still belongs to
 * whatever public-api caching layer / admin content service consumes
 * this service, not here.
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client!: Redis;
  private redisUnavailableLogged = false;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const password = this.config.get<string>('REDIS_PASSWORD');
    this.client = new Redis({
      host: this.config.get<string>('REDIS_HOST', 'localhost'),
      port: this.config.get<number>('REDIS_PORT', 6379),
      password: password || undefined,
      db: this.config.get<number>('REDIS_DB', 0),
      tls: this.config.get<string>('REDIS_TLS') === 'true' ? {} : undefined,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      // Reconnect on transient failures rather than giving up — a
      // public-api caching layer should degrade to "cache miss," not
      // take the app down, if Redis blips.
      retryStrategy: (attempt) => Math.min(attempt * 200, 5000),
    });

    this.client.on('error', () => {
      this.markUnavailable();
    });
    this.client.on('ready', () => {
      if (this.redisUnavailableLogged) {
        this.logger.log('Redis connection restored.');
      }
      this.redisUnavailableLogged = false;
    });
  }

  /** Checks Redis connectivity without degrading failures into cache misses. */
  async checkHealth(): Promise<void> {
    if (this.client?.status !== 'ready') {
      throw new Error('Redis connection is not ready');
    }

    const response = await this.client.ping();
    if (response !== 'PONG') {
      throw new Error('Redis health check returned an unexpected response');
    }
  }

  async onModuleDestroy() {
    if (this.client?.status === 'ready') {
      await this.client.quit();
    } else {
      this.client?.disconnect();
    }
  }

  private markUnavailable(): void {
    if (this.redisUnavailableLogged) return;
    this.logger.warn('Redis unavailable; cache operations will be skipped.');
    this.redisUnavailableLogged = true;
  }

  /**
   * Returns the JSON-parsed value stored at `key`, or null if the key
   * doesn't exist. Values that aren't valid JSON (shouldn't happen for
   * anything written via `set` below) are returned as the raw string
   * rather than throwing.
   *
   * A command-level failure (Redis unreachable, timed out, etc.) is
   * logged and treated as a cache miss rather than thrown — same
   * "degrade to a cache miss, not take the app down" contract the
   * connection-level retryStrategy above already documents, just
   * completed here for the per-command case it doesn't cover.
   */
  async get<T = unknown>(key: string): Promise<T | null> {
    if (this.client?.status !== 'ready') {
      this.markUnavailable();
      return null;
    }

    let raw: string | null;
    try {
      raw = await this.client.get(key);
    } catch (err) {
      this.markUnavailable();
      return null;
    }
    if (raw === null) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  }

  /**
   * Stores `value` (JSON-serialized) under `key`. `ttlSeconds`, when
   * given, expires the key after that many seconds — omitted, the key
   * persists until explicitly deleted or evicted.
   *
   * A failure here is logged and swallowed rather than thrown — the
   * caller has already computed the response/entity being cached, so a
   * write-through failure should not fail that request, only leave the
   * cache un-populated for next time.
   */
  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    if (this.client?.status !== 'ready') {
      this.markUnavailable();
      return;
    }

    const serialized = JSON.stringify(value);
    try {
      if (ttlSeconds && ttlSeconds > 0) {
        await this.client.set(key, serialized, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, serialized);
      }
    } catch (err) {
      this.markUnavailable();
    }
  }

  /**
   * A failure here is logged and swallowed rather than thrown — callers
   * invoke this after a DB write has already committed (create/update/
   * remove/publish/schedule), so a cache-invalidation failure must not
   * fail that operation; it only risks a stale cache entry surviving
   * until its TTL expires.
   */
  async delete(key: string): Promise<void> {
    if (this.client?.status !== 'ready') {
      this.markUnavailable();
      return;
    }

    try {
      await this.client.del(key);
    } catch (err) {
      this.markUnavailable();
    }
  }

  /**
   * Deletes every key starting with `prefix` (e.g. "public-api:news:list:"
   * clears every list-page/filter variant cached for that resource).
   * Uses SCAN rather than KEYS — non-blocking, safe to run against a
   * live Redis instance even with a large keyspace, at the cost of not
   * being a single atomic operation (acceptable here: this only ever
   * clears a read cache that's already tolerant of a miss).
   *
   * Same swallow-and-log posture as `delete` above, for the same
   * reason: this always runs after a DB write has already committed.
   */
  async deleteByPrefix(prefix: string): Promise<void> {
    if (this.client?.status !== 'ready') {
      this.markUnavailable();
      return;
    }

    try {
      let cursor = '0';
      do {
        const [nextCursor, keys] = await this.client.scan(
          cursor,
          'MATCH',
          `${prefix}*`,
          'COUNT',
          100,
        );
        cursor = nextCursor;
        if (keys.length > 0) {
          await this.client.del(...keys);
        }
      } while (cursor !== '0');
    } catch (err) {
      this.markUnavailable();
    }
  }
}
