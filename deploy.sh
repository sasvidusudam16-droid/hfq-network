#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
SERVICE_NAME="hfq-network"
ENV_FILE="/etc/${SERVICE_NAME}.env"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"

if [[ "$EUID" -ne 0 ]]; then
  if ! command -v sudo >/dev/null 2>&1; then
    echo "Run this script with sudo (sudo is not installed)." >&2
    exit 1
  fi
  exec sudo -- bash "$APP_DIR/deploy.sh" "$@"
fi

APP_USER="${SUDO_USER:-}"
if [[ -z "$APP_USER" || "$APP_USER" == "root" ]]; then
  echo "Run as a regular deployment user with sudo, for example: sudo bash deploy.sh" >&2
  exit 1
fi

if [[ ! -f "$APP_DIR/package.json" || ! -f "$APP_DIR/server/index.mjs" ]]; then
  echo "Run deploy.sh from the HFQ Network project directory." >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "Node.js and npm are required. Install a supported Node.js LTS release (20.19+ or 22+) and run this again." >&2
  exit 1
fi
if ! node -e 'const [major, minor] = process.versions.node.split(".").map(Number); process.exit(major >= 22 || (major === 20 && minor >= 19) ? 0 : 1)'; then
  echo "Unsupported Node.js $(node --version). Install Node.js 20.19+ or 22+ and retry." >&2
  exit 1
fi
if ! command -v openssl >/dev/null 2>&1 || ! command -v systemctl >/dev/null 2>&1; then
  echo "This deploy script requires openssl and systemd (typical Ubuntu/Debian VPS)." >&2
  exit 1
fi

printf 'Set a strong password for the HFQ store admin login (/admin).\n'
while true; do
  read -r -s -p 'Admin password (14+ letters, numbers, or ._!@#%%+=-): ' ADMIN_PASSWORD
  printf '\n'
  if [[ ${#ADMIN_PASSWORD} -ge 14 && "$ADMIN_PASSWORD" =~ ^[A-Za-z0-9._!@#%+=-]+$ ]]; then
    read -r -s -p 'Confirm admin password: ' ADMIN_PASSWORD_CONFIRM
    printf '\n'
    if [[ "$ADMIN_PASSWORD" == "$ADMIN_PASSWORD_CONFIRM" ]]; then
      break
    fi
    echo "Passwords did not match. Try again."
  else
    echo "Use at least 14 characters, with no spaces or shell-special quotes."
  fi
done

NODE_BIN="$(command -v node)"
SESSION_SECRET="$(openssl rand -hex 32)"
umask 077
cat > "$ENV_FILE" <<EOF
NODE_ENV=production
API_HOST=127.0.0.1
API_PORT=3001
ADMIN_PASSWORD=$ADMIN_PASSWORD
SESSION_SECRET=$SESSION_SECRET
EOF
chmod 600 "$ENV_FILE"
unset ADMIN_PASSWORD ADMIN_PASSWORD_CONFIRM SESSION_SECRET

printf '\nInstalling packages and building the website...\n'
runuser -u "$APP_USER" -- npm --prefix "$APP_DIR" ci
runuser -u "$APP_USER" -- npm --prefix "$APP_DIR" run build

mkdir -p "$APP_DIR/public/uploads"
chown -R "$APP_USER":"$(id -gn "$APP_USER")" "$APP_DIR/data" "$APP_DIR/public/uploads"

cat > "$SERVICE_FILE" <<EOF
[Unit]
Description=HFQ Network website and store API
After=network.target

[Service]
Type=simple
User=$APP_USER
Group=$(id -gn "$APP_USER")
WorkingDirectory=$APP_DIR
EnvironmentFile=$ENV_FILE
ExecStart=$NODE_BIN server/index.mjs
Restart=on-failure
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=full
ReadWritePaths=$APP_DIR/data $APP_DIR/public/uploads

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now "$SERVICE_NAME"
systemctl --no-pager --full status "$SERVICE_NAME" || true

cat <<EOF

HFQ Network has been built and installed as a system service.
Local health check: curl http://127.0.0.1:3001/api/health
Service logs:      sudo journalctl -u $SERVICE_NAME -f
Service restart:   sudo systemctl restart $SERVICE_NAME
Admin login:       https://your-domain.example/admin

Next: configure your domain's DNS and an HTTPS reverse proxy (Nginx/Caddy)
to forward public web traffic to http://127.0.0.1:3001. Do not expose port 3001
directly to the internet. See README.md for the proxy, HTTPS, and Google Search
Console instructions. Credentials are stored in $ENV_FILE (root-readable only).
EOF
