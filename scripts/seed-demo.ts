import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import matter from 'gray-matter';

const DEMO_REPORTS = [
  {
    metadata: {
      id: 'demo-001',
      mitarbeiter: 'Piotr Kowalski',
      workerId: 'worker-001',
      rolle: 'Baggerfahrer',
      datum: new Date().toISOString().split('T')[0],
      zeit: '10:42:00',
      schicht: 2,
      gleis: '4',
      tags: ['Verzögerung', 'Material', 'Bagger-3'],
      audio_url: '/media/demo-001.webm',
      image_urls: [],
      status: 'processed',
      delay_hours: 2,
      estimated_cost: 800,
    },
    content: `## Original Transkript (Polnisch)
Mieliśmy problem z ukrytą rurą. Koparka 3 musiała się zatrzymać. Straciliśmy około 2 godziny.

## Übersetzung & Bereinigung

**Verzögerung durch undokumentiertes Rohr**

- **Betroffen:** Bagger 3, Gleis 4
- **Dauer:** 2 Stunden Stillstand
- **Zusätzliches Material benötigt:** Schotter (ca. 5 Tonnen)
- **Geschätzte Mehrkosten:** €800
- **Priorität:** Hoch

**Empfehlung:** Baustellenpläne aktualisieren, Bodenradar für nächsten Abschnitt anfordern.
`,
  },
  {
    metadata: {
      id: 'demo-002',
      mitarbeiter: 'Jan Nowak',
      workerId: 'worker-002',
      rolle: 'Gleisbauer',
      datum: new Date().toISOString().split('T')[0],
      zeit: '11:15:00',
      schicht: 2,
      gleis: '3',
      tags: ['Material', 'Schotter'],
      audio_url: '/media/demo-002.webm',
      image_urls: [],
      status: 'processed',
      delay_hours: 1.5,
      estimated_cost: 400,
    },
    content: `## Original Transkript (Deutsch)
Wir warten seit anderthalb Stunden auf Schotter. Gleis 3 kann nicht weitergehen.

## Übersetzung & Bereinigung

**Materialmangel Schotter**

- **Betroffen:** Gleis 3
- **Dauer:** 1.5 Stunden Wartezeit
- **Material:** Schotter (10 Tonnen benötigt)
- **Geschätzte Mehrkosten:** €400

**Empfehlung:** Materialdisposition verbessern, Puffer für kritische Materialien anlegen.
`,
  },
  {
    metadata: {
      id: 'demo-003',
      mitarbeiter: 'Marek Kowal',
      workerId: 'worker-003',
      rolle: 'Baggerfahrer',
      datum: new Date().toISOString().split('T')[0],
      zeit: '14:30:00',
      schicht: 2,
      gleis: '4',
      tags: ['Maschine', 'Wartung', 'Bagger-3'],
      audio_url: '/media/demo-003.webm',
      image_urls: [],
      status: 'processed',
      delay_hours: 2,
      estimated_cost: 1200,
    },
    content: `## Original Transkript (Polnisch)
Koparka 3 ma problem z hydrauliką, wyciek oleju. Potrzebna naprawa.

## Übersetzung & Bereinigung

**Hydraulikleck Bagger 3**

- **Betroffen:** Bagger 3
- **Problem:** Hydraulikleck, Ölaustritt
- **Dauer:** 2 Stunden Ausfallzeit (inkl. Wartung)
- **Material:** Hydrauliköl (20 Liter)
- **Geschätzte Mehrkosten:** €1,200
- **Priorität:** Hoch

**Empfehlung:** Sofortige Wartung durch Werkstatt, präventive Inspektion aller Bagger.
`,
  },
];

async function seedDemoData() {
  const reportsDir = path.join(process.cwd(), 'data', 'reports');

  if (!existsSync(reportsDir)) {
    await mkdir(reportsDir, { recursive: true });
  }

  console.log('🌱 Seeding demo reports...');

  for (const report of DEMO_REPORTS) {
    const filename = `${report.metadata.id}.md`;
    const filepath = path.join(reportsDir, filename);

    const fileContent = matter.stringify(report.content, report.metadata);
    await writeFile(filepath, fileContent);

    console.log(`✅ Created ${filename}`);
  }

  console.log(`\n🎉 Seeded ${DEMO_REPORTS.length} demo reports successfully!`);
  console.log('\nYou can now:');
  console.log('1. Visit http://localhost:3000/boss to see the reports');
  console.log('2. Switch to worker role and create new reports');
  console.log('3. Demo the full workflow to stakeholders\n');
}

seedDemoData().catch(console.error);
