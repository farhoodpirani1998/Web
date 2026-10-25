import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

/**
 * Used only by the TypeORM CLI for generating/running migrations.
 * Independent from SMS's data source entirely — separate connection,
 * separate credentials, separate database.
 *
 * TypeScript globs are for `npm run migration:run` (ts-node). Compiled
 * globs are for the production image (`npm run migration:run:prod`),
 * which has no ts-node.
 */
const compiled = __filename.endsWith('.js');

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [compiled ? 'dist/**/*.entity.js' : 'src/**/*.entity.ts'],
  migrations: [compiled ? 'dist/migrations/*.js' : 'src/migrations/*.ts'],
});
