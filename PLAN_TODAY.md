# Plan: Schichtkommunikationstool — präsentationsfähiges MVP (1-Tages-Build)

**Datum:** 2026-06-04
**Arbeitskopie:** `C:\Users\konra\dev\schichtkommunikationstool` (frischer GitHub-Clone — NICHT der korrupte OneDrive-Ordner)
**Repo:** github.com/konradschrein-star/schichtkommunikationstool

## Ziel
Die komplette Vision umsetzen als **präsentationsfähiges** MVP, das **lokal & kostenlos** läuft und mit dem wir **Präsentationsvideos** aufnehmen können. Gehostet wird erst bei Kundeninteresse.

Konkret: ein Bau-/Gleisbau-Tool, mit dem **Nachtschicht → Tagschicht** sauber übergeben:
Arbeiter quatscht (DE/PL) ins Handy + Fotos → KI macht daraus saubere Reports → Schichtleiter bekommt Übergabe → Chef sieht KPIs & "Leakage" (undokumentierte Mehrarbeit = verlorenes Geld).

## Entscheidungen (heute bestätigt)
- **Transkription:** lokal **faster-whisper** (FastAPI, KEIN Docker; `pip` + Python), Modell `small` (gut für DE/PL, CPU-tauglich).
- **LLM:** **VPS-Gemini-API** für alle Agenten (QA, Übersetzung, Cleaner, Aggregator, Boss-KPI). URL + Key kommen vom User.
- **Demo-Framing:** **Bau / Gleisbau** (der echte Interessent) — 200k€-Leakage-Story, polnischer Baggerfahrer, Abwasserrohr, VOB/B.

## Architektur-Umbau für "kostenlos & lokal"
Heute größter Block: die App **erzwingt aktuell Postgres** (`DATABASE_URL`) + `ENCRYPTION_KEY`; jede Rollen-Seite fragt beim Laden die DB ab. Lösung:

1. **Postgres als Laufzeit-Abhängigkeit entfernen → Flat-File-Store** (passt exakt zur Vision: getaggte Markdown-Files).
   - `src/lib/store.ts` (neu): JSON-basiert für Users / Shifts / Aggregations / KPIs unter `./data/`.
   - Reports bleiben **Markdown + YAML-Frontmatter** (`src/lib/filesystem.ts` existiert schon).
   - Drizzle-Schema bleibt im Repo liegen (für späteres Hosting), wird aber zur Laufzeit nicht gebraucht.
2. **LLM-Key aus ENV** statt aus verschlüsselter DB (`ENCRYPTION_KEY` nicht mehr nötig zum Start). Settings-Seite kann Key/Modell in lokale Config schreiben.
3. **Auth-light:** Cookie-basierter Login — Account auswählen (geseedete User) → rollenbasierte Views. Keine Passwörter (Vision: "extrem einfach").

## Phasen

### Phase 0 — Lauffähig ohne DB
- `src/lib/store.ts` schreiben; `app/actions/worker-report.ts`, `app/actions/shift-aggregation.ts`, `app/worker|shift-leader|boss/page.tsx` und `src/lib/api-keys.ts` von Drizzle auf den Store umstellen.
- `.env.local`: VPS-Gemini, Whisper-URL, `DATA_ROOT_PATH`, `DEFAULT_LLM_PROVIDER=gemini`.
- Ziel: `npm run dev` rendert ALLE Seiten ohne DB sauber.

### Phase 1 — VPS-Gemini verdrahten
- Gemini-Client `baseUrl` auf VPS umbiegen (bzw. OpenAI-kompatiblen Client ergänzen, je nach Endpoint-Format); Gemini als Default im Workflow; Key aus ENV.
- Endpoint proben, Modellname fixen; jeden Agenten gegen sein Zod-Schema verifizieren (valides JSON).

### Phase 2 — faster-whisper lokal
- `requirements.txt` + Start-Skript; Modell `small`; Port/Env auf `/v2/transcribe` (8000) angleichen; Health-Check; Test mit DE- und PL-Audio.
- Fallback, falls kein Python lokal: Browser-Web-Speech für die Live-Mic-Demo (geseedete Daten zeigen die volle Pipeline trotzdem).

### Phase 3 — Bau-Demo seeden (damit JEDE Seite voll aussieht)
- Seed-Skript: 1 Projekt, 10 Arbeiter + 1 Schichtleiter + 1 Chef.
- Eine **abgeschlossene Nachtschicht** mit ~6 reichhaltigen Arbeiter-Reports (inkl. polnischer Baggerfahrer: Abwasserrohr → 2h Stillstand → 500€ Leakage), plus **vorgenerierter** Schichtleiter-Übergabe + Boss-KPI-JSON.
- Eine **aktive Schicht** für die Live-Aufnahme-Demo.

### Phase 4 — UI auf Vision-Niveau + fehlende Seiten
- **Worker (Notion, zero-friction):** großer Mic-Button + Waveform, Foto/Datei-Upload, QA-Rückfragen, Erfolg; Account-Auswahl/Login.
- **Schichtleiter (editorial):** Summary-Text-Bug fixen, 4-Quadranten-Übergabe (Geschafft / In Arbeit / Blocker / Übergabe), Drilldown in einzelne Reports, Schicht-beenden.
- **Chef (dark "Grafana"):** KPI-Hero (Leakage €, Produktivität %, kritische Hindernisse), Produktivitäts-Linienchart, Hindernis-Heatmap, Leaderboard, Pro-Mitarbeiter-Drilldown.
- **Neu:** Settings (Gemini Key/Modell, Dark/Light), Ideen-Seite (RAG, Bildanalyse, In-App-Tutorials, DSGVO), polierte Home/Login.
- Dark/Light via `next-themes`.

### Phase 5 — End-to-End-Test + Demo-Vorbereitung
- Kompletten Live-Pfad durchgehen, Brüche fixen; kurzes **DEMO_SCRIPT (Deutsch)** zum Abfilmen; schneller Performance-/Responsive-Check.

## Liefergegenstände
- Lauffähige App auf `localhost:3000`, alle Screens befüllt, Live-Demo-Pfad funktioniert, Demo-Skript, aktualisierter CLAUDE.md-Status.

## Risiken / Bedarf
- **VPS-Gemini URL + Key (+ Format)** nötig — bis dahin baue ich hinter ENV-Stub weiter.
- faster-whisper braucht Python; Erstlauf lädt das Modell (~einmalig). Sonst Web-Speech-Fallback.
- React-19 Peer-Dep-Warnungen (echarts-for-react) — unkritisch.
