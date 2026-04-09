#!/bin/bash
# Deployment Script für Schichtkommunikationstool
# Läuft auf Hetzner Ubuntu Server
#
# Usage: ./deploy.sh
# Voraussetzung: Script wird im Projekt-Root ausgeführt

set -e  # Exit bei Fehler

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Schichtkommunikationstool Deployment${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check ob wir im richtigen Verzeichnis sind
if [ ! -f "package.json" ]; then
    echo -e "${RED}Fehler: package.json nicht gefunden!${NC}"
    echo "Bitte führe das Script im Projekt-Root aus."
    exit 1
fi

# 1. Dependencies installieren
echo -e "${YELLOW}[1/6] Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installiert${NC}"
echo ""

# 2. Next.js Build
echo -e "${YELLOW}[2/6] Building Next.js production bundle...${NC}"
npm run build
echo -e "${GREEN}✓ Next.js Build erfolgreich${NC}"
echo ""

# 3. Daten-Verzeichnisse erstellen
echo -e "${YELLOW}[3/6] Creating data directories...${NC}"
mkdir -p data/{reports,aggregations/{shifts,kpis},media}
mkdir -p logs
echo -e "${GREEN}✓ Verzeichnisse erstellt${NC}"
echo ""

# 4. Docker Compose neu starten (PostgreSQL + Whisper)
echo -e "${YELLOW}[4/6] Restarting Docker services (PostgreSQL + Whisper)...${NC}"
docker compose -f docker-compose.prod.yml down || true
docker compose -f docker-compose.prod.yml up -d --build
echo -e "${GREEN}✓ Docker Services gestartet${NC}"
echo ""

# Warte bis PostgreSQL bereit ist
echo -e "${YELLOW}Waiting for PostgreSQL to be ready...${NC}"
for i in {1..30}; do
    if docker exec schichtkommunikationstool-postgres pg_isready -U postgres -d schichtkommunikationstool > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PostgreSQL ready${NC}"
        break
    fi
    echo -n "."
    sleep 1
done
echo ""

# 5. Database Migrations ausführen
echo -e "${YELLOW}[5/6] Running database migrations...${NC}"
npm run db:push
echo -e "${GREEN}✓ Database Migrations erfolgreich${NC}"
echo ""

# 6. PM2 neu starten/laden
echo -e "${YELLOW}[6/6] Reloading PM2 process...${NC}"
if pm2 describe schichtkommunikationstool > /dev/null 2>&1; then
    echo "PM2 process existiert bereits - reloading..."
    pm2 reload ecosystem.config.js --update-env
else
    echo "PM2 process nicht gefunden - starting..."
    pm2 start ecosystem.config.js
fi
pm2 save
echo -e "${GREEN}✓ PM2 reloaded${NC}"
echo ""

# Status-Check
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Status${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

echo "Docker Services:"
docker compose -f docker-compose.prod.yml ps
echo ""

echo "PM2 Processes:"
pm2 list
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✓ Deployment erfolgreich!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next.js läuft auf: http://localhost:3069"
echo "Whisper Service: http://localhost:8005"
echo "PostgreSQL: localhost:5433"
echo ""
echo "Public URL: https://schichtkommunikationstool.schreinercontentsystems.com"
echo ""
echo -e "${YELLOW}Logs anschauen:${NC}"
echo "  PM2: pm2 logs schichtkommunikationstool"
echo "  Docker: docker compose -f docker-compose.prod.yml logs -f"
echo ""
