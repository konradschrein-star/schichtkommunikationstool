# ShiftSync MVP Deployment Guide

## Overview

This guide will walk you through deploying the new ShiftSync MVP (v0.1.0) to your Hetzner production server.

**Server Details:**
- IP: `65.108.6.149`
- Domain: `https://schichtkommunikationstool.schreinercontentsystems.com`
- Next.js Port: `3069`
- PostgreSQL Port: `5433`
- Whisper Service Port: `8005`

**Infrastructure:**
- Next.js app managed by PM2
- PostgreSQL + Whisper in Docker containers
- NGINX reverse proxy

---

## Prerequisites

Before deployment, ensure:

1. All changes are committed and tagged as `v0.1.0-mvp`
2. Production build tested locally (`npm run build`)
3. You have SSH access to the server
4. Server has PM2, Docker, and Docker Compose installed

---

## Step 1: Prepare for Deployment

### Option A: Using Git (Recommended)

If you have a Git repository set up:

```bash
# Ensure all changes are committed
git add .
git commit -m "Ready for production deployment - v0.1.0-mvp"
git tag v0.1.0-mvp
git push origin main --tags
```

### Option B: Create Deployment Archive

If not using Git, create a tarball:

```bash
# From your local project root
tar --exclude='node_modules' \
    --exclude='.next' \
    --exclude='.git' \
    --exclude='data' \
    --exclude='logs' \
    --exclude='.env.local' \
    -czf shiftsync-mvp-v0.1.0.tar.gz .

# Verify archive was created
ls -lh shiftsync-mvp-mvp-v0.1.0.tar.gz
```

---

## Step 2: Upload to Server

### Option A: Using SCP (if using archive method)

```bash
# Upload the archive to server
scp shiftsync-mvp-v0.1.0.tar.gz root@65.108.6.149:/opt/

# Or if using SSH key authentication:
scp -i ~/.ssh/your_key shiftsync-mvp-v0.1.0.tar.gz root@65.108.6.149:/opt/
```

### Option B: Pull from Git (if using Git method)

```bash
# SSH into server first, then pull latest code (see Step 3)
```

---

## Step 3: Deploy on Server

### 3.1 SSH into Server

```bash
# Connect to server
ssh root@65.108.6.149

# Or with SSH key:
ssh -i ~/.ssh/your_key root@65.108.6.149
```

### 3.2 Backup Current Installation (IMPORTANT!)

```bash
# Create backup of current installation
cd /opt
sudo cp -r schichtkommunikationstool schichtkommunikationstool.backup.$(date +%Y%m%d-%H%M%S)

# Verify backup was created
ls -la | grep schichtkommunikationstool.backup
```

### 3.3 Deploy New Code

**If using Git:**

```bash
cd /opt/schichtkommunikationstool
git fetch --all --tags
git checkout v0.1.0-mvp
```

**If using Archive:**

```bash
cd /opt/schichtkommunikationstool
tar -xzf /opt/shiftsync-mvp-v0.1.0.tar.gz
```

### 3.4 Configure Environment Variables

```bash
cd /opt/schichtkommunikationstool

# Create/update .env file from .env.production template
cp .env.production .env

# Edit .env with your actual secrets
nano .env
```

**Important: Update these values in `.env`:**

```bash
# Generate a secure encryption key:
openssl rand -base64 32

# Then update these in .env:
ENCRYPTION_KEY=your_generated_key_here
DEFAULT_LLM_API_KEY=your_anthropic_api_key_here
```

**Your `.env` should look like:**

```env
NODE_ENV=production
PORT=3069
DATABASE_URL=postgresql://postgres:schichtkommunikations_secure_pw_2026@localhost:5433/schichtkommunikationstool
WHISPER_SERVICE_URL=http://localhost:8005
DATA_ROOT_PATH=/opt/schichtkommunikationstool/data
ENCRYPTION_KEY=your_generated_encryption_key
DEFAULT_LLM_PROVIDER=anthropic
DEFAULT_LLM_API_KEY=your_anthropic_api_key
POSTGRES_PASSWORD=schichtkommunikations_secure_pw_2026
```

### 3.5 Update ecosystem.config.js

```bash
# Update ecosystem.config.js with the same secrets
nano ecosystem.config.js
```

Replace the placeholder values in the `env` section:
- `ENCRYPTION_KEY`
- `DEFAULT_LLM_API_KEY`

### 3.6 Run Deployment Script

```bash
# Make script executable (if not already)
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

The deployment script will:
1. Install NPM dependencies
2. Build Next.js production bundle
3. Create data directories
4. Restart Docker services (PostgreSQL + Whisper)
5. Run database migrations
6. Reload PM2 process

**Expected output:**

```
========================================
Schichtkommunikationstool Deployment
========================================

[1/6] Installing dependencies...
✓ Dependencies installiert

[2/6] Building Next.js production bundle...
✓ Next.js Build erfolgreich

[3/6] Creating data directories...
✓ Verzeichnisse erstellt

[4/6] Restarting Docker services (PostgreSQL + Whisper)...
✓ Docker Services gestartet

[5/6] Running database migrations...
✓ Database Migrations erfolgreich

[6/6] Reloading PM2 process...
✓ PM2 reloaded

========================================
✓ Deployment erfolgreich!
========================================
```

### 3.7 Seed Demo Data

```bash
# Seed the database with demo users and data
npm run seed-demo
```

**Demo users created:**
- Worker: `max@schreiner.com` / `worker123`
- Shift Leader: `anna@schreiner.com` / `leader123`
- Boss: `boss@schreiner.com` / `boss123`

---

## Step 4: Verification

### 4.1 Check Services Status

```bash
# Check PM2 process
pm2 list

# Expected output:
# ┌─────┬────────────────────────────┬─────────┬─────────┐
# │ id  │ name                       │ status  │ restart │
# ├─────┼────────────────────────────┼─────────┼─────────┤
# │ 0   │ schichtkommunikationstool  │ online  │ 0       │
# └─────┴────────────────────────────┴─────────┴─────────┘

# Check Docker containers
docker compose -f docker-compose.prod.yml ps

# Expected output: Both postgres and whisper-service should be "running"
```

### 4.2 Check Logs

```bash
# Check PM2 logs for errors
pm2 logs schichtkommunikationstool --lines 50

# Check Docker logs
docker compose -f docker-compose.prod.yml logs -f --tail=50
```

### 4.3 Test Services

```bash
# Test Next.js app
curl http://localhost:3069

# Test Whisper service health
curl http://localhost:8005/health

# Test PostgreSQL connection
docker exec schichtkommunikationstool-postgres pg_isready -U postgres -d schichtkommunikationstool
```

### 4.4 Visit Website

Open in browser:
```
https://schichtkommunikationstool.schreinercontentsystems.com
```

**Expected:**
- New ShiftSync MVP UI loads
- Login page appears with clean, modern design
- Dark mode toggle works
- Responsive on mobile and desktop

**Test login with demo user:**
- Email: `boss@schreiner.com`
- Password: `boss123`

---

## Step 5: Post-Deployment Tasks

### 5.1 Monitor for 15 minutes

```bash
# Watch PM2 logs
pm2 logs schichtkommunikationstool

# Look for:
# - No errors
# - Successful API calls
# - Database connections working
```

### 5.2 Test Key Features

1. **Login** - Test all 3 user roles
2. **Audio Recording** - Test voice-to-text (Worker role)
3. **Dashboard** - Check Boss dashboard charts load
4. **Dark/Light Mode** - Toggle theme
5. **Mobile View** - Test on mobile device

### 5.3 Performance Check

```bash
# Check memory usage
pm2 monit

# Check server resources
htop
```

---

## Rollback Plan

If something goes wrong, you can quickly rollback:

### Quick Rollback

```bash
# Stop current deployment
pm2 stop schichtkommunikationstool
docker compose -f docker-compose.prod.yml down

# Restore backup
cd /opt
sudo rm -rf schichtkommunikationstool
sudo mv schichtkommunikationstool.backup.YYYYMMDD-HHMMSS schichtkommunikationstool

# Restart services
cd schichtkommunikationstool
docker compose -f docker-compose.prod.yml up -d
pm2 start ecosystem.config.js
pm2 save
```

### Database Rollback

If database migration fails:

```bash
# The old backup has the old database
# PostgreSQL data is in Docker volume: schichtkommunikationstool-pgdata
# You can restore from volume backup if needed

# To reset database completely:
docker compose -f docker-compose.prod.yml down -v  # WARNING: Deletes all data!
docker compose -f docker-compose.prod.yml up -d
npm run db:push
npm run seed-demo
```

---

## Troubleshooting

### Issue: PM2 process won't start

```bash
# Check for port conflicts
sudo lsof -i :3069

# Check PM2 error logs
pm2 logs schichtkommunikationstool --err --lines 100

# Try manual start
cd /opt/schichtkommunikationstool
NODE_ENV=production PORT=3069 npm start
```

### Issue: Docker containers won't start

```bash
# Check Docker logs
docker compose -f docker-compose.prod.yml logs postgres
docker compose -f docker-compose.prod.yml logs whisper-service

# Rebuild containers
docker compose -f docker-compose.prod.yml up -d --build --force-recreate
```

### Issue: Database connection fails

```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Check database exists
docker exec schichtkommunikationstool-postgres psql -U postgres -c '\l'

# Test connection
docker exec schichtkommunikationstool-postgres psql -U postgres -d schichtkommunikationstool -c 'SELECT 1;'
```

### Issue: Whisper service fails

```bash
# Check Whisper logs
docker logs schichtkommunikationstool-whisper

# Common issue: Not enough memory
# Solution: Reduce model size in docker-compose.prod.yml
# Change: MODEL_SIZE=medium to MODEL_SIZE=small
```

### Issue: NGINX 502 Bad Gateway

```bash
# Check NGINX config
sudo nginx -t

# Check NGINX is running
sudo systemctl status nginx

# Reload NGINX
sudo systemctl reload nginx
```

---

## Maintenance Commands

### Useful Commands for Later

```bash
# View logs
pm2 logs schichtkommunikationstool
docker compose -f docker-compose.prod.yml logs -f

# Restart services
pm2 restart schichtkommunikationstool
docker compose -f docker-compose.prod.yml restart

# Update code (Git method)
cd /opt/schichtkommunikationstool
git pull origin main
npm install
npm run build
pm2 reload schichtkommunikationstool

# Backup database
docker exec schichtkommunikationstool-postgres pg_dump -U postgres schichtkommunikationstool > backup-$(date +%Y%m%d).sql

# Restore database
cat backup-20260409.sql | docker exec -i schichtkommunikationstool-postgres psql -U postgres schichtkommunikationstool
```

---

## Security Checklist

- [ ] `.env` file has secure encryption key
- [ ] LLM API key is set and valid
- [ ] PostgreSQL password is secure (not default)
- [ ] NGINX HTTPS is configured
- [ ] Firewall allows only ports 80, 443, 22
- [ ] PM2 auto-restart is enabled (`pm2 startup`)
- [ ] Docker containers have resource limits

---

## Success Criteria

Deployment is successful when:

- ✅ Website loads at `https://schichtkommunikationstool.schreinercontentsystems.com`
- ✅ New MVP UI is visible (modern, clean design)
- ✅ Demo users can log in
- ✅ Dark/Light mode toggle works
- ✅ Worker can record audio (Whisper service works)
- ✅ Boss dashboard shows charts
- ✅ Mobile responsive UI works
- ✅ No errors in PM2 logs
- ✅ No errors in Docker logs
- ✅ Services restart after server reboot

---

## Contact & Support

If deployment fails and you need help:

1. Save all error logs:
   ```bash
   pm2 logs schichtkommunikationstool --err --lines 500 > pm2-errors.log
   docker compose -f docker-compose.prod.yml logs > docker-errors.log
   ```

2. Check system resources:
   ```bash
   df -h  # Disk space
   free -h  # Memory
   htop  # CPU usage
   ```

3. Review this deployment guide step-by-step

---

## Deployment Checklist

**Pre-Deployment:**
- [ ] All code committed and tagged `v0.1.0-mvp`
- [ ] Production build tested locally
- [ ] Archive created or Git repo ready
- [ ] SSH access confirmed

**Deployment:**
- [ ] Backup created
- [ ] Code uploaded/pulled
- [ ] `.env` configured with secrets
- [ ] `ecosystem.config.js` updated with secrets
- [ ] `./deploy.sh` executed successfully
- [ ] Demo data seeded

**Verification:**
- [ ] PM2 process online
- [ ] Docker containers running
- [ ] Website loads
- [ ] Login works
- [ ] Audio recording works
- [ ] Dashboard charts load
- [ ] Mobile view works
- [ ] No errors in logs

**Post-Deployment:**
- [ ] Monitored for 15+ minutes
- [ ] All features tested
- [ ] Performance acceptable
- [ ] Backup retention confirmed

---

**Last updated:** 2026-04-09
**Version:** v0.1.0-mvp
**Status:** Ready for Production Deployment 🚀
