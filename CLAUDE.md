# Projekt Masterplan: "ShiftSync MVP"

> ## ⭐ STAND 2026-06-05 — präsentationsfähiges lokales MVP (lies das zuerst)
>
> **Arbeitskopie:** `C:\Users\konra\dev\schichtkommunikationstool` (frischer GitHub-Clone).
> NICHT im OneDrive-Ordner arbeiten — der ist korrupt (Lese-/Sync-Fehler).
>
> **Architektur jetzt (kostenlos & lokal):**
> - **Keine Postgres-Abhängigkeit mehr.** Laufzeit-Daten liegen als Flat-File-Store unter
>   `data/db/*.json` (`src/lib/store.ts`); Worker-Berichte zusätzlich als getaggte Markdown-Dateien.
>   Das Drizzle-Schema (`src/db/`) bleibt nur für späteres Hosting liegen, wird zur Laufzeit nicht genutzt.
> - **LLM:** ein Provider-Abstraktion mit `baseUrl`/`model` (`src/agents/llm-clients.ts`, Typ `LLMSettings`).
>   Default-Provider **gemini** (VPS). Schlüssel kommt aus den **Einstellungen** (`/settings`, schreibt
>   `data/db/config.json`) oder aus `.env.local` (`GEMINI_API_KEY`, `GEMINI_BASE_URL`, `GEMINI_MODEL`).
>   Auflösung in `src/lib/api-keys.ts → getLLMCredentials()`. Keine DB-/KMS-Keys mehr.
> - **Transkription:** weiterhin lokales **faster-whisper** (`whisper-service/main.py`, Port 8000, kein Docker).
> - **Auth:** Cookie-basierte Konto-Auswahl (`app/actions/session.ts`, `src/lib/session.ts`), keine Passwörter.
>
> **Starten:** `node scripts/seed.mjs` (Demo-Daten) → `npm run dev` → http://localhost:3000.
> **Demo:** siehe `DEMO_SCRIPT.md`. Seed = eine vollständige Gleisbau-Nachtschicht (inkl. polnischer
> Baggerfahrer / Abwasserrohr / ~500 € Leakage), 7 abgeschlossene Schichten für KPIs, 1 aktive Schicht.
>
> **Routen:** `/` (Login) · `/worker` · `/shift-leader` · `/report/[id]` · `/boss/dashboard` ·
> `/settings` · `/ideas`.
>
> **Noch offen für 100 % live:** (1) echten VPS-Gemini-Key in `/settings` oder `.env.local` eintragen;
> (2) `whisper-service` starten (Python). Ohne beides ist die geseedete Demo bereits voll vorführbar.

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

## 6. Ideen Backlog (NICHT im MVP implementieren)
- Cloudflare R2 Storage Migration.
- Video-Upload & Analyse.
- RAG (Retrieval-Augmented Generation) mit Vektordatenbank über das Langzeit-Markdown-Archiv.
- Bildanalyse für Qualitätsmanagement.