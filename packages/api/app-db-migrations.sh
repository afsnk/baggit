#!/usr/bin/env bash
set -euxo pipefail

echo "Migrating database..."

# guard:
: "${DATABASE_URL:?DATABASE_URL is required}"
: "${DATABASE_AUTH_TOKEN:?TURSO_AUTH_TOKEN is required}"

bun run --filter @baggit/api db:generate
bun run --filter @baggit/api db:migrate

echo "Migration done..."

# Execute the command passed to the container
# exec "$@"
