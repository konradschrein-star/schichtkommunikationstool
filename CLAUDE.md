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

## 6. Ideen Backlog (NICHT im MVP implementieren)
- Cloudflare R2 Storage Migration.
- Video-Upload & Analyse.
- RAG (Retrieval-Augmented Generation) mit Vektordatenbank über das Langzeit-Markdown-Archiv.
- Bildanalyse für Qualitätsmanagement.