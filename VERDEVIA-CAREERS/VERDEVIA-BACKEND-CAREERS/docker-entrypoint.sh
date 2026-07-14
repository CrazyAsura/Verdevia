#!/bin/sh
set -e

echo "[entrypoint] 🚀 VERDEVIA Service starting..."

# ── 1. Wait for PostgreSQL ────────────────────────────────────────────────────
if [ -n "$DB_HOST" ]; then
  echo "[entrypoint] ⏳ Waiting for PostgreSQL at ${DB_HOST}:${DB_PORT:-5432}..."
  until node -e "
  const net = require('net');
  const s = net.createConnection(${DB_PORT:-5432}, '${DB_HOST}');
  s.on('connect', () => { s.destroy(); process.exit(0); });
  s.on('error', () => { s.destroy(); process.exit(1); });
  " 2>/dev/null; do
    sleep 1
  done
  echo "[entrypoint] ✅ PostgreSQL is reachable."
fi

# ── 2. Auto-seed if the users table is empty and seed file exists ──────────────
if [ -f dist/database/seed.js ] && [ -n "$DB_HOST" ]; then
  echo "[entrypoint] 🌱 Checking if database needs seeding..."
  NEEDS_SEED=$(node -e "
  const { Client } = require('pg');
  const client = new Client({
    host: process.env.DB_HOST || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USERNAME || 'verdevia_user',
    password: process.env.DB_PASSWORD || 'verdevia_password',
    database: process.env.DB_NAME || 'verdevia_db',
  });
  client.connect()
    .then(() => client.query('SELECT COUNT(*) FROM users'))
    .then(res => {
      const count = parseInt(res.rows[0].count, 10);
      process.stdout.write(count === 0 ? 'yes' : 'no');
      client.end().catch(() => {}).then(() => process.exit(0));
    })
    .catch(() => {
      process.stdout.write('yes');
      client.end().catch(() => {}).then(() => process.exit(0));
    });
  " 2>/dev/null || echo "yes")

  if [ "$NEEDS_SEED" = "yes" ]; then
    echo "[entrypoint] 📦 Database is empty — running seed..."
    KAFKA_CONSUMER_ENABLED=false node dist/database/seed.js && echo "[entrypoint] ✅ Seed completed." || echo "[entrypoint] ⚠️  Seed failed (app will still start)."
  else
    echo "[entrypoint] ✅ Database already has data — skipping seed."
  fi
fi

# ── 3. Start the application ──────────────────────────────────────────────────
echo "[entrypoint] 🎯 Starting NestJS application..."
exec "$@"
