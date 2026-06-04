/**
 * Seed the flat-file store with a rich construction (Gleisbau) demo dataset.
 *
 * Run:  node scripts/seed.mjs
 *
 * Writes:
 *   data/db/users.json
 *   data/db/shifts.json
 *   data/db/worker-reports.json
 *   data/db/aggregations.json
 *   data/reports/<workerId>/<date>/report-*.md   (authentic tagged markdown)
 *
 * Re-running fully resets the demo data. The single ACTIVE shift is left empty
 * so a live "record -> report -> handover" demo can fill it on stage.
 */

import fs from 'fs/promises';
import path from 'path';

const DATA_ROOT = path.resolve(process.cwd(), process.env.DATA_ROOT_PATH || 'data');
const DB_DIR = path.join(DATA_ROOT, 'db');

const PROJECT = 'Gleisbau Sektor 4 – Berlin Hauptbahnhof';

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

const users = [
  { id: 'u-boss', name: 'Markus Brandt', role: 'BOSS', profession: 'Geschäftsführer', language: 'de' },
  { id: 'u-leader', name: 'Andreas Köhler', role: 'SHIFT_LEADER', profession: 'Polier / Schichtleiter', language: 'de' },
  { id: 'u-piotr', name: 'Piotr Kowalski', role: 'WORKER', profession: 'Baggerfahrer', language: 'pl' },
  { id: 'u-tomasz', name: 'Tomasz Nowak', role: 'WORKER', profession: 'Tiefbauer', language: 'pl' },
  { id: 'u-stefan', name: 'Stefan Weber', role: 'WORKER', profession: 'Schachtmeister', language: 'de' },
  { id: 'u-krzysztof', name: 'Krzysztof Wójcik', role: 'WORKER', profession: 'Handler', language: 'pl' },
  { id: 'u-michael', name: 'Michael Schulz', role: 'WORKER', profession: 'Maschinist', language: 'de' },
  { id: 'u-marek', name: 'Marek Lewandowski', role: 'WORKER', profession: 'Gleisbauer', language: 'pl' },
  { id: 'u-daniel', name: 'Daniel Fischer', role: 'WORKER', profession: 'Tiefbauer', language: 'de' },
  { id: 'u-jan', name: 'Jan Kowalczyk', role: 'WORKER', profession: 'Handler', language: 'pl' },
  { id: 'u-thomas', name: 'Thomas Becker', role: 'WORKER', profession: 'Polier-Assistent', language: 'de' },
  { id: 'u-lukasz', name: 'Łukasz Kamiński', role: 'WORKER', profession: 'Baggerfahrer', language: 'pl' },
].map((u) => ({ ...u, isActive: true, createdAt: '2026-05-01T08:00:00.000Z' }));

// ---------------------------------------------------------------------------
// Shifts (7 completed nights + 1 active night)
// ---------------------------------------------------------------------------

function nightShift(id, dateStr, status) {
  return {
    id,
    date: `${dateStr}T22:00:00.000Z`,
    type: 'NIGHT',
    projectName: PROJECT,
    leaderId: 'u-leader',
    resources: { excavators: 3, handlers: 5, workers: 8, trucks: 2 },
    status,
    startedAt: `${dateStr}T22:00:00.000Z`,
    completedAt: status === 'completed' ? `${dateStr}T05:30:00.000Z` : undefined,
    createdAt: `${dateStr}T21:00:00.000Z`,
  };
}

const LATEST = 'shift-2026-06-04-night';
const ACTIVE = 'shift-2026-06-05-night';

const shifts = [
  nightShift('shift-2026-05-29-night', '2026-05-29', 'completed'),
  nightShift('shift-2026-05-30-night', '2026-05-30', 'completed'),
  nightShift('shift-2026-05-31-night', '2026-05-31', 'completed'),
  nightShift('shift-2026-06-01-night', '2026-06-01', 'completed'),
  nightShift('shift-2026-06-02-night', '2026-06-02', 'completed'),
  nightShift('shift-2026-06-03-night', '2026-06-03', 'completed'),
  nightShift(LATEST, '2026-06-04', 'completed'),
  nightShift(ACTIVE, '2026-06-05', 'active'),
];

// ---------------------------------------------------------------------------
// Worker reports for the latest completed night (the detailed, demo-able shift)
// ---------------------------------------------------------------------------

const reports = [
  {
    id: 'rep-piotr-1',
    shiftId: LATEST,
    workerId: 'u-piotr',
    workerName: 'Piotr Kowalski',
    profession: 'Baggerfahrer',
    language: 'pl',
    rawTranscript:
      'No więc kopaliśmy pod koryto kablowe w sektorze B, oś 7, i nagle trafiliśmy na grubą rurę kanalizacyjną, której nie ma na żadnym planie. Musiałem zatrzymać koparkę, bo nie dało się dalej kopać. Kopaliśmy ręcznie dookoła rury jakieś dwie godziny, żeby jej nie uszkodzić, i trzeba było przesunąć trasę koryta. To na pewno trzeba zgłosić, bo straciliśmy dużo czasu i to dodatkowa robota.',
    translatedTranscript:
      'Wir haben in Sektor B, Achse 7, für den Kabeltrog gegraben und sind plötzlich auf ein dickes Abwasserrohr gestoßen, das in keinem Plan eingezeichnet ist. Ich musste den Bagger stoppen, weil ein Weitergraben nicht möglich war. Wir haben ca. zwei Stunden von Hand um das Rohr herum gegraben, um es nicht zu beschädigen, und mussten die Trasse des Trogs verschieben. Das muss unbedingt gemeldet werden, weil wir viel Zeit verloren haben und es zusätzliche Arbeit ist.',
    cleanedText:
      '**Standort:** Sektor B, Achse 7\n\nBeim Aushub für den Kabeltrog wurde ein nicht dokumentiertes Abwasserrohr der Stadt angetroffen. Der Baggerbetrieb musste eingestellt werden; der Aushub erfolgte rund 2 Stunden in Handschachtung, um das Rohr nicht zu beschädigen. Die Trogtrasse muss umgeplant werden.\n\n**Behinderung (VOB/B §6):** Ja – unvorhergesehenes Hindernis, ca. 2 h Stillstand Bagger 1, geschätzter Mehraufwand ~500 €. Empfehlung: als Nachtrag (VOB/B §2) dokumentieren.',
    qaStatus: 'approved',
    qaConfidence: 0.94,
    location: 'Sektor B, Achse 7',
    taskType: 'excavation',
    hindrance: true,
    delayMinutes: 120,
    materialCostEUR: 500,
    tags: ['rohr', 'abwasser', 'verzögerung', 'nachtrag', 'vob'],
    createdAt: '2026-06-04T23:40:00.000Z',
  },
  {
    id: 'rep-tomasz-1',
    shiftId: LATEST,
    workerId: 'u-tomasz',
    workerName: 'Tomasz Nowak',
    profession: 'Tiefbauer',
    language: 'pl',
    rawTranscript:
      'W sektorze A ułożyliśmy około czterdziestu metrów koryta kablowego, wszystko zgodnie z planem, bez problemów. Podłoże było dobre, szło sprawnie.',
    translatedTranscript:
      'In Sektor A haben wir etwa vierzig Meter Kabeltrog verlegt, alles nach Plan, ohne Probleme. Der Untergrund war gut, es lief zügig.',
    cleanedText:
      '**Standort:** Sektor A, Achse 1–3\n\n40 m Kabeltrog plangerecht verlegt. Untergrund tragfähig, keine Behinderungen. Arbeiten liegen im Zeitplan.',
    qaStatus: 'approved',
    qaConfidence: 0.97,
    location: 'Sektor A, Achse 1–3',
    taskType: 'excavation',
    hindrance: false,
    delayMinutes: 0,
    materialCostEUR: 0,
    tags: ['kabeltrog', 'planmäßig'],
    createdAt: '2026-06-04T23:55:00.000Z',
  },
  {
    id: 'rep-stefan-1',
    shiftId: LATEST,
    workerId: 'u-stefan',
    workerName: 'Stefan Weber',
    profession: 'Schachtmeister',
    language: 'de',
    rawTranscript:
      'Also wir haben heute Nacht das Mastfundament an Achse 12 betoniert. Lief soweit gut, nur der Betonmischer kam 45 Minuten zu spät, deswegen hat sich der Start verzögert. Sonst alles sauber, Schalung steht, Beton ist drin.',
    cleanedText:
      '**Standort:** Achse 12\n\nMastfundament betoniert. Schalung gestellt, Betonage abgeschlossen. Verzögerung von 45 min durch verspätete Betonlieferung; ansonsten ordnungsgemäß.',
    qaStatus: 'approved',
    qaConfidence: 0.96,
    location: 'Achse 12',
    taskType: 'concrete',
    hindrance: false,
    delayMinutes: 45,
    materialCostEUR: 0,
    tags: ['mastfundament', 'beton', 'lieferverzug'],
    createdAt: '2026-06-05T00:30:00.000Z',
  },
  {
    id: 'rep-krzysztof-1',
    shiftId: LATEST,
    workerId: 'u-krzysztof',
    workerName: 'Krzysztof Wójcik',
    profession: 'Handler',
    language: 'pl',
    rawTranscript:
      'Rozładowaliśmy podkłady i tłuczeń, wszystko na miejscu. Ale brakuje jednej palety klamer szynowych, dostawa była niekompletna. Trzeba zamówić, bo dzienna zmiana będzie ich potrzebować.',
    translatedTranscript:
      'Wir haben Schwellen und Schotter entladen, alles am Platz. Aber eine Palette Schienenklemmen fehlt, die Lieferung war unvollständig. Muss nachbestellt werden, weil die Tagschicht sie brauchen wird.',
    cleanedText:
      '**Standort:** Lagerplatz / Achse 8\n\nSchwellen und Schotter vollständig entladen. **Fehlmenge:** 1 Palette Schienenklemmen nicht geliefert (Lieferung unvollständig). Nachbestellung erforderlich – wird von der Tagschicht benötigt.',
    qaStatus: 'approved',
    qaConfidence: 0.92,
    location: 'Lagerplatz / Achse 8',
    taskType: 'other',
    hindrance: false,
    delayMinutes: 0,
    materialCostEUR: 0,
    tags: ['material', 'fehlmenge', 'schienenklemmen', 'nachbestellung'],
    createdAt: '2026-06-05T01:10:00.000Z',
  },
  {
    id: 'rep-michael-1',
    shiftId: LATEST,
    workerId: 'u-michael',
    workerName: 'Michael Schulz',
    profession: 'Maschinist',
    language: 'de',
    rawTranscript:
      'Bagger 2 hat zwischendurch eine Hydraulik-Warnung gebracht. Ich hab den Check gemacht, Ölstand passt, Maschine läuft, aber ich würde empfehlen, dass die Werkstatt da nochmal richtig draufschaut, bevor das größer wird.',
    cleanedText:
      '**Standort:** Bagger 2 / Sektor B\n\nWährend des Betriebs Hydraulik-Warnung an Bagger 2. Sichtprüfung durchgeführt, Ölstand i.O., Maschine weiter betriebsbereit. **Empfehlung:** Werkstatt-Inspektion der Hydraulik vor weiterem Dauerbetrieb.',
    qaStatus: 'approved',
    qaConfidence: 0.9,
    location: 'Bagger 2 / Sektor B',
    taskType: 'maintenance',
    hindrance: false,
    delayMinutes: 0,
    materialCostEUR: 0,
    tags: ['maschine', 'hydraulik', 'wartung', 'inspektion'],
    createdAt: '2026-06-05T02:05:00.000Z',
  },
  {
    id: 'rep-marek-1',
    shiftId: LATEST,
    workerId: 'u-marek',
    workerName: 'Marek Lewandowski',
    profession: 'Gleisbauer',
    language: 'pl',
    rawTranscript:
      'Robiliśmy regulację toru na osiach od czwartej do szóstej. Problem jest taki, że woda gruntowa wchodzi do wykopu, musieliśmy postawić pompę. Przez to szło wolniej, jakąś godzinę straciliśmy. Pompa musi dalej pracować.',
    translatedTranscript:
      'Wir haben die Gleisjustierung an den Achsen vier bis sechs gemacht. Das Problem ist, dass Grundwasser in den Graben eindringt, wir mussten eine Pumpe aufstellen. Dadurch ging es langsamer, wir haben etwa eine Stunde verloren. Die Pumpe muss weiterlaufen.',
    cleanedText:
      '**Standort:** Achse 4–6\n\nGleisjustierung durchgeführt. **Behinderung:** Grundwassereintritt in den Graben; Wasserhaltung mit Pumpe eingerichtet. Fortschritt um ca. 1 h verzögert. **Übergabe:** Grundwasserpumpe an Achse 5 muss weiterlaufen.',
    qaStatus: 'approved',
    qaConfidence: 0.93,
    location: 'Achse 4–6',
    taskType: 'maintenance',
    hindrance: true,
    delayMinutes: 60,
    materialCostEUR: 150,
    tags: ['gleisjustierung', 'grundwasser', 'wasserhaltung', 'pumpe', 'verzögerung'],
    createdAt: '2026-06-05T02:50:00.000Z',
  },
];

// ---------------------------------------------------------------------------
// Aggregations
// ---------------------------------------------------------------------------

const latestAggregation = {
  id: 'agg-2026-06-04',
  shiftId: LATEST,
  summaryText:
    'In der Nachtschicht wurden 40 m Kabeltrog in Sektor A verlegt, das Mastfundament an Achse 12 betoniert und die Gleisjustierung an den Achsen 4–6 abgeschlossen. Kritisch: In Sektor B (Achse 7) wurde beim Aushub ein nicht dokumentiertes Abwasserrohr angetroffen – rund 2 Stunden Stillstand und Handschachtung, die Trasse muss umgeplant werden (VOB/B-relevanter Nachtrag, ca. 500 €). Zusätzlich dringt an Achse 5 Grundwasser ein; die Wasserhaltung läuft und muss fortgeführt werden. Eine Palette Schienenklemmen fehlt aus der Lieferung und ist nachzubestellen, und Bagger 2 sollte wegen einer Hydraulik-Warnung inspiziert werden. Insgesamt solide Schicht trotz zweier VOB/B-Behinderungen.',
  structuredSummary: {
    completed: [
      '40 m Kabeltrog in Sektor A verlegt (Nowak)',
      'Mastfundament Achse 12 betoniert (Weber)',
      'Gleisjustierung Achse 4–6 abgeschlossen (Lewandowski)',
      'Schwellen & Schotter entladen (Wójcik)',
    ],
    inProgress: [
      'Kabeltrog Sektor B – unterbrochen durch Abwasserrohr (Kowalski)',
      'Wasserhaltung Achse 5 – Pumpenbetrieb läuft (Lewandowski)',
    ],
    blocked: [
      'Sektor B, Achse 7: undokumentiertes Abwasserrohr blockiert Trassenführung – Umplanung nötig',
      'Fehlende Schienenklemmen (1 Palette) – Lieferung unvollständig',
    ],
    nextShiftActions: [
      'Umplanung Trasse Sektor B mit Bauleitung abstimmen',
      'Abwasserrohr-Fund als Nachtrag (VOB/B §2) erfassen – ca. 500 €',
      'Fehlende Schienenklemmen nachbestellen',
      'Bagger 2 zur Hydraulik-Inspektion',
      'Grundwasserpumpe Achse 5 weiterlaufen lassen',
    ],
    criticalIssues: [
      'VOB/B §6 Behinderung: Abwasserrohr Sektor B (2 h Stillstand, ~500 €)',
      'Grundwasser Achse 5 – Pumpenbetrieb erforderlich',
    ],
  },
  kpis: {
    totalWorkers: 8,
    productivityScore: 82,
    delayMinutes: 225,
    materialCostEUR: 1150,
    hindranceEvents: 2,
    topPerformer: 'Tomasz Nowak',
    underperformer: 'Michael Schulz',
    criticalHindrances: [
      { worker: 'Piotr Kowalski', location: 'Sektor B, Achse 7', issue: 'Undokumentiertes Abwasserrohr – 2 h Stillstand, Trassen-Umplanung', estimatedCostEUR: 500 },
      { worker: 'Marek Lewandowski', location: 'Achse 4–6', issue: 'Grundwassereintritt – Wasserhaltung erforderlich', estimatedCostEUR: 150 },
    ],
  },
  createdAt: '2026-06-05T05:35:00.000Z',
};

function quickAgg(id, shiftId, dateStr, kpis, blurb) {
  return {
    id,
    shiftId,
    summaryText: blurb,
    structuredSummary: {
      completed: ['Planmäßige Trassen- und Tiefbauarbeiten durchgeführt'],
      inProgress: ['Laufende Abschnitte an die Folgeschicht übergeben'],
      blocked: kpis.hindranceEvents > 0 ? ['Siehe kritische Behinderungen im Chef-Dashboard'] : [],
      nextShiftActions: ['Übergabepunkte mit der Tagschicht abstimmen'],
      criticalIssues: kpis.hindranceEvents > 0 ? ['VOB/B-relevante Behinderung dokumentiert'] : [],
    },
    kpis,
    createdAt: `${dateStr}T05:35:00.000Z`,
  };
}

const aggregations = [
  quickAgg('agg-2026-05-29', 'shift-2026-05-29-night', '2026-05-30',
    { totalWorkers: 8, productivityScore: 88, delayMinutes: 60, materialCostEUR: 800, hindranceEvents: 1, topPerformer: 'Stefan Weber', underperformer: 'Jan Kowalczyk', criticalHindrances: [] },
    'Ruhige Nacht, gute Leistung. Eine kleinere Behinderung durch Lieferverzug dokumentiert.'),
  quickAgg('agg-2026-05-30', 'shift-2026-05-30-night', '2026-05-31',
    { totalWorkers: 8, productivityScore: 91, delayMinutes: 30, materialCostEUR: 0, hindranceEvents: 0, topPerformer: 'Tomasz Nowak', underperformer: '—', criticalHindrances: [] },
    'Sehr produktive Schicht ohne Behinderungen. Alle Abschnitte im Zeitplan.'),
  quickAgg('agg-2026-05-31', 'shift-2026-05-31-night', '2026-06-01',
    { totalWorkers: 8, productivityScore: 76, delayMinutes: 150, materialCostEUR: 450, hindranceEvents: 1, topPerformer: 'Marek Lewandowski', underperformer: 'Daniel Fischer', criticalHindrances: [{ worker: 'Daniel Fischer', location: 'Sektor C', issue: 'Verdichtungsprobleme im Planum', estimatedCostEUR: 450 }] },
    'Erschwerte Bedingungen im Sektor C, dadurch geringere Produktivität und Mehraufwand.'),
  quickAgg('agg-2026-06-01', 'shift-2026-06-01-night', '2026-06-02',
    { totalWorkers: 8, productivityScore: 69, delayMinutes: 320, materialCostEUR: 2200, hindranceEvents: 3, topPerformer: 'Piotr Kowalski', underperformer: 'Michael Schulz', criticalHindrances: [{ worker: 'Piotr Kowalski', location: 'Sektor B', issue: 'Leitungskreuzung Stromkabel – Sicherheitsstopp', estimatedCostEUR: 1400 }, { worker: 'Krzysztof Wójcik', location: 'Achse 9', issue: 'Defekte Anlieferung Beton', estimatedCostEUR: 800 }] },
    'Schwierige Nacht: mehrere Behinderungen inkl. Leitungskreuzung. Hoher dokumentierter Mehraufwand für Nachträge.'),
  quickAgg('agg-2026-06-02', 'shift-2026-06-02-night', '2026-06-03',
    { totalWorkers: 8, productivityScore: 85, delayMinutes: 75, materialCostEUR: 300, hindranceEvents: 1, topPerformer: 'Stefan Weber', underperformer: 'Jan Kowalczyk', criticalHindrances: [] },
    'Solide Schicht, kleinere Verzögerung beim Materialhandling.'),
  quickAgg('agg-2026-06-03', 'shift-2026-06-03-night', '2026-06-04',
    { totalWorkers: 8, productivityScore: 90, delayMinutes: 45, materialCostEUR: 600, hindranceEvents: 1, topPerformer: 'Łukasz Kamiński', underperformer: 'Krzysztof Wójcik', criticalHindrances: [] },
    'Starke Nacht mit hoher Produktivität. Eine dokumentierte Behinderung mit moderatem Kostenimpact.'),
  latestAggregation,
];

// ---------------------------------------------------------------------------
// Markdown report files (authentic tagged flat-file DB)
// ---------------------------------------------------------------------------

function yamlValue(v) {
  if (Array.isArray(v)) return `[${v.map((x) => JSON.stringify(x)).join(', ')}]`;
  if (typeof v === 'string') return JSON.stringify(v);
  return String(v);
}

function toMarkdown(r) {
  const fm = {
    id: r.id,
    workerId: r.workerId,
    workerName: r.workerName,
    profession: r.profession,
    shiftId: r.shiftId,
    date: r.createdAt.split('T')[0],
    timestamp: r.createdAt,
    shiftType: 'NIGHT',
    language: r.language,
    location: r.location,
    taskType: r.taskType,
    hindrance: r.hindrance,
    delayMinutes: r.delayMinutes,
    tags: r.tags || [],
  };
  const lines = ['---'];
  for (const [k, v] of Object.entries(fm)) {
    if (v === undefined) continue;
    lines.push(`${k}: ${yamlValue(v)}`);
  }
  lines.push('---', '');
  const langLabel = r.language === 'pl' ? 'Polnisch' : 'Deutsch';
  lines.push(`## Original Transkript (${langLabel})`, r.rawTranscript || '', '');
  if (r.translatedTranscript) {
    lines.push('## Übersetzt (Deutsch)', r.translatedTranscript, '');
  }
  lines.push('## Bereinigt & Strukturiert', r.cleanedText || '');
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Write everything
// ---------------------------------------------------------------------------

async function writeJson(file, data) {
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf-8');
}

async function main() {
  await fs.mkdir(DB_DIR, { recursive: true });

  await writeJson(path.join(DB_DIR, 'users.json'), users);
  await writeJson(path.join(DB_DIR, 'shifts.json'), shifts);
  await writeJson(path.join(DB_DIR, 'worker-reports.json'), reports);
  await writeJson(path.join(DB_DIR, 'aggregations.json'), aggregations);

  // Markdown files for the detailed shift's reports
  for (const r of reports) {
    const dateStr = r.createdAt.split('T')[0];
    const dir = path.join(DATA_ROOT, 'reports', r.workerId, dateStr);
    await fs.mkdir(dir, { recursive: true });
    const ts = r.createdAt.replace(/[:.]/g, '').slice(0, 15);
    await fs.writeFile(path.join(dir, `report-${ts}.md`), toMarkdown(r), 'utf-8');
  }

  console.log('✅ Seed complete.');
  console.log(`   Users:        ${users.length}`);
  console.log(`   Shifts:       ${shifts.length} (1 active: ${ACTIVE})`);
  console.log(`   Reports:      ${reports.length} (latest shift: ${LATEST})`);
  console.log(`   Aggregations: ${aggregations.length}`);
  console.log(`   Data root:    ${DATA_ROOT}`);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
