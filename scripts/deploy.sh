#!/bin/bash
# =============================================================================
# Nature Marketplace - Production Deployment Script
# =============================================================================
# Usage: ./scripts/deploy.sh
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🌿 Nature Marketplace - Production Deployment${NC}"
echo "================================================"

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${RED}Error: .env.production file not found!${NC}"
    echo "Copy .env.production.example to .env.production and fill in your values."
    exit 1
fi

# Load environment variables
export $(grep -v '^#' .env.production | xargs)

echo -e "${YELLOW}📦 Step 1: Pulling latest code...${NC}"
git pull origin main

echo -e "${YELLOW}🔨 Step 2: Building Docker images...${NC}"
docker compose -f docker-compose.prod.yml build --no-cache

echo -e "${YELLOW}🛑 Step 3: Stopping existing containers...${NC}"
docker compose -f docker-compose.prod.yml down

echo -e "${YELLOW}🚀 Step 4: Starting services...${NC}"
docker compose -f docker-compose.prod.yml --env-file .env.production up -d

echo -e "${YELLOW}⏳ Step 5: Waiting for database...${NC}"
sleep 10

echo -e "${YELLOW}🗃️ Step 6: Running database migrations...${NC}"
docker compose -f docker-compose.prod.yml exec -T backend python manage.py migrate --noinput

echo -e "${YELLOW}📁 Step 7: Collecting static files...${NC}"
docker compose -f docker-compose.prod.yml exec -T backend python manage.py collectstatic --noinput

echo -e "${YELLOW}🧹 Step 8: Cleaning up old images...${NC}"
docker image prune -f

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Services running:"
docker compose -f docker-compose.prod.yml ps
echo ""
echo -e "${GREEN}🌐 Your site should be available at: https://${DOMAIN}${NC}"
