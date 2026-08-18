#!/bin/bash
# Quick setup script for Expert Decision Replay Platform

set -e

echo "🚀 Expert Decision Replay Platform - Setup Script"
echo "=================================================="

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running from correct directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: docker-compose.yml not found. Please run from project root."
    exit 1
fi

echo -e "${BLUE}Step 1: Creating environment file...${NC}"
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env file${NC}"
    echo "⚠️  Please update .env with your configuration"
else
    echo -e "${GREEN}✓ .env already exists${NC}"
fi

echo ""
echo -e "${BLUE}Step 2: Building Docker images...${NC}"
docker-compose build
echo -e "${GREEN}✓ Docker images built${NC}"

echo ""
echo -e "${BLUE}Step 3: Starting services...${NC}"
docker-compose up -d
echo -e "${GREEN}✓ Services started${NC}"

echo ""
echo -e "${BLUE}Waiting for services to be healthy...${NC}"
sleep 5

echo ""
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo -e "${YELLOW}Access Points:${NC}"
echo "  Frontend:  ${GREEN}http://localhost:3000${NC}"
echo "  Backend:   ${GREEN}http://localhost:8000${NC}"
echo "  API Docs:  ${GREEN}http://localhost:8000/api/docs${NC}"
echo "  Database:  ${GREEN}localhost:5432${NC}"
echo ""
echo -e "${YELLOW}Useful Commands:${NC}"
echo "  View logs:           ${GREEN}docker-compose logs -f${NC}"
echo "  Stop services:       ${GREEN}docker-compose down${NC}"
echo "  Run backend tests:   ${GREEN}docker-compose run --rm backend pytest tests/${NC}"
echo "  Database shell:      ${GREEN}docker-compose exec postgres psql -U edp_user -d expert_decision_replay${NC}"
echo ""
echo "📚 Documentation:"
echo "  Testing:   TESTING.md"
echo "  Bugs:      BUG_FIXES.md"
echo "  Docker:    DOCKER_DEPLOYMENT.md"
echo "  Summary:   IMPLEMENTATION_SUMMARY.md"
