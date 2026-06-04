# ShiftSync — Schichtkommunikationstool (Gleis-/Tiefbau)

Voice-first Tool für die **Schichtübergabe** auf Großbaustellen. Der Arbeiter *spricht* (Deutsch
oder Polnisch) statt zu tippen → eine KI-Pipeline macht daraus saubere Berichte, eine lückenlose
Übergabe für die Tagschicht und KPIs für den Chef — damit keine Mehrarbeit mehr unbezahlt
verloren geht (das „€200.000-Leakage"-Problem nach VOB/B).

Drei Rollen, drei Oberflächen:
- **Mitarbeiter** – ein großer Aufnahme-Knopf, Wellenform, Foto-Upload. Zero-Friction.
- **Schichtleiter** – 4-Quadranten-Übergabe (Geschafft / In Arbeit / Blocker / To-Dos) + Drilldown in jeden Bericht.
- **Chef** – Dark-Dashboard: Leakage in €, Produktivität, VOB/B-Heatmap, Leaderboard, Einstellungen, Ideen-Roadmap.

---

## 🚀 Schnellstart (lokal, kostenlos)

Voraussetzung: **Node.js 20+**. Eine Datenbank wird **nicht** benötigt (Daten liegen als
JSON-/Markdown-Flat-Files unter `data/`).

```bash
# 1. Repo holen & Abhängigkeiten installieren
git clone https://github.com/konradschrein-star/schichtkommunikationstool.git
cd schichtkommunikationstool
npm install

# 2. Demo-Daten erzeugen (eine komplette Gleisbau-Nachtschicht)
node scripts/seed.mjs

# 3. Starten
npm run dev
```

Aufrufen: **http://localhost:3000** (falls Port 3000 belegt ist, nimmt Next.js automatisch 3001).

Auf der Startseite ein Konto wählen — z.B. **Markus Brandt** (Chef) oder **Andreas Köhler**
(Schichtleiter). Die geseedete Demo ist sofort vollständig vorführbar, **ohne** weitere Konfiguration.

> Demo-Drehbuch für eine Präsentation: siehe **`DEMO_SCRIPT.md`**.
> `node scripts/seed.mjs` setzt die Demo-Daten jederzeit zurück.

---

## 🤖 Live-KI aktivieren (optional)

Die geseedete Demo zeigt bereits das fertige Ergebnis. Für **echte Live-Aufnahmen**
(Sprache → Bericht in Echtzeit) sind zwei Dinge nötig:

**1) LLM (Gemini)** – im Tool unter **Chef → Einstellungen** eintragen, oder in `.env.local`:

```env
DEFAULT_LLM_PROVIDER=gemini
GEMINI_API_KEY=dein_key
GEMINI_BASE_URL=https://dein-vps-endpoint/v1beta   # leer = Google-Standard
GEMINI_MODEL=gemini-2.0-flash
```

**2) Transkription (faster-whisper, lokal, kein Docker nötig)** – Python 3.11+ erforderlich:

```bash
cd whisper-service
pip install -r requirements.txt
python main.py          # läuft auf http://localhost:8000 (Modell wird einmalig geladen)
```

Danach durchläuft jede Aufnahme live: **Whisper → QA → Übersetzung (PL→DE) → Cleaner**,
und „Schicht beenden" erzeugt live die Übergabe + KPIs (Aggregator- & Boss-Agent).

---

## 🧭 Routen

| Route | Rolle | Inhalt |
|-------|-------|--------|
| `/` | alle | Login / Konto-Auswahl |
| `/worker` | Mitarbeiter | Sprachaufnahme (Wellenform, Foto, QA-Rückfragen) |
| `/shift-leader` | Schichtleiter | Schichtübergabe + Liste der Einzelberichte |
| `/report/[id]` | Leiter/Chef | Einzelbericht: Original (PL) → Übersetzung → bereinigt |
| `/boss/dashboard` | Chef | KPIs, Leakage, Produktivität, Heatmap, Leaderboard |
| `/settings` | Chef | LLM-Provider / API-Key / Modell konfigurieren |
| `/ideas` | Chef | Ausbaustufen-Roadmap (RAG, Bildanalyse, DSGVO …) |

---

## 🏗️ Architektur

- **Next.js 15** (App Router, React 19, TypeScript strict) + **Tailwind CSS** + **ECharts**.
- **Daten:** Flat-File-Store `src/lib/store.ts` (`data/db/*.json`) + getaggte Markdown-Berichte
  (`data/reports/…`). Keine Datenbank zur Laufzeit. *(Das Drizzle/Postgres-Schema unter `src/db/`
  bleibt für späteres Hosting erhalten, wird aber nicht benötigt.)*
- **KI-Pipeline** (`src/agents/`): QA → Übersetzung → Cleaner → Shift-Aggregator → Boss-KPI.
  Provider-Abstraktion mit `baseUrl`/`model` (Gemini / Anthropic / OpenAI), Schlüssel aus
  Einstellungen oder `.env.local`.
- **Transkription:** lokales faster-whisper (`whisper-service/main.py`), DE/PL, VAD gegen Baustellenlärm.
- **Auth:** Cookie-basierte Konto-Auswahl (keine Passwörter) – `app/actions/session.ts`.

```
app/                 # Routen + Server Actions (session, settings, worker-report, shift-aggregation)
components/          # AppNav, Worker-Recorder, Boss-Charts, Settings-Form …
src/lib/             # store.ts (Flat-File-DB), session.ts, api-keys.ts, filesystem.ts, whisper.ts
src/agents/          # prompts, schemas, llm-clients, workflow
scripts/seed.mjs     # Demo-Daten (Gleisbau-Nachtschicht)
whisper-service/     # FastAPI faster-whisper
data/                # erzeugte Laufzeitdaten (gitignored) — via seed regenerierbar
```

---

## 📜 Skripte

| Befehl | Wirkung |
|--------|---------|
| `npm run dev` | Dev-Server (http://localhost:3000) |
| `npm run build` / `npm run start` | Production-Build / -Start |
| `node scripts/seed.mjs` | Demo-Daten (neu) erzeugen |

## 📝 Lizenz

Proprietär – internes MVP.
