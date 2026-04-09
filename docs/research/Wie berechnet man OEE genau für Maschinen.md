<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Wie berechnet man OEE genau für Maschinen

OEE für Maschinen berechnet man als Produkt aus **Verfügbarkeit**, Leistung und Qualität.[^1][^3]
Die Standardformel lautet: $\text{OEE} = \text{Verfügbarkeit} \times \text{Leistung} \times \text{Qualität}$.[^6][^1]

## Formel

Die drei Bausteine werden so berechnet:[^2][^4][^1]

- Verfügbarkeit = tatsächliche Laufzeit / geplante Produktionszeit.[^4][^1]
- Leistung = tatsächlich produzierte Menge / theoretisch mögliche Menge in der Laufzeit.[^2]
- Qualität = Gutmenge / Gesamtmenge.[^4][^2]

Eine gleichwertige Gesamtdarstellung ist:
$\text{OEE} = \frac{\text{Laufzeit}}{\text{geplante Zeit}} \times \frac{\text{Ist-Menge}}{\text{Soll-Menge}} \times \frac{\text{Gutmenge}}{\text{Ist-Menge}}$.[^7]

## Schritt für Schritt

1. Definiere die geplante Produktionszeit, also die Zeit, in der die Maschine laut Plan produzieren sollte.[^1][^4]
2. Ziehe alle Stillstände ab und erhalte die tatsächliche Laufzeit bzw. Betriebszeit.[^5][^1]
3. Vergleiche die reale Ausbringung mit der theoretisch möglichen Ausbringung bei Sollgeschwindigkeit.[^5][^2]
4. Ermittle den Anteil fehlerfreier Teile an allen produzierten Teilen.[^2][^4]
5. Multipliziere die drei Prozentwerte miteinander; das Ergebnis ist die OEE.[^3][^1]

## Beispiel

Angenommen, eine Maschine hat 480 Minuten geplante Zeit, 420 Minuten tatsächliche Laufzeit, 1.800 produzierte Teile, 2.000 theoretisch mögliche Teile und 1.700 Gutteile.[^2]
Dann gilt: Verfügbarkeit = 420 / 480 = 87,5 Prozent, Leistung = 1.800 / 2.000 = 90 Prozent und Qualität = 1.700 / 1.800 = 94,4 Prozent.[^2]
Die OEE ist damit $0{,}875 \times 0{,}9 \times 0{,}944 = 0{,}743$, also 74,3 Prozent.[^2]

## Für Baumaschinen

Bei Baumaschinen im Tiefbau musst du die OEE-Logik meist auf Betriebsstunden statt Stückzahlen übertragen, weil ein Bagger oder Radlader keine klassischen “Teile” produziert. Die Grundlogik bleibt aber gleich: Verfügbarkeit = Einsatzzeit / geplante Einsatzzeit, Leistung = tatsächlicher Output / Soll-Output je Einsatzstunde, Qualität = gut ausgeführte Leistung / Gesamtleistung.[^3][^1]

Ein praktisches Beispiel für einen Bagger wäre:

- Verfügbarkeit: 6,5 laufende Stunden / 8 geplante Stunden.
- Leistung: 120 m³ Aushub / 150 m³ Sollleistung.
- Qualität: 110 m³ freigegebener Aushub / 120 m³ Gesamtleistung.
Dann wäre die OEE $= 81{,}25\% \times 80\% \times 91{,}7\% \approx 59{,}6\%$. Die Struktur ist fachlich identisch zur klassischen OEE, nur die Leistungs- und Qualitätsdefinition wird auf Tiefbau-Output umgestellt.[^7][^1][^3]


## Wichtige Abgrenzung

Für mehrere Maschinen sollte man OEE-Werte nicht einfach mitteln, weil das die Realität verzerren kann. Stattdessen sollte man die zugrunde liegenden Zeiten, Mengen und Qualitätsdaten aggregieren und daraus eine Gesamt-OEE berechnen.[^9]

Wenn du willst, formuliere ich dir als Nächstes eine **OEE-Definition speziell für Tiefbau-Maschinen** wie Bagger, Lader, Walze und Dumper — direkt als Dashboard-Logik mit Feldern, Formeln und Sprachdaten-Mapping.
<span style="display:none">[^10][^8]</span>

<div align="center">⁂</div>

[^1]: https://www.mpdv.com/industrie-4-0/smart-factory-glossar/overall-equipment-effectiveness-oee

[^2]: https://www.bitmotec.com/oee/oee-berechnung/

[^3]: https://www.oee-institute.de/wissen/berechnung-der-oee-kennzahl

[^4]: https://www.fastec.de/aktuelles/oee-berechnung-einfach-erklart/

[^5]: https://www.enlyze.com/oee-rechner

[^6]: https://www.opc-router.de/was-ist-oee/

[^7]: https://refa.de/service/refa-lexikon/oee-overall-equipment-effectiveness

[^8]: https://www.pi-informatik.berlin/softwareentwicklung/produktions-it/die-oee-kennzahl-berechnen-mit-beispielen/

[^9]: https://forcam-enisco.net/blog/die-fertigungskennzahl-oee-und-ihre-bedeutung/

[^10]: https://www.business-wissen.de/artikel/oee-overall-equipment-effectiveness-formel-berechnung-beispiel/

