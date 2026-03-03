#!/bin/bash
# War tracker cron job — runs hourly
# Deployed to VPS at /opt/war-tracker/cron/scripts/cron.sh

LOCKFILE="/tmp/war-tracker-cron.lock"

exec 200>"$LOCKFILE"
if ! flock -n 200; then
  echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) Another cron run is still active, skipping"
  exit 0
fi

cd /opt/war-tracker || exit 1

# Load environment
set -a
source /opt/war-tracker/.env.cron
set +a

# Pull latest code
git pull --ff-only 2>&1
bun install --frozen-lockfile 2>&1

# Run the cron pipeline
bun run cron/src/run.ts 2>&1

echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) Cron run complete"
