# Demo-Skript — ShiftSync (Schichtkommunikationstool)

**Setup vor der Aufnahme**
```bash
cd C:\Users\konra\dev\schichtkommunikationstool
node scripts/seed.mjs       # setzt die Demo-Daten zurück (Gleisbau-Nachtschicht)
npm run dev                 # startet auf http://localhost:3000 (oder 3001, falls belegt)
```
Browser-Fenster sauber: nur ein Tab, Zoom ~110 %, Mikrofon erlaubt.

> Die komplette Demo unten funktioniert **ohne** Internet/LLM — alles aus den geseedeten Daten.
> Für die **Live-Aufnahme** (optional, „Sahnehäubchen") siehe ganz unten.

---

## Der Pitch (3 Akte, ~4 Minuten)

### Akt 1 — Das Problem (Login-Screen, `/`)
> „Großbaustellen im Gleis- und Tiefbau laufen rund um die Uhr in Tag- und Nachtschicht.
> Das Problem: Was nachts passiert — ein unerwartetes Rohr, eine Verzögerung, Mehrarbeit —
> geht morgens in der Übergabe verloren. Über ein Projekt summiert sich das schnell auf
> **mehrere hunderttausend Euro nicht abgerechnete Mehrarbeit.**"

Zeig die Konto-Auswahl: 10 Mitarbeiter, ein Schichtleiter, ein Chef — viele davon polnischsprachig.

### Akt 2 — Zero-Friction für den Arbeiter (`Piotr Kowalski` wählen → `/worker`)
> „Der Baggerfahrer hat dreckige Hände und keine Zeit für Formulare. Er drückt einen Knopf
> und **spricht — auf Polnisch.**"

- Auf den großen grünen Knopf zeigen, „Foto anhängen" erwähnen, Wellenform zeigen.
- (Optional live aufnehmen — siehe unten. Sonst:) „Die KI transkribiert, übersetzt ins
  Deutsche, prüft auf Vollständigkeit und macht daraus saubere Projektsprache."

### Akt 3a — Die Übergabe für die Tagschicht (`Andreas Köhler` → `/shift-leader`)
> „Morgens um 6 liegt das hier auf dem Tisch des Schichtleiters."

- Die vier Quadranten zeigen: **Geschafft / In Arbeit / BLOCKER / Übergabe.**
- Auf den roten BLOCKER zeigen: *undokumentiertes Abwasserrohr in Sektor B*.
- Unten auf einen Mitarbeiter-Bericht klicken (`Piotr`) → `/report/...`:
  Original-Polnisch, deutsche Übersetzung, bereinigte Fassung, Tags & ~500 € Mehraufwand.
  > „Das polnische Original bleibt gespeichert — volle Nachvollziehbarkeit."

### Akt 3b — Das Chef-Dashboard (`Markus Brandt` → `/boss/dashboard`)
> „Und der Chef? Der sieht das Geld."

- **Leakage / Verlust: €5.500** (über die Woche), Produktivität, kritische VOB/B-Behinderungen.
- Produktivitäts-Chart + Hindernis-Heatmap + Leaderboard (Top-/Nachzügler) zeigen.
- Tab **Ideen** öffnen: RAG-Langzeitgedächtnis, Bildanalyse, DSGVO, PM-Integration …
  > „Das ist erst der Anfang — hier sieht der Chef, wohin wir das ausbauen können."
- Tab **Einstellungen**: „Der Chef hinterlegt seinen eigenen KI-Schlüssel selbst."

**Abschluss**
> „Ein Knopf für den Arbeiter. Eine lückenlose Übergabe für die Schicht. Bares Geld für den Chef.
> Läuft heute schon — lokal und ohne laufende Kosten."

---

## Optional: Live-Aufnahme aktivieren (echtes KI-Processing)

Dafür sind zwei Dinge nötig:

**1) LLM (VPS-Gemini)** — entweder in `.env.local`:
```
GEMINI_API_KEY=dein_key
GEMINI_BASE_URL=https://dein-vps-endpoint/v1beta   # leer = Google-Standard
GEMINI_MODEL=gemini-2.0-flash
```
…oder einfach im Tool unter **Chef → Einstellungen** eintragen (wird lokal gespeichert).

**2) Transkription (faster-whisper, lokal, kein Docker)**
```bash
cd whisper-service
pip install -r requirements.txt
python main.py        # läuft auf http://localhost:8000
```
Beim ersten Start lädt das Modell einmalig herunter.

Danach: als Worker aufnehmen → der Bericht durchläuft live Whisper → QA → Übersetzung →
Cleaner und erscheint sofort beim Schichtleiter. „Schicht beenden" (als Schichtleiter)
erzeugt live die Übergabe + KPIs.
