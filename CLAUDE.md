# Projekt Masterplan: "ShiftSync MVP"

## 1. Projektübersicht & Ziel
Wir bauen ein MVP für Baudokumentation. Fokus: Zero-Friction für Arbeiter, maximale Insights für das Management.
Wir nutzen Sub-Agent Driven Development. Jeder Agent ist für eine isolierte Komponente zuständig. Wir iterieren schnell und testen direkt im Browser.

## 2. Tech-Stack & Infrastruktur
- Framework: Next.js (App Router)
- Styling: Tailwind CSS, shadcn/ui, next-themes (Light/Dark Mode)
- DB: PostgreSQL (für User/Auth) + Local File System (für Markdown, Bilder, Audio)
- Charts: Recharts / Apache ECharts
- KI: fast-whisper (lokal), LLM API (OpenAI/Anthropic/Gemini)

## 3. Datenarchitektur (Hybrid)
- **SQL (Postgres):** Users (id, name, role, auth_token). Roles: WORKER, SHIFT_LEADER, BOSS.
- **Flat File (Markdown):** Alle Reports werden als `.md` Dateien im lokalen Verzeichnis `/data/reports/` gespeichert. Metadaten (Zeit, Schicht, Tags, Worker-ID) liegen im YAML-Frontmatter.
- **Media Storage:** Lokales Verzeichnis `/data/media/`. R2-Storage ist als STUB vorzubereiten (`src/lib/storage.ts`), wird aber im MVP lokal ausgeführt.

## 4. Die KI-Agenten Pipeline (Backend Workflow)
Wenn ein Audio-Blob ankommt:
1. `fast-whisper` transkribiert (Polnisch/Deutsch).
2. **QA-Agent (LLM):** Checkt auf Vollständigkeit. (Gibt ggf. Prompt ans Frontend zurück).
3. **Cleaner-Agent (LLM):** Formatiert Schwafeln in saubere "Projektsprache" -> Speichert als Markdown.
4. **Shift-Aggregator (LLM):** Fasst alle Worker-Markdowns einer Schicht als Übersicht zusammen.
5. **Boss-Agent (LLM):** Extrahiert KPIs (Verzögerungen, Material, Geld) für die Visualisierung.

## 5. UI/UX Richtlinien (STRIKT!)
- **Performance:** Die App muss extrem schnell laden.
- **Responsiveness:** Jede View (Worker, Leader, Boss) MUSS voll funktionsfähig für Mobile UND Desktop gebaut werden.
- **Worker UI:** "Notion Style". Clean. Schwarz/Weiß mit satten Rot/Grün-Akzenten für Aktionen. Massive Buttons (Audio, Foto). Keine komplexen Formulare.
- **Boss UI:** "Grafana auf Steroiden". Dark Mode by default. Lila, Dunkelblau, Hellblau. Elegante Heatmaps, Progress Charts, Moving Averages.
- **Settings:** Schalter für Dark/Light Mode und Eingabefeld für eigene LLM API-Keys (nur für Chef sichtbar).

## 6. AKTUELLER STATUS (Stand: 2026-04-09)

### ✅ FERTIG & DEPLOYED (v0.1.0)
- **UI komplett portiert** von Vite/React → Next.js 15 App Router
- **Design System** mit Tailwind, shadcn/ui, next-themes (Dark/Light Mode funktioniert)
- **3 Rollen-Views** gebaut: Worker (`/worker`), Shift Leader (`/leader`), Boss (`/boss/dashboard`)
- **Responsive Design** für Mobile + Desktop fertig
- **Production Deployment** auf Hetzner Server (https://schichtkommunikationstool.schreinercontentsystems.com)
- **Infrastruktur** läuft: PM2, Docker (PostgreSQL + Whisper), NGINX, HTTPS
- **Demo-Daten** geladen: 3 Baustellenberichte + 3 Test-User

### 🟡 TEILWEISE FERTIG (Code vorhanden, aber nicht getestet)
- **Audio Recording UI** (MediaRecorder API implementiert, aber Ende-zu-Ende Flow ungetestet)
- **Whisper Service** (Docker läuft, aber Transkription nicht live getestet)
- **Gemini AI Integration** (API Key konfiguriert, Agents geschrieben, aber ungetestet)
- **QA Agent + Cleaner Agent** (Code in `src/agents/workflow.ts`, nicht verifiziert)
- **Boss Dashboard Charts** (zeigt Demo-Daten, aber keine echten KPIs)

### ❌ NOCH ZU MACHEN (KRITISCH für echte Nutzbarkeit)

**PRIO 1: Audio → Report Pipeline testen & fixen**
- [ ] Audio Recording im Browser testen (Worker View)
- [ ] Whisper Transkription verifizieren (Polnisch/Deutsch Support checken)
- [ ] Gemini QA Agent + Cleaner Agent live testen
- [ ] Ende-zu-Ende: Audio aufnehmen → Transkript → formatierter Markdown Report
- [ ] Error Handling für fehlgeschlagene Transkriptionen

**PRIO 2: Boss Agent & KPI Extraktion implementieren**
- [ ] Boss Agent schreiben (extrahiert aus Markdown Reports: Verzögerungen, Material, Kosten)
- [ ] KPI-Daten in strukturiertes Format speichern (JSON oder DB)
- [ ] Boss Dashboard mit echten KPIs füllen (nicht mehr Demo-Daten)
- [ ] Shift-Aggregator Agent implementieren (fasst alle Worker-Reports einer Schicht zusammen)

**PRIO 3: Authentication & User Management**
- [ ] Login-System bauen (Email/Password)
- [ ] Session Management mit JWT oder Cookies
- [ ] User → Rolle Mapping (Worker/Leader/Boss)
- [ ] Geschützte Routes (nur Boss sieht Boss-Dashboard)
- [ ] PostgreSQL User-Tabelle richtig nutzen

**PRIO 4: Features vervollständigen**
- [ ] Foto-Upload funktionsfähig machen (aktuell disabled)
- [ ] Report-Bearbeitung (existierende Reports editieren/löschen)
- [ ] Shift Leader View mit echten Funktionen (aktuell nur Placeholder)
- [ ] Settings Page (LLM API Keys ändern, Dark Mode Persistenz)

### 🔧 TECHNISCHE SCHULDEN
- [ ] Error Boundaries für React Components
- [ ] Loading States für async Operations
- [ ] Proper TypeScript Types (einige `any` types fixen)
- [ ] API Rate Limiting für Gemini Calls
- [ ] Logs richtig strukturieren (aktuell nur Console Logs)
- [ ] Tests schreiben (aktuell 0 Tests)

### 📝 DEPLOYMENT NOTES
- **Server:** Hetzner 65.108.6.149
- **Domain:** https://schichtkommunikationstool.schreinercontentsystems.com
- **SSH Key:** In separatem File (nicht im Repo!)
- **Deployment:** Via `deploy.sh` auf Server oder SCP upload
- **PM2 Name:** `schichtkommunikationstool`
- **Ports:** Next.js (3069), PostgreSQL (5433), Whisper (8005)
- **Secrets:** `.env` auf Server mit GEMINI_API_KEY + DATABASE_URL (nicht committen!)

## 7. Ideen Backlog (NICHT im MVP implementieren)
- Cloudflare R2 Storage Migration.
- Video-Upload & Analyse.
- RAG (Retrieval-Augmented Generation) mit Vektordatenbank über das Langzeit-Markdown-Archiv.
- Bildanalyse für Qualitätsmanagement.