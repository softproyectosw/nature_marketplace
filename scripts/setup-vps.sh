#!/bin/bash
# =============================================================================
# Nature Marketplace - VPS Initial Setup Script (Ubuntu/Debian)
# =============================================================================
# Run this ONCE on a fresh VPS to install Docker and dependencies
# Usage: curl -sSL https://raw.githubusercontent.com/YOUR_REPO/main/scripts/setup-vps.sh | bash
# =============================================================================

set -e

echo "🌿 Nature Marketplace - VPS Setup"
echo "=================================="

# Update system
echo "📦 Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install required packages
echo "📦 Installing dependencies..."
sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    ufw

# Install Docker
echo "🐳 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
rm get-docker.sh

# Add current user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
echo "🐳 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Configure firewall
echo "🔥 Configuring firewall..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Create app directory
echo "📁 Creating application directory..."
sudo mkdir -p /opt/nature-marketplace
sudo chown $USER:$USER /opt/nature-marketplace

# Enable Docker to start on boot
sudo systemctl enable docker
sudo systemctl start docker

echo ""
echo "✅ VPS Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Log out and log back in (for docker group)"
echo "2. Clone your repository to /opt/nature-marketplace"
echo "3. Copy .env.production.example to .env.production"
echo "4. Configure Cloudflare DNS"
echo "5. Run ./scripts/deploy.sh"
echo ""
echo "Commands:"
echo "  cd /opt/nature-marketplace"
echo "  git clone YOUR_REPO_URL ."
echo "  cp .env.production.example .env.production"
echo "  nano .env.production  # Edit with your values"
echo "  chmod +x scripts/*.sh"
echo "  ./scripts/deploy.sh"
