#!/usr/bin/env bash
set -euo pipefail

echo "Migrating database..."

ls -al ./packages/server/dist/src/db/migrations/
ls -al ./packages/server/dist/src/db/

pnpm run --filter @afsnk/pay-server db:migrate

# Execute the command passed to the container
exec "$@"
