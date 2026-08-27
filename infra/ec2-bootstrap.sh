#!/usr/bin/env bash
# Run once on a fresh EC2 instance (Amazon Linux 2023, t3.micro) over SSH:
#   scp infra/ec2-bootstrap.sh ec2-user@<elastic-ip>:~/
#   ssh ec2-user@<elastic-ip> 'chmod +x ec2-bootstrap.sh && ./ec2-bootstrap.sh'
#
# Installs Docker + the Compose plugin (AL2023 doesn't ship the plugin in its
# own repos, so it's fetched from Docker's official plugin release), adds a
# 1GB swap file (t3.micro only has 1GB RAM — builds need the headroom), and
# clones this repo into /opt/vendor-connect.
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/milandawijekoon/vendor_connect.git}"
DEPLOY_DIR="/opt/vendor-connect"
COMPOSE_VERSION="v2.29.7"

echo "==> Updating packages"
sudo dnf update -y

echo "==> Installing Docker Engine"
if ! command -v docker >/dev/null 2>&1; then
  sudo dnf install -y docker
  sudo systemctl enable --now docker
  sudo usermod -aG docker "$USER"
fi

echo "==> Installing Docker Compose plugin"
mkdir -p ~/.docker/cli-plugins
if [ ! -f ~/.docker/cli-plugins/docker-compose ]; then
  curl -fsSL "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-linux-$(uname -m)" \
    -o ~/.docker/cli-plugins/docker-compose
  chmod +x ~/.docker/cli-plugins/docker-compose
fi

echo "==> Installing git"
sudo dnf install -y git

echo "==> Adding 1GB swap (t3.micro has 1GB RAM — Next.js/Nest builds need it)"
if [ ! -f /swapfile ]; then
  sudo fallocate -l 1G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  # Swappiness low: prefer RAM, only swap under real pressure (keeps builds
  # from thrashing disk unnecessarily).
  sudo sysctl -w vm.swappiness=10
  echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
fi

echo "==> Cloning repo into ${DEPLOY_DIR}"
sudo mkdir -p "$DEPLOY_DIR"
sudo chown "$USER":"$USER" "$DEPLOY_DIR"
if [ ! -d "${DEPLOY_DIR}/.git" ]; then
  git clone "$REPO_URL" "$DEPLOY_DIR"
fi

echo "==> Creating placeholder .env (fill in real secrets before first deploy)"
if [ ! -f "${DEPLOY_DIR}/.env" ]; then
  cat > "${DEPLOY_DIR}/.env" <<'EOF'
# ── Fill these in with real production values, then chmod 600 this file ──
DATABASE_URL="mysql://<user>:<password>@<rds-endpoint>:3306/wedding_db"
JWT_SECRET="change-me-min-32-chars"
JWT_EXPIRES_IN="30m"
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
MEILISEARCH_API_KEY=""
API_PORT=4000
NODE_ENV="production"
NEXT_PUBLIC_API_URL="https://your-domain.com/api/v1"
EOF
  chmod 600 "${DEPLOY_DIR}/.env"
fi

echo "==> Done."
echo "Next steps:"
echo "  1. Edit ${DEPLOY_DIR}/.env with real production values."
echo "  2. Edit ${DEPLOY_DIR}/docker/Caddyfile with your real domain."
echo "  3. Add the GitHub Actions deploy public key to ~/.ssh/authorized_keys"
echo "     (this instance's own key pair is for YOUR access only — keep the CI key separate)."
echo "  4. Log out and back in (or run 'newgrp docker') so the docker group membership takes effect."
echo "  5. From ${DEPLOY_DIR}, run: docker compose -f docker-compose.prod.yml build && docker compose -f docker-compose.prod.yml up -d"
