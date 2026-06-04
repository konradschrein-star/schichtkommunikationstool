import AppNav from '@/components/AppNav';

export const dynamic = 'force-dynamic';

type IdeaStatus = 'Geplant' | 'Backlog' | 'Phase 2';

interface Idea {
  icon: string;
  title: string;
  description: string;
  status: IdeaStatus;
}

const STATUS_STYLES: Record<IdeaStatus, string> = {
  Geplant: 'bg-[#00bfff]/20 text-[#00bfff]',
  'Phase 2': 'bg-[#8a2be2]/20 text-[#8a2be2]',
  Backlog: 'bg-[#ff0055]/20 text-[#ff0055]',
};

const IDEAS: Idea[] = [
  {
    icon: '🧠',
    title: 'Langzeitgedächtnis (RAG)',
    description:
      'Alle Markdown-Schichtberichte werden vektorisiert und durchsuchbar gemacht. Der Chef stellt einfach eine Frage in natürlicher Sprache – z.B. „Wie oft hatten wir 2025 Probleme mit Rohren in Sektor 4?“ – und erhält die Antwort samt Quellen aus dem gesamten Projektverlauf. Wissen geht nicht mehr verloren, wenn Mitarbeiter wechseln.',
    status: 'Phase 2',
  },
  {
    icon: '📷',
    title: 'Bildanalyse / Qualitätsmanagement',
    description:
      'Hochgeladene Fotos von der Baustelle werden automatisch analysiert – etwa Stahlkörnung, Verlegetiefe von Kabeln oder Asphaltqualität. Was in modernen Stahlwerken längst Standard ist, bringen wir auf die Baustelle: objektive, dokumentierte Qualitätskontrolle in Sekunden statt manueller Stichproben.',
    status: 'Phase 2',
  },
  {
    icon: '🎓',
    title: 'In-App-Tutorials',
    description:
      'KI-generierte Kurzanleitungen direkt im Tool führen neue Mitarbeiter Schritt für Schritt durch jede Funktion. Wer nicht weiß, wie etwas bedient wird, fragt einfach nach – ohne Schulungsaufwand und ohne den Vorarbeiter zu unterbrechen. Onboarding wird vom Kostenfaktor zur Selbstverständlichkeit.',
    status: 'Geplant',
  },
  {
    icon: '🔐',
    title: 'Volle DSGVO-Konformität',
    description:
      'Personenbezogene Daten werden vor dem Versand an externe APIs automatisch anonymisiert, das Hosting erfolgt vollständig in Deutschland. So bleibt das Tool rechtssicher einsetzbar – auch im Betriebsrat und bei sensiblen Mitarbeiterdaten gibt es keine Diskussion.',
    status: 'Geplant',
  },
  {
    icon: '📐',
    title: 'Projektmanagement-Integration',
    description:
      'Aus den täglichen Schicht-Eingaben entsteht eine echte Bauablauf-Planung samt Nachkalkulation. Soll/Ist-Vergleiche werden automatisch erstellt und Nachträge nach VOB/B §2 sauber dokumentiert. Behinderungen sind damit nicht nur sichtbar, sondern auch belastbar abrechenbar.',
    status: 'Phase 2',
  },
  {
    icon: '👥',
    title: 'HR & Personalentwicklung',
    description:
      'Über die Zeit entstehen Produktivitäts- und Stärkenprofile je Mitarbeiter. Das ermöglicht eine faire, datenbasierte Bewertung statt Bauchgefühl – Talente werden früh erkannt und gefördert, und Personaleinsatz lässt sich gezielt nach Stärken planen.',
    status: 'Backlog',
  },
  {
    icon: '📲',
    title: 'Mobile App / PWA & Offline',
    description:
      'Eine native App im App Store sowie eine installierbare PWA bringen das Tool direkt aufs Handy. Aufnahmen funktionieren auch offline auf der Baustelle – ohne Empfang – und werden später automatisch synchronisiert, sobald wieder Verbindung besteht. Kein Datenverlust im Funkloch.',
    status: 'Geplant',
  },
  {
    icon: '☁️',
    title: 'Skalierung & Mandantenfähigkeit',
    description:
      'Cloud-Hosting macht das Tool für beliebig viele Baustellen und Firmen einsatzbereit. Eine feingranulare Rollen- und Rechteverwaltung trennt Daten sauber pro Mandant. So wächst die Lösung mit – vom einzelnen Bauleiter bis zum konzernweiten Rollout.',
    status: 'Backlog',
  },
];

export default function IdeasPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <AppNav active="ideas" />

      <div className="max-w-7xl mx-auto px-6 py-10">
        <header className="mb-12 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#8a2be2] mb-3">
            Roadmap & Vision
          </p>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-[#8a2be2] to-[#00bfff]">
            Ausbaustufen &amp; Ideen
          </h1>
          <p className="text-[#768390] text-lg leading-relaxed">
            Das aktuelle MVP löst bereits heute zuverlässig die digitale Schichtübergabe. Doch das
            ist erst der Anfang: Auf dieser Seite sehen Sie als Geschäftsführung, wohin sich das
            Tool ausbauen lässt – vom intelligenten Langzeitgedächtnis über automatische
            Qualitätskontrolle bis zur konzernweiten Skalierung.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {IDEAS.map((idea) => (
            <article
              key={idea.title}
              className="bg-[#1c2128]/40 backdrop-blur-xl rounded-2xl border border-[#2d333b]/50 p-6 shadow-2xl hover:-translate-y-0.5 transition-transform flex flex-col"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <span className="text-4xl leading-none" aria-hidden="true">
                  {idea.icon}
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-md ${STATUS_STYLES[idea.status]}`}
                >
                  {idea.status}
                </span>
              </div>
              <h2 className="text-xl font-bold mb-3 text-white">{idea.title}</h2>
              <p className="text-[#768390] text-sm leading-relaxed">{idea.description}</p>
            </article>
          ))}
        </section>

        <section className="mt-10">
          <div className="bg-[#1c2128]/40 backdrop-blur-xl rounded-2xl border border-[#2d333b]/50 p-8 md:p-10 shadow-2xl bg-gradient-to-br from-[#8a2be2]/10 to-[#00bfff]/10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="max-w-2xl">
                <h2 className="text-2xl md:text-3xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-[#8a2be2] to-[#00bfff]">
                  Welche Ausbaustufe ist für Sie am wertvollsten?
                </h2>
                <p className="text-[#768390] text-base leading-relaxed">
                  Jede dieser Ideen lässt sich gezielt auf Ihre Prozesse zuschneiden. Sagen Sie uns,
                  wo der größte Hebel für Ihr Unternehmen liegt – wir priorisieren die Roadmap
                  gemeinsam mit Ihnen. Sprechen Sie uns an.
                </p>
              </div>
              <div className="shrink-0">
                <span className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#8a2be2] to-[#00bfff] shadow-lg shadow-[#8a2be2]/40">
                  Gespräch vereinbaren →
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Ausbaustufen & Ideen | ShiftSync',
  description: 'Roadmap & Vision – wohin sich das Schichtkommunikationstool ausbauen lässt.',
};
