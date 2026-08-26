#!/usr/bin/env bash
# Run once on a fresh EC2 instance (Ubuntu 22.04, t3.micro) over SSH:
#   scp infra/ec2-bootstrap.sh ubuntu@<elastic-ip>:~/
#   ssh ubuntu@<elastic-ip> 'chmod +x ec2-bootstrap.sh && ./ec2-bootstrap.sh'
#
# Installs Docker, adds a 1GB swap file (t3.micro only has 1GB RAM — builds
# need the headroom), and clones this repo into /opt/vendor-connect.
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/milandawijekoon/vendor_connect.git}"
DEPLOY_DIR="/opt/vendor-connect"

echo "==> Updating packages"
sudo apt-get update -y
sudo apt-get upgrade -y

echo "==> Installing Docker Engine + compose plugin"
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sudo sh
  sudo usermod -aG docker "$USER"
fi

echo "==> Installing git"
sudo apt-get install -y git

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
echo "     (or reuse this instance's existing key pair, restricted to this IP in the EC2 security group)."
echo "  4. Log out and back in (or run 'newgrp docker') so the docker group membership takes effect."
echo "  5. From ${DEPLOY_DIR}, run: docker compose -f docker-compose.prod.yml build && docker compose -f docker-compose.prod.yml up -d"
