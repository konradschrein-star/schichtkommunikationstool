<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Welche Kernfeatures braucht ein MVP für Baustellen-Dokumentation

Perfekt — genug Material für eine vollständige, strukturierte MVP-Feature-Analyse, zugeschnitten auf den Tiefbau/Gleisbau-Kontext aus dem vorherigen Gespräch.

## MVP-Kernfeatures für Baustellen-Dokumentation (Tiefbau/Gleisbau)

Für ein MVP gilt die **Eiserne Regel**: Weniger Features, jedes perfekt ausgeführt — besser als 20 halbgare Funktionen. Der Fokus liegt auf dem kritischen Workflow: **Schichtübergabe und tägliche Baudokumentation**.

***

## Feature-Priorisierung: MoSCoW-Matrix

| Priorität | Feature | Begründung |
| :-- | :-- | :-- |
| **Must Have** | Voice-to-Text Schichtnotiz | Kernproblem: dreckige Hände, keine Zeit |
| **Must Have** | Foto mit Auto-Tagging (Ort, Zeit) | Beweis-Funktion für Arbeiter \& PM |
| **Must Have** | Offline-First Sync | Tunnelbaustellen, kein 4G [^1] |
| **Must Have** | Schichtübergabe-Feed (Tag→Nacht) | Das USP des Produkts |
| **Must Have** | Mehrsprachigkeit (DE/PL) | Polnische Arbeiter im Team |
| **Should Have** | KI-Zusammenfassung der Übergabe | Polier sieht 3-Satz-Summary, nicht Wand aus Text |
| **Should Have** | Mängel/Probleme-Flag mit Foto | Eskalation klar sichtbar |
| **Should Have** | Material-Verbrauch Schnelleingabe | Häufige Rückfrage vermeiden |
| **Could Have** | Bautagebuch-PDF-Export | Für Bauleiter \& Nachweise |
| **Could Have** | Maschinenstunden-Erfassung | Gerätedokumentation |
| **Won't Have (MVP)** | Zeiterfassung/HR | Zu heikel (Überwachungsangst) |
| **Won't Have (MVP)** | Rechnungsstellung / ERP-Integration | Zu komplex für MVP |


***

## Die 5 Kern-Module im Detail

### Modul 1: Voice-Schichtnotiz (30-Sekunden-Flow)

Das Herzstück. Der Arbeiter öffnet die App, tippt **einen** großen Mikrofon-Button und spricht:[^2]

> *"Graben Achse 7 fertig, 45 Meter DN500, Rohre liegen. Nächste Schicht: Betonierung Sohle Pos. 3. Achtung – Grundwasserpumpe läuft durch, nicht abschalten."*

Die KI transkribiert, extrahiert automatisch: **Fortschritt / Aufgaben für nächste Schicht / Warnhinweise** und strukturiert das als Übergabecard. Kein Formular, kein Textfeld, kein Dropdown.[^1]

### Modul 2: Foto-Dokumentation mit Kontext

Foto schießen → automatisch: GPS-Koordinate, Uhrzeit, Bauprojekt, Bauteil (per KI-Erkennung vorgeschlagen) → Arbeiter bestätigt oder korrigiert per Sprache → gespeichert. Fotos sind **unveränderbar zeitgestempelt** — das ist die Schutz-Funktion für den Arbeiter selbst. Beispiel: Baggerfahrer dokumentiert fremde beschädigte Leitung, bevor er weitergräbt — sein Beweis für später.[^1]

### Modul 3: Schichtübergabe-Feed

Ein **WhatsApp-ähnlicher Feed**, aber strukturiert nach Projekten/Bauabschnitten. Die Nachtschicht sieht beim Start:[^3]

- Letzte Übergabe (Sprachnotiz + Transkript + Fotos)
- Offene Punkte (geflaggte Probleme)
- Materialstand
- Maschinenstatus

Kein Login-Screen mit Dashboard-Chaos. Direkt der relevante Content — wie eine Kurznachricht vom Kollegen.[^2]

### Modul 4: Offline-First-Architektur

Alle Eingaben (Voice, Foto, Text) werden **lokal auf dem Gerät gespeichert** und im Hintergrund synchronisiert, sobald Verbindung besteht. Die App darf **niemals** bei fehlendem Netz einfrieren oder Daten verlieren — das zerstört das Vertrauen irreparabel. Technisch: IndexedDB / SQLite lokal + Background Sync API.[^1]

### Modul 5: KI-Zusammenfassung für den Polier/Bauleiter

Während der Arbeiter seine Rohdaten (Voice + Fotos) eingibt, generiert die KI für den Polier automatisch:

- **3-Satz-Summary** der letzten 12h
- **Ampel-Status** pro Bauabschnitt (Grün/Gelb/Rot)
- **Offene Punkte** mit Eskalationsbedarf

Das ist der Mehrwert für den Auftraggeber (Bauleiter, GF) — ohne dass Arbeiter mehr tun müssen.[^3]

***

## Was das MVP explizit NICHT sein darf

- **Kein Stundenzettel/Timetracking** im ersten Release — sofortige Überwachungsangst, Adoption stirbt[^4]
- **Kein Manager-Dashboard mit Produktivitätskennzahlen** — Arbeiter müssen wissen, dass ihre Daten nicht für Leistungsbewertung genutzt werden
- **Keine Pflichtfelder** — jede Pflichtangabe senkt die Completion Rate drastisch. Alles optional, KI füllt Lücken mit Kontext

***

## Technischer MVP-Stack (Empfehlung)

| Komponente | Empfehlung | Warum |
| :-- | :-- | :-- |
| Frontend | React Native (Expo) | iOS + Android, eine Codebase |
| Voice-to-Text | Whisper API (OpenAI) | Beste Qualität, auch bei Baulärm + Polnisch |
| KI-Strukturierung | GPT-4o / Claude | Extraktion Fortschritt, Flags, Summary |
| Offline-Storage | SQLite (Expo SQLite) | Robust, bewährt |
| Backend | Supabase | Auth, Realtime-Sync, Storage für Fotos |
| Foto-Kompression | On-Device | Fotos vor Sync komprimieren (LTE-Schonung) |


***

## Validierungs-Metrik für MVP-Erfolg

Das MVP ist erfolgreich, wenn nach 4 Wochen Pilot:

- **≥70% der Schichten** haben eine digitale Übergabe (statt Zettel/WhatsApp)
- Durchschnittliche Eingabezeit **unter 90 Sekunden** pro Übergabe
- **Kein einziger Datenverlusst** durch Offline-Probleme
- Mindestens **3 Arbeiter** sagen ungefragt: *"Das hat mir heute geholfen"*
<span style="display:none">[^10][^11][^12][^13][^14][^15][^16][^5][^6][^7][^8][^9]</span>

<div align="center">⁂</div>

[^1]: https://buildlogapp.com/blog/best-construction-daily-report-software-2026.html

[^2]: https://palospublishing.com/building-assistants-for-shift-handover-documentation/

[^3]: https://www.mhp.com/de/insights/blog/post/digitales-protokoll-zur-schichtuebergabe

[^4]: https://arxiv.org/html/2412.06945v1

[^5]: https://www.codenroll.co.il/blog/what-is-an-mvp-a-complete-guide-to-minimum-viable-products-2026

[^6]: https://www.reddit.com/r/ProductManagement/comments/ud0n61/product_requirement_document_for_a_mvp/

[^7]: https://www.weweb.io/blog/mvp-development-complete-guide-from-idea-to-launch

[^8]: https://gloriumtech.com/a-strategic-guide-to-mvp-feature-prioritization-with-mvp-examples/

[^9]: https://www.mfr-deutschland.de/funktionen/baudokumentation-app

[^10]: https://safetyculture.com/topics/construction-management/construction-handover

[^11]: https://play.google.com/store/apps/details?id=com.xamapps.docplan

[^12]: https://www.linkedin.com/posts/jhaeebaazcr7_buildinpublic-startupjourney-saas-activity-7437716508727992322-6olm

[^13]: https://www.dexter-health.com/blog/perfekte-schichtubergabe-alle-infos-digital-statt-mundlicher-zusammenfassung

[^14]: https://play.google.com/store/apps/details?id=com.xamapps.docplan\&hl=gsw

[^15]: https://maddevs.io/blog/mvp-development-guide-for-startups/

[^16]: https://www.startup-initiative.de/baudokumentation-per-app-die-6-besten-tools-2026/

