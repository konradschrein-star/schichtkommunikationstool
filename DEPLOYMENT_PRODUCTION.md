# Production Deployment Guide - Schichtkommunikationstool

## Übersicht

Dieses Dokument beschreibt das Deployment auf dem Hetzner Ubuntu Server (`65.108.6.149`).

**Wichtig:** Das Tool läuft **komplett isoliert** neben Content Forge:
- Content Forge: Port 3000, PostgreSQL 5432, Redis 6379, `/opt/content-forge`
- Schichtkommunikationstool: Port 3069, PostgreSQL 5433, Whisper 8005, `/opt/schichtkommunikationstool`

---

## Voraussetzungen auf dem Server

- [x] Ubuntu Server (bereits vorhanden)
- [x] Node.js 20+ (bereits installiert)
- [x] Docker + Docker Compose (bereits installiert)
- [x] PM2 (bereits installiert)
- [x] NGINX (bereits installiert)
- [x] SSL-Zertifikate für `schichtkommunikationstool.schreinercontentsystems.com` (bereits vorhanden)

---

## Deployment Schritte

### 1. Projekt auf den Server hochladen

**Option A: Via Git (empfohlen)**
```bash
# Auf dem Server
cd /opt
git clone <DEIN_GIT_REPO_URL> schichtkommunikationstool
cd schichtkommunikationstool
```

**Option B: Via SCP (von deinem Laptop)**
```bash
# Komprimiere Projekt (ohne node_modules)
tar -czf schichtkommunikationstool.tar.gz \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=.git \
  .

# Upload via SCP
scp -i /tmp/ssh-key-temp.pem \
  schichtkommunikationstool.tar.gz \
  root@65.108.6.149:/opt/

# Auf dem Server entpacken
ssh -i /tmp/ssh-key-temp.pem root@65.108.6.149
cd /opt
tar -xzf schichtkommunikationstool.tar.gz -C schichtkommunikationstool
cd schichtkommunikationstool
```

---

### 2. Environment Variables konfigurieren

```bash
cd /opt/schichtkommunikationstool

# .env Datei erstellen
cp .env.production .env

# WICHTIG: Echte Werte eintragen!
nano .env
```

**Fülle aus:**
```bash
# 1. Encryption Key generieren
openssl rand -base64 32
# → Kopiere Output in ENCRYPTION_KEY

# 2. Anthropic API Key eintragen
# → DEFAULT_LLM_API_KEY=sk-ant-api03-...

# 3. PostgreSQL Password (optional ändern)
# → POSTGRES_PASSWORD=...
```

---

### 3. NGINX Config installieren

```bash
cd /opt/schichtkommunikationstool

# Backup der alten Config
sudo cp /etc/nginx/sites-available/schichtkommunikationstool.schreinercontentsystems.com \
     /etc/nginx/sites-available/schichtkommunikationstool.schreinercontentsystems.com.backup

# Neue Config installieren
sudo cp nginx.schichtkommunikationstool.conf \
     /etc/nginx/sites-available/schichtkommunikationstool.schreinercontentsystems.com

# Config testen
sudo nginx -t

# NGINX neu laden
sudo systemctl reload nginx
```

---

### 4. Deployment ausführen

```bash
cd /opt/schichtkommunikationstool

# Deploy-Script ausführbar machen
chmod +x deploy.sh

# Deployment starten
./deploy.sh
```

**Das Script führt automatisch aus:**
1. ✅ `npm install`
2. ✅ `npm run build`
3. ✅ Erstellt Daten-Verzeichnisse (`data/`, `logs/`)
4. ✅ Startet Docker Services (PostgreSQL + Whisper)
5. ✅ Führt Database Migrations aus (`npm run db:push`)
6. ✅ Startet/Reloaded PM2

---

### 5. Verifizierung

```bash
# Docker Services checken
docker compose -f docker-compose.prod.yml ps

# Sollte zeigen:
# schichtkommunikationstool-postgres  (Port 5433)
# schichtkommunikationstool-whisper   (Port 8005)

# PM2 checken
pm2 list

# Sollte zeigen:
# schichtkommunikationstool (Port 3069, online)

# NGINX checken
sudo systemctl status nginx

# Logs anschauen
pm2 logs schichtkommunikationstool --lines 50
docker compose -f docker-compose.prod.yml logs -f whisper-service
```

---

### 6. Test-URLs

**Intern (vom Server):**
```bash
curl http://localhost:3069
curl http://localhost:8005/health
```

**Extern (vom Browser):**
```
https://schichtkommunikationstool.schreinercontentsystems.com
```

---

## Updates / Re-Deployment

```bash
cd /opt/schichtkommunikationstool

# Code pullen (falls Git)
git pull origin main

# Oder: Neue Version via SCP hochladen und entpacken

# Deployment Script ausführen
./deploy.sh

# Das Script macht automatisch:
# - npm install (neue Dependencies)
# - npm run build (neuer Next.js Build)
# - Docker restart (falls Whisper-Code geändert)
# - DB Migrations (falls Schema geändert)
# - PM2 reload (zero-downtime)
```

---

## Troubleshooting

### Problem: PM2 startet nicht

```bash
# Logs checken
pm2 logs schichtkommunikationstool --err

# Häufige Ursachen:
# 1. .env fehlt oder ungültig
cat .env

# 2. Port 3069 bereits belegt
sudo lsof -i :3069

# 3. Next.js Build fehlgeschlagen
npm run build
```

### Problem: Docker Services crashen

```bash
# Logs checken
docker compose -f docker-compose.prod.yml logs postgres
docker compose -f docker-compose.prod.yml logs whisper-service

# PostgreSQL neu starten
docker compose -f docker-compose.prod.yml restart postgres

# Whisper neu starten
docker compose -f docker-compose.prod.yml restart whisper-service
```

### Problem: NGINX 502 Bad Gateway

```bash
# Check ob Next.js läuft
curl http://localhost:3069

# Falls nicht: PM2 neu starten
pm2 restart schichtkommunikationstool

# NGINX Config testen
sudo nginx -t

# NGINX Logs
sudo tail -f /var/log/nginx/error.log
```

### Problem: Database Connection Failed

```bash
# Check ob PostgreSQL Container läuft
docker ps | grep schichtkommunikationstool-postgres

# Connection testen
docker exec schichtkommunikationstool-postgres \
  psql -U postgres -d schichtkommunikationstool -c "SELECT 1;"

# Falls Passwort falsch: In .env und docker-compose.prod.yml anpassen
```

---

## Monitoring

### Logs in Echtzeit

```bash
# Next.js (PM2)
pm2 logs schichtkommunikationstool

# Whisper Service
docker compose -f docker-compose.prod.yml logs -f whisper-service

# PostgreSQL
docker compose -f docker-compose.prod.yml logs -f postgres

# NGINX
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Resource Usage

```bash
# PM2 Monitoring
pm2 monit

# Docker Stats
docker stats schichtkommunikationstool-postgres schichtkommunikationstool-whisper

# System-weit
htop
```

---

## Backup

### Database Backup

```bash
# Manuelles Backup
docker exec schichtkommunikationstool-postgres \
  pg_dump -U postgres schichtkommunikationstool | gzip > backup-$(date +%Y%m%d).sql.gz

# Automatisches Backup (täglich 3 Uhr nachts)
# Crontab eintragen:
sudo crontab -e

# Hinzufügen:
0 3 * * * docker exec schichtkommunikationstool-postgres pg_dump -U postgres schichtkommunikationstool | gzip > /opt/backups/schichtkommunikationstool-$(date +\%Y\%m\%d).sql.gz
```

### Data Files Backup

```bash
# Data-Verzeichnis sichern
tar -czf data-backup-$(date +%Y%m%d).tar.gz /opt/schichtkommunikationstool/data
```

---

## Deinstallation (falls nötig)

```bash
# PM2 stoppen und entfernen
pm2 delete schichtkommunikationstool
pm2 save

# Docker Services stoppen und entfernen
cd /opt/schichtkommunikationstool
docker compose -f docker-compose.prod.yml down -v

# NGINX Config entfernen
sudo rm /etc/nginx/sites-enabled/schichtkommunikationstool.schreinercontentsystems.com
sudo rm /etc/nginx/sites-available/schichtkommunikationstool.schreinercontentsystems.com
sudo systemctl reload nginx

# Projekt-Verzeichnis löschen (VORSICHT!)
sudo rm -rf /opt/schichtkommunikationstool
```

---

## Kontakt / Support

Bei Problemen:
1. Logs checken (siehe Monitoring-Sektion)
2. Troubleshooting-Sektion durchgehen
3. `/opt/schichtkommunikationstool/DEPLOYMENT_AND_DEMO.md` konsultieren

---

**Status:** Production Ready ✅
**Letzte Aktualisierung:** 2026-04-09
