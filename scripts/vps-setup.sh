#!/bin/bash
# VPS Setup Script for war-tracker cron
# Run as root on a fresh Ubuntu 24.04 Hetzner VPS:
#   curl -fsSL https://raw.githubusercontent.com/rafaell0pez/war-tracker/main/scripts/vps-setup.sh | bash
#
# After running, you still need to:
#   1. Run `claude setup-token` to authenticate Claude
#   2. Edit /opt/war-tracker/.env with your secrets

set -euo pipefail

echo "=== war-tracker VPS setup ==="

# Install Bun
if ! command -v bun &> /dev/null; then
  echo "[1/5] Installing Bun..."
  curl -fsSL https://bun.sh/install | bash
  export BUN_INSTALL="$HOME/.bun"
  export PATH="$BUN_INSTALL/bin:$PATH"
  # Make bun available system-wide
  ln -sf "$BUN_INSTALL/bin/bun" /usr/local/bin/bun
  ln -sf "$BUN_INSTALL/bin/bunx" /usr/local/bin/bunx
else
  echo "[1/5] Bun already installed"
fi

# Install Claude Code CLI
if ! command -v claude &> /dev/null; then
  echo "[2/5] Installing Claude Code CLI..."
  npm install -g @anthropic-ai/claude-code 2>/dev/null || bun install -g @anthropic-ai/claude-code
else
  echo "[2/5] Claude CLI already installed"
fi

# Clone repo
echo "[3/5] Cloning war-tracker..."
if [ -d /opt/war-tracker ]; then
  cd /opt/war-tracker && git pull --ff-only
else
  git clone https://github.com/rafaell0pez/war-tracker.git /opt/war-tracker
fi
cd /opt/war-tracker
bun install --frozen-lockfile 2>/dev/null || bun install

# Create .env for cron
echo "[4/5] Setting up environment..."
if [ ! -f /opt/war-tracker/.env.cron ]; then
  cat > /opt/war-tracker/.env.cron << 'ENVEOF'
TWITTER_API_KEY=new1_23ca876084754df5a650c1c71bf13044
WORKER_INGEST_URL=https://wars.today/api/internal/ingest
WORKER_INGEST_SECRET=CHANGE_ME
ENVEOF
  echo "  Created .env.cron — edit /opt/war-tracker/.env.cron with your WORKER_INGEST_SECRET"
else
  echo "  .env.cron already exists"
fi

# Set up cron
echo "[5/5] Configuring cron job..."
cat > /etc/cron.d/war-tracker << 'CRONEOF'
SHELL=/bin/bash
PATH=/usr/local/bin:/usr/bin:/bin:/root/.bun/bin
0 * * * * root /opt/war-tracker/cron/scripts/cron.sh >> /var/log/war-tracker.log 2>&1
CRONEOF
chmod 644 /etc/cron.d/war-tracker

# Create log file
touch /var/log/war-tracker.log

echo ""
echo "=== Setup complete ==="
echo ""
echo "Next steps:"
echo "  1. Run: claude setup-token"
echo "     (This authenticates Claude CLI with your Max subscription)"
echo ""
echo "  2. Edit /opt/war-tracker/.env.cron"
echo "     Set WORKER_INGEST_SECRET to your actual secret"
echo ""
echo "  3. Test the cron manually:"
echo "     source /opt/war-tracker/.env.cron && cd /opt/war-tracker && bun run cron/src/run.ts"
echo ""
echo "  4. The cron job runs hourly at :00 and logs to /var/log/war-tracker.log"
