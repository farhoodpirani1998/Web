#!/usr/bin/env bash
#
# setup.sh â€” bootstraps this monorepo (backend + admin + frontend) for local
# development, e.g. inside a GitHub Codespace.
#
# Usage:
#   ./setup.sh            # install deps, start Postgres/Redis, run migrations
#   ./setup.sh --start     # also start backend + admin + frontend dev servers
#
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$ROOT_DIR/logs"
mkdir -p "$LOG_DIR"

info()  { echo -e "\033[1;34m[setup]\033[0m $1"; }
warn()  { echo -e "\033[1;33m[setup]\033[0m $1"; }
err()   { echo -e "\033[1;31m[setup]\033[0m $1"; }

# ---------------------------------------------------------------------------
# 1. Postgres + Redis via Docker
# ---------------------------------------------------------------------------
if ! command -v docker &>/dev/null; then
  err "docker not found â€” install it or provision Postgres/Redis another way."
  exit 1
fi

if ! docker ps --format '{{.Names}}' | grep -q '^nhg-pg$'; then
  if docker ps -a --format '{{.Names}}' | grep -q '^nhg-pg$'; then
    info "Starting existing Postgres container..."
    docker start nhg-pg >/dev/null
  else
    info "Creating Postgres container (nhg-pg)..."
    docker run -d --name nhg-pg \
      -e POSTGRES_USER=nhg_website \
      -e POSTGRES_PASSWORD=changeme \
      -e POSTGRES_DB=nhg_website \
      -p 5432:5432 \
      postgres:16 >/dev/null
  fi
else
  info "Postgres container already running."
fi

if ! docker ps --format '{{.Names}}' | grep -q '^nhg-redis$'; then
  if docker ps -a --format '{{.Names}}' | grep -q '^nhg-redis$'; then
    info "Starting existing Redis container..."
    docker start nhg-redis >/dev/null
  else
    info "Creating Redis container (nhg-redis)..."
    docker run -d --name nhg-redis -p 6379:6379 redis:7 >/dev/null
  fi
else
  info "Redis container already running."
fi

info "Waiting for Postgres to accept connections..."
for i in {1..30}; do
  if docker exec nhg-pg pg_isready -U nhg_website &>/dev/null; then
    break
  fi
  sleep 1
done

# ---------------------------------------------------------------------------
# 2. Backend
# ---------------------------------------------------------------------------
info "Installing backend dependencies..."
(cd "$ROOT_DIR/backend" && npm install --silent)

if [ ! -f "$ROOT_DIR/backend/.env" ]; then
  info "Creating backend/.env from .env.example..."
  cp "$ROOT_DIR/backend/.env.example" "$ROOT_DIR/backend/.env"
fi

# Generate the local CMS signing secret only when it is blank. Never print it.
CMS_JWT_SECRET="$(sed -n 's/^CMS_JWT_SECRET=//p' "$ROOT_DIR/backend/.env" | head -n 1)"
if [[ -z "$CMS_JWT_SECRET" ]]; then
  if ! command -v openssl >/dev/null 2>&1; then
    err "openssl is required to generate CMS_JWT_SECRET."
    exit 1
  fi
  SECRET="$(openssl rand -hex 32)"
  sed -i "s|^CMS_JWT_SECRET=.*|CMS_JWT_SECRET=${SECRET}|" "$ROOT_DIR/backend/.env"
  info "Generated CMS_JWT_SECRET (64 hex characters)."
elif [[ ${#CMS_JWT_SECRET} -lt 32 ]]; then
  err "CMS_JWT_SECRET is shorter than 32 characters; replace it with a strong random secret."
  exit 1
fi

info "Running database migrations..."
(cd "$ROOT_DIR/backend" && npm run migration:run)

# ---------------------------------------------------------------------------
# 3. Admin + Frontend
# ---------------------------------------------------------------------------
info "Installing admin panel dependencies..."
(cd "$ROOT_DIR/admin" && npm install --silent)

if [ -d "$ROOT_DIR/frontend" ]; then
  info "Installing public frontend dependencies..."
  (cd "$ROOT_DIR/frontend" && npm install --silent)
fi

info "Setup complete."
echo
echo "  Backend   : cd backend && npm run start:dev   (http://localhost:3100)"
echo "  Admin     : cd admin   && npm run dev          (http://localhost:5174)"
[ -d "$ROOT_DIR/frontend" ] && echo "  Frontend  : cd frontend && npm run dev          (http://localhost:5173)"
echo
echo "  First admin user:"
echo "    cd backend && CMS_BOOTSTRAP_ADMIN_EMAIL=you@example.com CMS_BOOTSTRAP_ADMIN_PASSWORD=yourpass npm run bootstrap:admin"
echo
echo "  In a Codespace: make ports 3100/5174/5173 public in the PORTS tab, and set"
echo "  CORS_ALLOWED_ORIGINS in backend/.env to the codespaces admin URL so the"
echo "  refresh-token cookie and CORS both work."

# ---------------------------------------------------------------------------
# 4. Optionally start dev servers in the background
# ---------------------------------------------------------------------------
if [[ "${1:-}" == "--start" ]]; then
  info "Starting dev servers in the background (logs in ./logs)..."
  (cd "$ROOT_DIR/backend" && nohup npm run start:dev > "$LOG_DIR/backend.log" 2>&1 &)
  (cd "$ROOT_DIR/admin" && nohup npm run dev > "$LOG_DIR/admin.log" 2>&1 &)
  [ -d "$ROOT_DIR/frontend" ] && (cd "$ROOT_DIR/frontend" && nohup npm run dev > "$LOG_DIR/frontend.log" 2>&1 &)
  sleep 2
  info "Dev servers launched. Tail logs with: tail -f logs/*.log"
fi

