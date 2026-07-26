#!/usr/bin/env bash
# One command to go from "just reopened Codespace" to "ready to log in".
# Usage: bash start-all.sh
set -uo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$ROOT_DIR/logs"
mkdir -p "$LOG_DIR"
cd "$ROOT_DIR"

info() { echo -e "\033[1;34m[start-all]\033[0m $1"; }
ok()   { echo -e "\033[1;32m[start-all]\033[0m $1"; }
warn() { echo -e "\033[1;33m[start-all]\033[0m $1"; }

# ---------------------------------------------------------------------------
# 1. Kill any stale backend/admin dev servers still hanging around
# ---------------------------------------------------------------------------
pkill -f "nest start" >/dev/null 2>&1 || true
pkill -f "vite" >/dev/null 2>&1 || true
sleep 1

# ---------------------------------------------------------------------------
# 2. Docker: Postgres + Redis
# ---------------------------------------------------------------------------
if command -v docker &>/dev/null; then
  for c in nhg-pg nhg-redis; do
      if docker ps --format '{{.Names}}' | grep -q "^${c}\$"; then
            ok "$c already running."
                elif docker ps -a --format '{{.Names}}' | grep -q "^${c}\$"; then
                      docker start "$c" >/dev/null && ok "Started $c."
                          else
                                warn "$c container not found — creating it fresh."
                                      if [ "$c" = "nhg-pg" ]; then
                                              docker run -d --name nhg-pg -e POSTGRES_USER=nhg_website -e POSTGRES_PASSWORD=changeme -e POSTGRES_DB=nhg_website -p 5432:5432 postgres:16 >/dev/null
                                                    else
                                                            docker run -d --name nhg-redis -p 6379:6379 redis:7 >/dev/null
                                                                  fi
                                                                      fi
                                                                        done
                                                                          info "Waiting for Postgres..."
                                                                            for i in $(seq 1 20); do
                                                                                docker exec nhg-pg pg_isready -U nhg_website &>/dev/null && break
                                                                                    sleep 1
                                                                                      done
                                                                                      else
                                                                                        warn "docker not found — skipping database startup."
                                                                                        fi

                                                                                        # ---------------------------------------------------------------------------
                                                                                        # 3. Auto-detect this Codespace's current domain and fix the .env URLs
                                                                                        # ---------------------------------------------------------------------------
                                                                                        if [ -n "${CODESPACE_NAME:-}" ] && [ -n "${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-}" ]; then
                                                                                          BACKEND_URL="https://${CODESPACE_NAME}-3100.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
                                                                                            ADMIN_URL="https://${CODESPACE_NAME}-5174.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
                                                                                              FRONTEND_URL="https://${CODESPACE_NAME}-5173.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"

                                                                                                # Backend: allow BOTH the admin panel and the public site to call it.
                                                                                                  if [ -f backend/.env ]; then
                                                                                                      if grep -q '^CORS_ALLOWED_ORIGINS=' backend/.env; then
                                                                                                            sed -i "s|^CORS_ALLOWED_ORIGINS=.*|CORS_ALLOWED_ORIGINS=${ADMIN_URL},${FRONTEND_URL}|" backend/.env
                                                                                                                else
                                                                                                                      echo "CORS_ALLOWED_ORIGINS=${ADMIN_URL},${FRONTEND_URL}" >> backend/.env
                                                                                                                          fi
                                                                                                                            fi

                                                                                                                              # Admin panel: point at the backend's admin API.
                                                                                                                                for f in admin/.env admin/.env.development; do
                                                                                                                                    [ -f "$f" ] || continue
                                                                                                                                        if grep -q '^VITE_ADMIN_API_BASE_URL=' "$f"; then
                                                                                                                                              sed -i "s|^VITE_ADMIN_API_BASE_URL=.*|VITE_ADMIN_API_BASE_URL=${BACKEND_URL}/admin|" "$f"
                                                                                                                                                  else
                                                                                                                                                        echo "VITE_ADMIN_API_BASE_URL=${BACKEND_URL}/admin" >> "$f"
                                                                                                                                                            fi
                                                                                                                                                              done

                                                                                                                                                                # Public site: point at the backend's public API.
                                                                                                                                                                  for f in frontend/.env frontend/.env.development; do
                                                                                                                                                                      [ -f "$f" ] || continue
                                                                                                                                                                          if grep -q '^VITE_PUBLIC_API_BASE_URL=' "$f"; then
                                                                                                                                                                                sed -i "s|^VITE_PUBLIC_API_BASE_URL=.*|VITE_PUBLIC_API_BASE_URL=${BACKEND_URL}/public|" "$f"
                                                                                                                                                                                    else
                                                                                                                                                                                          echo "VITE_PUBLIC_API_BASE_URL=${BACKEND_URL}/public" >> "$f"
                                                                                                                                                                                              fi
                                                                                                                                                                                                done

                                                                                                                                                                                                  ok "Synced env URLs to this Codespace's current domain."
                                                                                                                                                                                                  else
                                                                                                                                                                                                    warn "Not detected as a Codespace — env URLs left as-is."
                                                                                                                                                                                                    fi

                                                                                                                                                                                                    # ---------------------------------------------------------------------------
                                                                                                                                                                                                    # 4. Start backend + admin in the background
                                                                                                                                                                                                    # ---------------------------------------------------------------------------
                                                                                                                                                                                                    info "Starting backend..."
                                                                                                                                                                                                    (cd backend && nohup npm run start:dev > "$LOG_DIR/backend.log" 2>&1 &)

                                                                                                                                                                                                    info "Starting admin..."
                                                                                                                                                                                                    (cd admin && nohup npm run dev > "$LOG_DIR/admin.log" 2>&1 &)

                                                                                                                                                                                                    if [ -d frontend ]; then
                                                                                                                                                                                                      info "Starting frontend..."
                                                                                                                                                                                                        (cd frontend && nohup npm run dev > "$LOG_DIR/frontend.log" 2>&1 &)
                                                                                                                                                                                                        fi

                                                                                                                                                                                                        info "Waiting a few seconds for everything to come up..."
                                                                                                                                                                                                        sleep 8

                                                                                                                                                                                                        # ---------------------------------------------------------------------------
                                                                                                                                                                                                        # 5. Report status + links
                                                                                                                                                                                                        # ---------------------------------------------------------------------------
                                                                                                                                                                                                        echo
                                                                                                                                                                                                        if grep -qi "error" "$LOG_DIR/backend.log" 2>/dev/null; then
                                                                                                                                                                                                          warn "Backend log has errors — check: tail -50 logs/backend.log"
                                                                                                                                                                                                          else
                                                                                                                                                                                                            ok "Backend looks OK (log: logs/backend.log)"
                                                                                                                                                                                                            fi

                                                                                                                                                                                                            if grep -qi "error" "$LOG_DIR/admin.log" 2>/dev/null; then
                                                                                                                                                                                                              warn "Admin log has errors — check: tail -50 logs/admin.log"
                                                                                                                                                                                                              else
                                                                                                                                                                                                                ok "Admin looks OK (log: logs/admin.log)"
                                                                                                                                                                                                                fi

                                                                                                                                                                                                                if [ -f "$LOG_DIR/frontend.log" ]; then
                                                                                                                                                                                                                  if grep -qi "error" "$LOG_DIR/frontend.log" 2>/dev/null; then
                                                                                                                                                                                                                      warn "Frontend log has errors — check: tail -50 logs/frontend.log"
                                                                                                                                                                                                                        else
                                                                                                                                                                                                                            ok "Frontend looks OK (log: logs/frontend.log)"
                                                                                                                                                                                                                              fi
                                                                                                                                                                                                                              fi

                                                                                                                                                                                                                              if [ -n "${CODESPACE_NAME:-}" ]; then
                                                                                                                                                                                                                                echo
                                                                                                                                                                                                                                  ok "Admin panel (log in here):"
                                                                                                                                                                                                                                    echo "  https://${CODESPACE_NAME}-5174.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}/login"
                                                                                                                                                                                                                                      if [ -d frontend ]; then
                                                                                                                                                                                                                                          ok "Public site:"
                                                                                                                                                                                                                                              echo "  https://${CODESPACE_NAME}-5173.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}/"
                                                                                                                                                                                                                                                fi
                                                                                                                                                                                                                                                fi

                                                                                                                                                                                                                                                echo
                                                                                                                                                                                                                                                info "Live logs: tail -f logs/backend.log logs/admin.log logs/frontend.log"