#!/bin/sh
# ─────────────────────────────────────────────────────────────────────────────
# VERDEVIA Backend — Docker Entrypoint
#
# Responsibilities:
#   1. Wait until PostgreSQL accepts connections (belt-and-suspenders beyond
#      the compose healthcheck, guards against timing races on container start).
#   2. Run the database seed ONCE — only when the `users` table is empty.
#      Uses a lightweight Node.js check so we don't add psql to the image.
#   3. Hand off to the real application process (exec replaces this shell so
#      signals are forwarded correctly).
# ─────────────────────────────────────────────────────────────────────────────

set -e

echo "[entrypoint] 🚀 VERDEVIA Backend starting..."

# ── 1. Wait for PostgreSQL ────────────────────────────────────────────────────
echo "[entrypoint] ⏳ Waiting for PostgreSQL at ${DB_HOST}:${DB_PORT}..."

until node -e "
const net = require('net');
const s = net.createConnection(${DB_PORT:-5432}, '${DB_HOST:-postgres}');
s.on('connect', () => { s.destroy(); process.exit(0); });
s.on('error', () => { s.destroy(); process.exit(1); });
" 2>/dev/null; do
  sleep 1
done

echo "[entrypoint] ✅ PostgreSQL is reachable."

# ── 2. Auto-seed if the users table is empty ──────────────────────────────────
echo "[entrypoint] 🌱 Checking if database needs seeding..."

NEEDS_SEED=$(node -e "
const { Client } = require('pg');
const client = new Client({
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USERNAME || 'ecoa_user',
  password: process.env.DB_PASSWORD || 'ecoa_password',
  database: process.env.DB_NAME || 'ecoa_db',
});
client.connect()
  .then(() => client.query('SELECT COUNT(*) FROM users'))
  .then(res => {
    const count = parseInt(res.rows[0].count, 10);
    process.stdout.write(count === 0 ? 'yes' : 'no');
    return client.end();
  })
  .catch(() => {
    // Table might not exist yet (first migration run) — seed after app starts
    process.stdout.write('yes');
  });
" 2>/dev/null || echo "yes")

if [ "$NEEDS_SEED" = "yes" ]; then
  echo "[entrypoint] 📦 Database is empty — running seed..."
  node dist/database/seed.js && echo "[entrypoint] ✅ Seed completed." || echo "[entrypoint] ⚠️  Seed failed (app will still start)."
else
  echo "[entrypoint] ✅ Database already has data — skipping seed."
fi

# ── 3. Start the application ──────────────────────────────────────────────────
echo "[entrypoint] 🎯 Starting NestJS application..."
exec "$@"
