#!/bin/bash
# Creates ~/.alchemy config and credentials from .env values
# Run this once before first deploy: bash scripts/setup-alchemy.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Load .env
set -a
source "$PROJECT_DIR/.env"
set +a

if [ -z "${CLOUDFLARE_API_TOKEN:-}" ] || [ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]; then
  echo "Error: CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID must be set in .env"
  exit 1
fi

ALCHEMY_DIR="$HOME/.alchemy"
CREDS_DIR="$ALCHEMY_DIR/credentials/default"

mkdir -p "$CREDS_DIR"

# Create config.json
cat > "$ALCHEMY_DIR/config.json" <<EOF
{
  "version": 1,
  "profiles": {
    "default": {
      "cloudflare": {
        "metadata": {
          "id": "$CLOUDFLARE_ACCOUNT_ID",
          "name": "war-tracker"
        },
        "method": "api-token"
      }
    }
  }
}
EOF

# Create credentials file
cat > "$CREDS_DIR/cloudflare.json" <<EOF
{
  "type": "api-token",
  "apiToken": "$CLOUDFLARE_API_TOKEN"
}
EOF

chmod 600 "$CREDS_DIR/cloudflare.json"

echo "Alchemy configured successfully:"
echo "  Config: $ALCHEMY_DIR/config.json"
echo "  Credentials: $CREDS_DIR/cloudflare.json"
