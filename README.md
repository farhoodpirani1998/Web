# Nedaye Haghighat Website

This repository contains the public website, its CMS admin application, and the NestJS API used by both. Each application has its own `package.json`, lockfile, environment file, and commands; there is no root npm workspace.

## Applications

| Directory | Purpose | Documentation |
| --- | --- | --- |
| `frontend/` | Public React website | [frontend/README.md](frontend/README.md) |
| `admin/` | Authenticated CMS panel | [admin/README.md](admin/README.md) |
| `backend/` | Public API, CMS API, and PostgreSQL persistence | [backend/README.md](backend/README.md) |

The public routes and CMS routes are registered in each app's router. The backend's public and admin controllers are composed by `WebsiteModule`; see [docs/Website-Product-Architecture.md](docs/Website-Product-Architecture.md) for the current boundaries and content modules.

## Runtime versions

| Application | Node.js |
| --- | --- |
| Public frontend | `>=18.18.0` (`frontend/package.json`) |
| Admin | `>=22.12.0` (`admin/package.json`) |
| Backend | No `engines` declaration; Docker and GitHub Actions use Node 22 |

Node 22 is the common runtime used by CI and all three Dockerfiles.

## Local development

The setup helper requires Bash and Docker. It starts local PostgreSQL and Redis containers, installs application dependencies, creates `backend/.env` from its example if needed, runs migrations, and can launch all three dev servers:

```sh
./setup.sh
./setup.sh --start
```

Alternatively, install and run each app separately:

```sh
cd backend
npm ci
cp .env.example .env
# Configure backend/.env and start PostgreSQL and Redis.
npm run migration:run
npm run start:dev
```

In separate terminals:

```sh
cd admin && npm ci && npm run dev
cd frontend && npm ci && npm run dev
```

The local API listens on port `3100`; Vite serves the admin on `5174` and the public frontend on `5173`. Configure each app through its `.env.example`. The backend needs a PostgreSQL connection and a valid `CMS_JWT_SECRET`; Redis settings and the remaining optional settings are documented in `backend/.env.example`. Create the first CMS administrator with `npm run bootstrap:admin` and one-off `CMS_BOOTSTRAP_ADMIN_EMAIL` / `CMS_BOOTSTRAP_ADMIN_PASSWORD` values.

## Build, lint, and test

Run commands from the corresponding application directory:

| Application | Build | Lint | Tests |
| --- | --- | --- | --- |
| `frontend/` | `npm run build` | `npm run lint` | `npm test` |
| `admin/` | `npm run build` | `npm run lint` | `npm test` |
| `backend/` | `npm run build` | `npm run lint` | `npm test` |

The backend also provides `npm run test:e2e`; it requires the PostgreSQL and Redis services configured by the e2e test setup. The backend lint script invokes ESLint with `--fix`.

GitHub Actions is defined in `.github/workflows/`. CI uses Node 22. It runs backend build, unit and e2e tests plus migrations; frontend build and tests; admin build, lint, and tests; and builds all three Docker images. CI does not run the frontend or full backend source lint scripts.

## Deployment

The production-oriented Docker Compose stack uses Caddy for HTTPS and keeps the API, PostgreSQL, and Redis off published host ports. Configure the root `.env` and `backend/.env` from their example files, then follow [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md). Do not use example credentials or commit real environment files.

## Architecture

- [docs/Website-Product-Architecture.md](docs/Website-Product-Architecture.md)
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
