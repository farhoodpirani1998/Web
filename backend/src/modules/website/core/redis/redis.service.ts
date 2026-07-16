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
 * Deliberately just get/set/delete for now: this module only stands up
 * the Redis connection itself (see the RedisModule doc comment) —
 * anything cache-key-shape/TTL-policy/invalidation-specific belongs to
 * whatever public-api caching layer consumes this service later, not
 * here.
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client!: Redis;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const password = this.config.get<string>('REDIS_PASSWORD');
    this.client = new Redis({
      host: this.config.get<string>('REDIS_HOST', 'localhost'),
      port: this.config.get<number>('REDIS_PORT', 6379),
      password: password || undefined,
      db: this.config.get<number>('REDIS_DB', 0),
      tls: this.config.get<string>('REDIS_TLS') === 'true' ? {} : undefined,
      // Reconnect on transient failures rather than giving up — a
      // public-api caching layer should degrade to "cache miss," not
      // take the app down, if Redis blips.
      retryStrategy: (attempt) => Math.min(attempt * 200, 5000),
    });

    this.client.on('error', (err) => {
      this.logger.error(`Redis connection error: ${err.message}`);
    });
  }

  async onModuleDestroy() {
    await this.client?.quit();
  }

  /**
   * Returns the JSON-parsed value stored at `key`, or null if the key
   * doesn't exist. Values that aren't valid JSON (shouldn't happen for
   * anything written via `set` below) are returned as the raw string
   * rather than throwing.
   */
  async get<T = unknown>(key: string): Promise<T | null> {
    const raw = await this.client.get(key);
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
   */
  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttlSeconds && ttlSeconds > 0) {
      await this.client.set(key, serialized, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, serialized);
    }
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }
}
