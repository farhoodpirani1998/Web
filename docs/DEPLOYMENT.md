# Docker deployment with automatic HTTPS

This deployment runs the public site, admin app, and NestJS API behind Caddy. Caddy terminates public TLS, obtains and renews certificates automatically, and proxies requests to containers over the private Compose network. The API, PostgreSQL, and Redis are not published directly on host ports.

## Requirements

- Docker Engine and the `docker compose` plugin.
- A server with inbound TCP ports 80 and 443 available (UDP 443 is optional for HTTP/3).
- Public DNS A/AAAA records for the site, admin, and API hostnames pointing to that server. Do not publish an AAAA record unless IPv6 reaches the server.
- A production SMS JWT verification **public** key file. Never mount the SMS private key.

## Configure

1. Copy the root `.env.example` to `.env` and set real hostnames, database credentials, the public key file path, and exact allowed browser origins. The root `.env` is ignored by Git.
2. Create `backend/.env` from `backend/.env.example`. For a production deployment, supply `CMS_JWT_SECRET` from a secrets manager or generate a strong value with `openssl rand -hex 32`; keep it at least 32 characters, and do not commit the file. `setup.sh` generates a local development value when the field is blank and rejects values shorter than 32 characters.
3. Set `SMS_JWT_PUBLIC_KEY_FILE` in root `.env` to the absolute or project-relative path of the production public key. Its path must exist on the Docker host.
4. Make sure `DATABASE_NAME` and `DATABASE_USER` agree between root `.env` and `backend/.env`. Compose overrides the backend database host, credentials, Redis host, CORS origins, TLS-related cookie settings, and production mode.
5. Replace the placeholder SMS public key and any sample credentials before going live. Do not use `.env.example` values in production.

## Start

From the repository root:

```sh
docker compose config
docker compose up --build -d
docker compose ps
```

Caddy serves:

- `https://SITE_DOMAIN` — public website
- `https://ADMIN_DOMAIN` — admin application
- `https://API_DOMAIN` — backend API

Caddy requires the DNS records to resolve publicly and port 80/443 to reach the server before it can issue certificates. Certificate data is persisted in the `caddy-data` volume and renewed automatically. Do not remove that volume during routine upgrades.

## Operations

```sh
docker compose logs -f caddy backend
docker compose pull
docker compose up --build -d
```

Database migrations are not run automatically on app startup. Run the backend migration command as a controlled deployment step with the production environment and network available before switching traffic to a release that requires new schema changes.

TLS terminates at Caddy. The backend trusts one proxy hop (`TRUST_PROXY=1`), enables secure refresh cookies and HSTS in production, and is reachable only on the private Compose network. Do not expose backend, database, or Redis ports publicly.
