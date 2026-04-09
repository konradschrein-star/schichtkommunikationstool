# ShiftSync MVP - Deployment & Demo Guide

**Der ultimative Leitfaden für Präsentation und Production Deployment**

---

## 📊 TEIL 1: END-TO-END DEMO-SKRIPT (Der Pitch)

### Ziel
Zeige dem Bauunternehmer in **5 Minuten**, wie ShiftSync:
1. **Mehrarbeit dokumentiert** (VOB/B §6 konform)
2. **Zeit spart** (keine Papier-Reports mehr)
3. **Geld rettet** (Materialverluste & Verzögerungen sichtbar)

---

### Der Aufbau: 3-Akt-Struktur

**Akt 1**: Problem (30 Sekunden)
> "Aktuell verlieren Sie bis zu €200.000 jährlich durch undokumentierte Mehrarbeit. Bauarbeiter berichten mündlich, Schichtleiter vergessen Details, VOB/B-Anzeigen werden zu spät gestellt."

**Akt 2**: Lösung (3 Minuten - Live Demo)
> "ShiftSync löst das mit KI und Voice-First. Schauen Sie..."

**Akt 3**: Impact (1 Minute)
> "Stellen Sie sich vor: Morgen früh öffnen Sie Ihr Dashboard und sehen **exakt**, wo gestern €3.200 Materialkosten entstanden sind und ob Ihre Top-Performer ausgelastet waren."

---

### Pre-Demo Setup Checklist

**Browser-Tabs vorbereiten (in dieser Reihenfolge):**

1. **Tab 1**: `http://localhost:3000/worker?workerId=demo-worker-001&workerName=Piotr%20Kowalski&profession=Baggerfahrer`
   - Hier startest du
   - **Tipp**: Vorher einmal öffnen, damit Mikrofon-Permission bereits erteilt ist

2. **Tab 2**: `http://localhost:3000/shift-leader`
   - Hier klickst du "Schicht beenden"

3. **Tab 3**: `http://localhost:3000/boss/dashboard?period=week`
   - Das Finale - hier siehst du die KPIs

**Datenbank-Setup vor der Demo:**

```sql
-- 1. Aktive Schicht erstellen
INSERT INTO shifts (id, date, type, project_name, status, leader_id, started_at)
VALUES (
  'demo-shift-2026-04-08',
  '2026-04-08',
  'DAY',
  'Gleisbau Berlin Hauptbahnhof - Sektor 4',
  'active',
  NULL,
  NOW()
);

-- 2. Zwei vorherige abgeschlossene Schichten (für Charts im Boss Dashboard)
INSERT INTO shifts (id, date, type, project_name, status, completed_at)
VALUES
  ('demo-past-1', NOW() - INTERVAL '1 day', 'NIGHT', 'Gleisbau Berlin Hbf - Sektor 4', 'completed', NOW() - INTERVAL '1 day'),
  ('demo-past-2', NOW() - INTERVAL '2 days', 'DAY', 'Gleisbau Berlin Hbf - Sektor 4', 'completed', NOW() - INTERVAL '2 days');

-- 3. Aggregationen für die alten Schichten (damit Boss-Charts nicht leer sind)
INSERT INTO shift_aggregations (id, shift_id, summary_markdown_path, structured_summary, kpis)
VALUES
  (
    'agg-past-1',
    'demo-past-1',
    '/data/aggregations/demo-1.md',
    '{"completed": ["Rohrleitungen verlegt"], "inProgress": ["Fundamentierung"], "blocked": [], "nextShiftActions": ["Betonierung fortsetzen"], "criticalIssues": []}'::jsonb,
    '{"totalWorkers": 10, "productivityScore": 82, "delayMinutes": 30, "materialCostEUR": 1800, "hindranceEvents": 1, "topPerformer": "Max Müller", "underperformer": "N/A"}'::jsonb
  ),
  (
    'agg-past-2',
    'demo-past-2',
    '/data/aggregations/demo-2.md',
    '{"completed": ["Aushub Sektor 4 West"], "inProgress": [], "blocked": [], "nextShiftActions": ["Rohre einsetzen"], "criticalIssues": []}'::jsonb,
    '{"totalWorkers": 12, "productivityScore": 88, "delayMinutes": 0, "materialCostEUR": 450, "hindranceEvents": 0, "topPerformer": "Anna Schmidt", "underperformer": "N/A"}'::jsonb
  );
```

**API-Schlüssel hinterlegen (falls noch nicht geschehen):**

```typescript
// In einer temporären Next.js Route oder direkt in psql:
import { storeApiKey } from '@/lib/api-keys';
await storeApiKey('BOSS', 'sk-ant-api03-...', 'anthropic');
```

**Whisper Service laufen lassen:**
```bash
cd whisper-service
python main.py
# Sollte auf http://localhost:8000 laufen
```

---

### Das Demo-Skript (Wort für Wort)

#### **Szene 1: Worker Interface (60 Sekunden)**

**Du sprichst:**
> "Hier ist Piotr, Baggerfahrer auf der Baustelle. Ende der Schicht. Er zückt sein Handy und tippt einmal."

**Aktion:** Klicke auf den grünen "Aufnahme starten" Button.

**Du sprichst ins Mikrofon (Beispiel-Text):**

```
Hallo, hier ist Piotr. Ich habe heute im Sektor 4, Achse 7 gearbeitet.
Wir mussten ein undokumentiertes Abwasserrohr DN500 umgraben.
Das hat uns etwa zwei Stunden Stillstand gekostet.
Der Bagger konnte in dieser Zeit nicht weiterarbeiten.
Wir haben dann zwanzig Kubikmeter Kies verwendet, um das Rohr freizulegen
und die Grube wieder zu verfüllen.
Insgesamt habe ich heute von acht Uhr bis sechzehn Uhr gearbeitet.
```

**Wichtig:**
- **Dieser Text enthält ALLES**, was der QA-Agent braucht:
  - ✅ Ort: "Sektor 4, Achse 7"
  - ✅ Tätigkeit: "undokumentiertes Abwasserrohr umgraben"
  - ✅ Verzögerung: "zwei Stunden Stillstand"
  - ✅ Material: "zwanzig Kubikmeter Kies"
  - ✅ Maschinenstunden: "Bagger konnte nicht weiterarbeiten"
  - ✅ Behinderung (VOB/B §6): "undokumentiertes Rohr" → hindrance: true
  - ✅ Zeit: "acht Uhr bis sechzehn Uhr"

**Aktion:** Stoppe die Aufnahme nach ~30 Sekunden.

**Du sprichst:**
> "Jetzt passiert die Magie. Die KI transkribiert, prüft auf Vollständigkeit, und speichert alles rechtskonform ab."

**Erwartung:**
- "Wird hochgeladen..." (2-3 Sekunden)
- "KI analysiert deinen Bericht..." (10-20 Sekunden)
- ✅ "Erfolgreich gespeichert!"

**Falls QA-Agent Fragen hat (sollte bei obigem Text NICHT passieren):**
- Zeige das gelbe Overlay
- Sage: "Hier sehen Sie den intelligenten Feedback-Loop. Falls der Arbeiter etwas vergessen hat, fragt die KI nach."

---

#### **Alternative: Absichtlich unvollständiger Text (um QA-Loop zu zeigen)**

Falls du den QA-Feedback-Loop demonstrieren willst, nutze stattdessen:

```
Hallo, ich habe heute im Sektor 4 gearbeitet.
Wir hatten ein Problem mit einem Rohr und mussten umgraben.
Das hat länger gedauert als geplant.
```

**Erwartung:**
- QA-Agent gibt zurück: `needsInput: true`
- Overlay zeigt z.B.:
  - "Welche Art von Rohr war das?"
  - "Wie viele Stunden Verzögerung gab es?"
  - "Wurde Material verwendet?"

**Du sagst:**
> "Sehen Sie? Die KI erkennt, dass VOB/B-relevante Infos fehlen. Der Arbeiter kann sofort nachsprechen."

---

#### **Szene 2: Shift Leader Interface (90 Sekunden)**

**Du wechselst Tab zu:** `http://localhost:3000/shift-leader`

**Du sprichst:**
> "Ende der Schicht. Der Schichtleiter öffnet sein Tablet..."

**Falls noch keine Aggregation vorhanden:**
- Zeige die "Noch keine abgeschlossene Schicht" Seite
- Zeige den "Aktuelle Schicht beenden" Button

**Du sprichst:**
> "Ein Klick – und die KI analysiert ALLE Worker-Reports dieser Schicht."

**Aktion:** Klicke "Aktuelle Schicht beenden" → Bestätige im Dialog.

**Erwartung:**
- Fullscreen-Overlay erscheint
- Progress-Steps laufen durch:
  - ✓ Worker-Reports sammeln
  - → Shift-Aggregation läuft... (20-40 Sekunden)
  - ○ Boss-KPIs extrahieren
  - ○ Markdown speichern

**Du sprichst (während es lädt):**
> "In diesen 30 Sekunden passiert mehr als ein Schichtleiter in einer Stunde manuell schaffen würde:
> - Alle Berichte werden zusammengefasst
> - VOB/B-Behinderungen werden identifiziert
> - Materialkosten werden hochgerechnet
> - To-Dos für die nächste Schicht werden generiert."

**Nach Reload:**
- Zeige die 4-Quadranten-Ansicht
- Scrolle zu **BLOCKER** (rot) und sage:
  > "Hier: Das undokumentierte Rohr. Sofort sichtbar. Rot markiert. Der nächste Schichtleiter weiß Bescheid."

- Zeige **Übergabe / To-Dos**:
  > "Und hier: Die nächste Schicht weiß genau, wo sie ansetzen muss."

---

#### **Szene 3: Boss Dashboard (60 Sekunden - Das Finale)**

**Du wechselst Tab zu:** `http://localhost:3000/boss/dashboard?period=week`

**Du sprichst:**
> "Und jetzt das, was Ihnen als Geschäftsführer das Geld rettet."

**Zeige nacheinander:**

1. **KPI Cards (oben):**
   - "Leakage / Verlust: €3.200"
     > "Das sind die EXAKTEN Kosten, die durch Verzögerungen und ungeplante Materialverwendung entstanden sind. Früher: unsichtbar. Jetzt: schwarz auf weiß."

   - "Produktivitäts-Score: 88%"
     > "Ihre Teams arbeiten gut. Aber wenn dieser Wert unter 80% fällt, wissen Sie sofort: Da läuft etwas schief."

   - "Kritische VOB/B Behinderungen: 2"
     > "Das sind Ihre rechtlich relevanten Mehrarbeiten. Dokumentiert. Abrechenbar. Kein Cent verschenkt."

2. **Produktivitäts-Chart (links):**
   > "Hier sehen Sie die Woche im Überblick. Gestern ein Einbruch? Sie können sofort nachfragen."

3. **Hindrance Heatmap (rechts):**
   > "Und diese Heatmap zeigt Ihnen: Wann treten Behinderungen auf? Nachtschicht problematischer als Tagschicht? Sie sehen es auf einen Blick."

4. **Leaderboard (unten):**
   > "Hier: Ihre Top-Performer. Max Müller war gestern der Produktivste. Anna Schmidt die Woche davor. Sie können gezielt loben – oder gezielt nachfragen, wenn jemand auffällt."

**Du schließt:**
> "Das alles – von der Stimme des Arbeiters bis zu diesen KPIs – passiert automatisch. Null Papier. Null manuelle Auswertung. Und vor allem: Null verlorenes Geld."

---

### Wow-Effekt maximieren: Pro-Tipps

1. **Timing ist alles**:
   - Übe das Demo vorher 2x durch
   - Die 30-60 Sekunden Ladezeit beim Shift-Abschluss nutzen für Kontext
   - Nicht zu schnell klicken – lass die UI atmen

2. **Storytelling > Features**:
   - Sage nicht: "Hier ist ein Chart"
   - Sage: "Stellen Sie sich vor, es ist Montag morgen 7 Uhr. Sie öffnen das Dashboard und sehen..."

3. **Zahlen wirken lassen**:
   - "€3.200 Verlust" → Pause → "Pro Schicht."
   - "2 VOB/B Behinderungen" → Pause → "Das sind potenzielle Nachträge."

4. **Backup-Plan bei technischen Problemen**:
   - Falls Whisper crashed: Vorher einen fertigen Report in der DB haben
   - Falls Aggregation fehlschlägt: Screenshot der fertigen Shift-Leader-UI bereithalten

---

### Audio-Beispiele: 3 Szenarien

#### **Szenario A: Perfekter Report (QA approved direkt)**
```
Hallo, hier ist Piotr Kowalski, Baggerfahrer.
Ich habe heute von acht bis sechzehn Uhr im Sektor 4, Achse 7 gearbeitet.
Wir haben Aushubarbeiten für Rohrverlegung durchgeführt.
Dabei sind wir auf ein undokumentiertes Abwasserrohr DN500 gestoßen.
Das hat uns zwei Stunden Stillstand gekostet.
Wir mussten zwanzig Kubikmeter Kies verwenden, um das Rohr freizulegen und zu sichern.
Der Bagger lief insgesamt vier Stunden heute.
```

**Boss-KPIs daraus:**
- `materialCostEUR`: ~€600 (20m³ Kies)
- `delayMinutes`: 120
- `hindranceEvents`: 1 (undokumentiertes Rohr)
- `machineHours`: 4
- `hindrance`: true (VOB/B §6 relevant)

---

#### **Szenario B: QA-Feedback-Loop (zeigt intelligente Nachfrage)**
```
Hi, ich habe heute im Sektor 4 gearbeitet.
Wir hatten ein Problem mit einem Rohr.
Das hat länger gedauert.
```

**QA-Agent Reaktion (erwartet):**
- "Welche Art von Rohr war das?" (Für taskType)
- "Wie viele Stunden Verzögerung?" (Für delayMinutes)
- "Wurde Material verwendet?" (Für materialUsed)

**Dann nochmal aufnehmen:**
```
Es war ein Abwasserrohr DN500.
Die Verzögerung war etwa zwei Stunden.
Wir haben zwanzig Kubikmeter Kies verwendet.
```

---

#### **Szenario C: Normaler Arbeitstag (keine Behinderungen)**
```
Hallo, Piotr hier.
Heute von acht bis sechzehn Uhr Betonierarbeiten im Sektor 3.
Wir haben fünfzehn Kubikmeter Beton für das Fundament gegossen.
Alles lief nach Plan, keine Verzögerungen.
```

**Boss-KPIs:**
- `materialCostEUR`: ~€1.500 (15m³ Beton)
- `delayMinutes`: 0
- `hindranceEvents`: 0
- `hindrance`: false
- `productivityScore`: Hoch (95+)

---

## 🚀 TEIL 2: UBUNTU PRODUCTION DEPLOYMENT

### Voraussetzungen

- **Ubuntu 22.04 LTS** (oder 20.04)
- **Root-Zugriff** oder sudo-Rechte
- **Domain** (optional, für SSL - z.B. `shiftsync.example.com`)
- **Min. 4GB RAM** (wegen Whisper-Modell)
- **GPU empfohlen** (für schnelleres Whisper), aber CPU funktioniert auch

---

### Schritt 1: System-Updates & Dependencies

```bash
# System aktualisieren
sudo apt update && sudo apt upgrade -y

# Node.js 20 installieren (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node & npm
node -v  # sollte v20.x.x sein
npm -v   # sollte 10.x.x sein

# Python 3.11+ installieren (für Whisper)
sudo apt install -y python3.11 python3.11-venv python3-pip

# PostgreSQL installieren
sudo apt install -y postgresql postgresql-contrib

# NGINX installieren
sudo apt install -y nginx

# PM2 global installieren (für Next.js)
sudo npm install -g pm2

# Git installieren (falls nicht vorhanden)
sudo apt install -y git
```

---

### Schritt 2: PostgreSQL Setup

```bash
# PostgreSQL Service starten
sudo systemctl start postgresql
sudo systemctl enable postgresql

# PostgreSQL User & Database erstellen
sudo -u postgres psql <<EOF
CREATE USER shiftsync WITH PASSWORD 'IHR_STARKES_PASSWORT_HIER';
CREATE DATABASE shiftsync OWNER shiftsync;
GRANT ALL PRIVILEGES ON DATABASE shiftsync TO shiftsync;
\q
EOF

# Connection String notieren für .env:
# postgresql://shiftsync:IHR_PASSWORT@localhost:5432/shiftsync
```

---

### Schritt 3: Projekt klonen & Dependencies installieren

```bash
# Verzeichnis erstellen
sudo mkdir -p /var/www/shiftsync
sudo chown -R $USER:$USER /var/www/shiftsync
cd /var/www/shiftsync

# Repo klonen (passe die URL an dein Git-Repo an)
git clone https://github.com/IHR_USER/shiftsync-mvp.git .

# Node Dependencies installieren
npm install

# Python Dependencies für Whisper installieren
cd whisper-service
python3.11 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate
cd ..
```

---

### Schritt 4: Environment Variables (.env)

```bash
# .env Datei erstellen
nano .env
```

**Inhalt:**
```bash
# Database
DATABASE_URL=postgresql://shiftsync:IHR_PASSWORT@localhost:5432/shiftsync

# Encryption Key (für API-Keys KMS)
# Generiere mit: openssl rand -base64 32
ENCRYPTION_KEY=BASE64_STRING_HIER_EINFÜGEN

# Whisper Service
WHISPER_SERVICE_URL=http://localhost:8000

# Data Root
DATA_ROOT_PATH=/var/www/shiftsync/data

# LLM API Key (für Agenten - wird später auch in DB gespeichert)
DEFAULT_LLM_PROVIDER=anthropic
DEFAULT_LLM_API_KEY=sk-ant-api03-DEIN_KEY_HIER

# Next.js
NODE_ENV=production
PORT=3000
```

**Speichern:** `CTRL+O`, `Enter`, `CTRL+X`

**Encryption Key generieren:**
```bash
openssl rand -base64 32
# Output kopieren und in .env eintragen
```

---

### Schritt 5: Datenbank Migrations ausführen

```bash
# Drizzle Migrations generieren (falls noch nicht geschehen)
npm run db:generate

# Migrations auf Production DB anwenden
npm run db:migrate

# Alternativ: Direct Push (für schnelles Setup)
npm run db:push
```

**Test DB Connection:**
```bash
# Psql verbinden und Tabellen checken
sudo -u postgres psql -d shiftsync -c "\dt"
# Sollte zeigen: users, shifts, worker_reports, shift_aggregations, etc.
```

---

### Schritt 6: Fast-Whisper Service (systemd)

#### Option A: Via systemd (Empfohlen für Production)

```bash
# systemd Service-Datei erstellen
sudo nano /etc/systemd/system/whisper-service.service
```

**Inhalt:**
```ini
[Unit]
Description=Fast-Whisper Transcription Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/shiftsync/whisper-service
Environment="PATH=/var/www/shiftsync/whisper-service/venv/bin"
ExecStart=/var/www/shiftsync/whisper-service/venv/bin/python main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Service starten:**
```bash
sudo systemctl daemon-reload
sudo systemctl start whisper-service
sudo systemctl enable whisper-service

# Status checken
sudo systemctl status whisper-service

# Logs anschauen
sudo journalctl -u whisper-service -f
```

**Test:**
```bash
curl http://localhost:8000/health
# Sollte: {"status": "ok"} zurückgeben
```

---

#### Option B: Via Docker (falls bevorzugt)

```bash
# Docker installieren (falls nicht vorhanden)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# Dockerfile ist bereits in whisper-service/Dockerfile vorhanden
cd /var/www/shiftsync/whisper-service

# Docker Image bauen
docker build -t shiftsync-whisper:latest .

# Container starten (CPU)
docker run -d \
  --name whisper-service \
  --restart always \
  -p 8000:8000 \
  shiftsync-whisper:latest

# Oder mit GPU (falls NVIDIA installiert)
docker run -d \
  --name whisper-service \
  --restart always \
  --gpus all \
  -p 8000:8000 \
  shiftsync-whisper:latest

# Status checken
docker ps
curl http://localhost:8000/health
```

---

### Schritt 7: Next.js Build & PM2 Setup

```bash
cd /var/www/shiftsync

# Next.js Production Build
npm run build

# Mit PM2 starten
pm2 start npm --name "shiftsync-nextjs" -- start

# PM2 Auto-Restart bei Server-Reboot
pm2 startup
# (Führe den ausgegebenen Befehl aus, z.B. sudo env PATH=...)

pm2 save

# Status checken
pm2 status
pm2 logs shiftsync-nextjs

# Sollte zeigen: "ready started server on 0.0.0.0:3000"
```

**Test:**
```bash
curl http://localhost:3000
# Sollte HTML zurückgeben
```

---

### Schritt 8: NGINX Reverse Proxy Setup

```bash
# NGINX Config erstellen
sudo nano /etc/nginx/sites-available/shiftsync
```

**Inhalt (ohne SSL - für lokalen Test):**
```nginx
server {
    listen 80;
    server_name shiftsync.example.com;  # Ersetze mit deiner Domain oder IP

    client_max_body_size 50M;  # Wichtig für Audio-Uploads

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Whisper Service Proxy (optional, falls externe Zugriffe nötig)
    location /api/whisper/ {
        proxy_pass http://localhost:8000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Mit SSL (via Let's Encrypt - empfohlen für Production):**
```nginx
server {
    listen 80;
    server_name shiftsync.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name shiftsync.example.com;

    ssl_certificate /etc/letsencrypt/live/shiftsync.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/shiftsync.example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Config aktivieren:**
```bash
# Symlink erstellen
sudo ln -s /etc/nginx/sites-available/shiftsync /etc/nginx/sites-enabled/

# Default Config deaktivieren (optional)
sudo rm /etc/nginx/sites-enabled/default

# NGINX Config testen
sudo nginx -t

# NGINX neu starten
sudo systemctl restart nginx
sudo systemctl enable nginx
```

**SSL-Zertifikat mit Let's Encrypt (falls Domain vorhanden):**
```bash
# Certbot installieren
sudo apt install -y certbot python3-certbot-nginx

# SSL-Zertifikat automatisch einrichten
sudo certbot --nginx -d shiftsync.example.com

# Auto-Renewal testen
sudo certbot renew --dry-run
```

---

### Schritt 9: Data Directories erstellen

```bash
# Daten-Verzeichnisse anlegen
sudo mkdir -p /var/www/shiftsync/data/{reports,aggregations/{shifts,kpis},media}
sudo chown -R www-data:www-data /var/www/shiftsync/data
sudo chmod -R 755 /var/www/shiftsync/data
```

---

### Schritt 10: Firewall Setup (optional aber empfohlen)

```bash
# UFW Firewall aktivieren
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Status checken
sudo ufw status
```

---

### Schritt 11: Initial Data Seeding (Test-Daten)

```bash
# Mit psql verbinden
sudo -u postgres psql -d shiftsync
```

**Test-Daten einfügen:**
```sql
-- API-Schlüssel (AES-verschlüsselt - hier Platzhalter, nutze die echte storeApiKey Funktion)
-- WICHTIG: Nutze in Production die App-eigene API-Key-Verwaltung!

-- Test-User
INSERT INTO users (id, name, role, profession, language, is_active)
VALUES
  ('user-boss-001', 'Max Mustermann', 'BOSS', 'Geschäftsführer', 'de', true),
  ('user-leader-001', 'Anna Schmidt', 'SHIFT_LEADER', 'Polier', 'de', true),
  ('user-worker-001', 'Piotr Kowalski', 'WORKER', 'Baggerfahrer', 'pl', true);

-- Aktive Test-Schicht
INSERT INTO shifts (id, date, type, project_name, status, leader_id, started_at)
VALUES (
  'shift-active-001',
  NOW(),
  'DAY',
  'Gleisbau Berlin Hauptbahnhof - Sektor 4',
  'active',
  'user-leader-001',
  NOW()
);

-- Abgeschlossene Schichten (für Dashboard-Charts)
INSERT INTO shifts (id, date, type, project_name, status, completed_at)
VALUES
  ('shift-past-1', NOW() - INTERVAL '1 day', 'NIGHT', 'Gleisbau Berlin Hbf', 'completed', NOW() - INTERVAL '1 day'),
  ('shift-past-2', NOW() - INTERVAL '2 days', 'DAY', 'Gleisbau Berlin Hbf', 'completed', NOW() - INTERVAL '2 days');

-- Aggregationen für Charts
INSERT INTO shift_aggregations (id, shift_id, summary_markdown_path, structured_summary, kpis)
VALUES
  (
    'agg-1',
    'shift-past-1',
    '/var/www/shiftsync/data/aggregations/shifts/shift-past-1.md',
    '{"completed": ["Rohre verlegt Sektor 4"], "inProgress": ["Betonierung"], "blocked": [], "nextShiftActions": ["Betonierung fortsetzen"], "criticalIssues": []}'::jsonb,
    '{"totalWorkers": 10, "productivityScore": 82, "delayMinutes": 30, "materialCostEUR": 1800, "hindranceEvents": 1, "topPerformer": "Max M.", "underperformer": "N/A"}'::jsonb
  ),
  (
    'agg-2',
    'shift-past-2',
    '/var/www/shiftsync/data/aggregations/shifts/shift-past-2.md',
    '{"completed": ["Aushub komplett"], "inProgress": [], "blocked": [], "nextShiftActions": ["Rohre einsetzen"], "criticalIssues": []}'::jsonb,
    '{"totalWorkers": 12, "productivityScore": 88, "delayMinutes": 0, "materialCostEUR": 450, "hindranceEvents": 0, "topPerformer": "Anna S.", "underperformer": "N/A"}'::jsonb
  );

\q
```

---

### Schritt 12: Health Checks & Monitoring

```bash
# Alle Services checken
sudo systemctl status nginx
sudo systemctl status whisper-service
pm2 status

# Logs live anschauen
sudo journalctl -u nginx -f
sudo journalctl -u whisper-service -f
pm2 logs shiftsync-nextjs --lines 50

# PostgreSQL Connection testen
psql postgresql://shiftsync:PASSWORT@localhost:5432/shiftsync -c "SELECT COUNT(*) FROM shifts;"

# NGINX Access Logs
sudo tail -f /var/log/nginx/access.log

# Disk Space checken (Whisper-Modell + Media braucht Platz)
df -h
```

---

### Schritt 13: Production URLs

Nach erfolgreichem Setup solltest du folgende URLs erreichen:

```bash
# Öffentlich (via NGINX)
http://shiftsync.example.com/
http://shiftsync.example.com/worker?workerId=user-worker-001&workerName=Piotr%20Kowalski
http://shiftsync.example.com/shift-leader
http://shiftsync.example.com/boss/dashboard

# Intern (nur vom Server aus)
http://localhost:3000       # Next.js direkt
http://localhost:8000       # Whisper Service direkt
```

---

### Troubleshooting

#### Problem: Next.js startet nicht mit PM2
```bash
# Logs checken
pm2 logs shiftsync-nextjs --err

# Häufige Ursachen:
# 1. .env fehlt
ls -la /var/www/shiftsync/.env

# 2. Database Connection fehlschlägt
psql $DATABASE_URL -c "SELECT 1;"

# 3. Port 3000 bereits belegt
sudo lsof -i :3000
```

#### Problem: Whisper Service crashed
```bash
# Logs checken
sudo journalctl -u whisper-service -n 100

# Häufige Ursachen:
# 1. Zu wenig RAM (Whisper braucht min. 2GB)
free -h

# 2. Python venv nicht aktiviert
source /var/www/shiftsync/whisper-service/venv/bin/activate
which python  # sollte auf venv zeigen

# 3. Modell-Download fehlgeschlagen (first run braucht Internet)
# Manuell downloaden:
cd /var/www/shiftsync/whisper-service
python -c "from faster_whisper import WhisperModel; WhisperModel('medium')"
```

#### Problem: NGINX 502 Bad Gateway
```bash
# Check ob Next.js läuft
curl http://localhost:3000

# NGINX Config testen
sudo nginx -t

# SELinux (falls aktiviert) erlauben
sudo setsebool -P httpd_can_network_connect 1
```

#### Problem: Audio-Upload schlägt fehl
```bash
# client_max_body_size in NGINX checken
grep -r "client_max_body_size" /etc/nginx/

# Sollte mindestens 50M sein
# Falls nicht, in /etc/nginx/nginx.conf oder Site-Config hinzufügen:
# client_max_body_size 50M;

sudo systemctl reload nginx
```

---

### Backup & Maintenance

#### Automatische DB-Backups (täglich)

```bash
# Backup-Script erstellen
sudo nano /usr/local/bin/backup-shiftsync.sh
```

**Inhalt:**
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/shiftsync"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# PostgreSQL Dump
sudo -u postgres pg_dump shiftsync | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Data Files Backup
tar -czf $BACKUP_DIR/data_$DATE.tar.gz /var/www/shiftsync/data

# Alte Backups löschen (älter als 7 Tage)
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

**Ausführbar machen & Cronjob:**
```bash
sudo chmod +x /usr/local/bin/backup-shiftsync.sh

# Cronjob (täglich um 2 Uhr nachts)
sudo crontab -e
# Hinzufügen:
0 2 * * * /usr/local/bin/backup-shiftsync.sh >> /var/log/shiftsync-backup.log 2>&1
```

---

### Updates & Deployments

```bash
# Code Update (via Git)
cd /var/www/shiftsync
git pull origin main

# Dependencies updaten
npm install

# Rebuild Next.js
npm run build

# Migrations (falls neue DB-Änderungen)
npm run db:migrate

# PM2 neu starten
pm2 restart shiftsync-nextjs

# Whisper Service neu starten (falls Python-Code geändert)
sudo systemctl restart whisper-service
```

---

## 🎉 FERTIG!

**Dein ShiftSync MVP läuft jetzt Production-Ready auf Ubuntu!**

### Quick Start After Deployment

1. **Öffne:** `http://shiftsync.example.com/worker?workerId=user-worker-001&workerName=Piotr%20Kowalski`
2. **Spreche einen Report** (siehe Demo-Skript oben)
3. **Öffne:** `http://shiftsync.example.com/shift-leader`
4. **Klicke:** "Aktuelle Schicht beenden"
5. **Öffne:** `http://shiftsync.example.com/boss/dashboard`
6. **Präsentiere** dem Bauunternehmer 🚀

---

## Support & Kontakt

**Bei Problemen:**
- Check Logs: `pm2 logs`, `sudo journalctl -u whisper-service`
- DB-Status: `sudo systemctl status postgresql`
- NGINX-Status: `sudo systemctl status nginx`

**Performance-Tuning:**
- Whisper GPU-Support aktivieren (falls NVIDIA-GPU vorhanden)
- PostgreSQL Connection Pooling mit PgBouncer
- Next.js CDN-Caching via Cloudflare

---

**Viel Erfolg beim Pitch heute Abend! 💎**
