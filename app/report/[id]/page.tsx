import { getReport, getUser } from '@/lib/store';
import AppNav from '@/components/AppNav';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const report = await getReport(id);

  if (!report) {
    return (
      <div className="min-h-screen bg-white">
        <AppNav active="leader" />
        <div className="max-w-2xl mx-auto px-6 py-24 text-center space-y-6">
          <div className="text-6xl">🔍</div>
          <h1 className="text-3xl font-bold text-black">Bericht nicht gefunden</h1>
          <Link href="/shift-leader" className="inline-block text-blue-600 font-semibold hover:underline">
            ← Zurück zur Schichtübergabe
          </Link>
        </div>
      </div>
    );
  }

  const date = new Date(report.createdAt).toLocaleString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <AppNav active="leader" />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <Link href="/shift-leader" className="text-sm text-blue-600 font-semibold hover:underline">
          ← Schichtübergabe
        </Link>

        <header className="mt-4 mb-8 pb-6 border-b-2 border-slate-900">
          <div className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-1">
            Mitarbeiter-Bericht
          </div>
          <h1 className="text-4xl font-bold mb-2">{report.workerName}</h1>
          <div className="text-slate-600">{report.profession} · {date}</div>

          <div className="flex flex-wrap gap-2 mt-4">
            {report.location && <Tag>{report.location}</Tag>}
            {report.taskType && <Tag>{report.taskType}</Tag>}
            {report.language === 'pl' && <Tag tone="blue">Polnisch → Deutsch</Tag>}
            {report.hindrance && <Tag tone="red">⚠ VOB/B Behinderung</Tag>}
            {typeof report.delayMinutes === 'number' && report.delayMinutes > 0 && (
              <Tag tone="amber">{report.delayMinutes} min Verzögerung</Tag>
            )}
            {typeof report.materialCostEUR === 'number' && report.materialCostEUR > 0 && (
              <Tag tone="red">~{report.materialCostEUR} € Mehraufwand</Tag>
            )}
            {(report.tags || []).map((t) => (
              <Tag key={t}>#{t}</Tag>
            ))}
          </div>
        </header>

        <Section title="Bereinigt & strukturiert (KI)">
          <div className="whitespace-pre-line leading-relaxed text-slate-800">{report.cleanedText}</div>
        </Section>

        {report.translatedTranscript && (
          <Section title="Übersetzung (Deutsch)">
            <div className="whitespace-pre-line leading-relaxed text-slate-700">
              {report.translatedTranscript}
            </div>
          </Section>
        )}

        {report.rawTranscript && (
          <Section title={`Original-Transkript (${report.language === 'pl' ? 'Polnisch' : 'Deutsch'})`}>
            <div className="whitespace-pre-line leading-relaxed text-slate-500 italic">
              {report.rawTranscript}
            </div>
            <p className="mt-3 text-xs text-slate-400">
              Das Original wird aufbewahrt, damit KI-Fehler jederzeit nachvollziehbar sind.
            </p>
          </Section>
        )}
      </div>
    </div>
  );
}

function Tag({ children, tone = 'gray' }: { children: React.ReactNode; tone?: 'gray' | 'blue' | 'red' | 'amber' }) {
  const tones: Record<string, string> = {
    gray: 'bg-slate-100 text-slate-600',
    blue: 'bg-blue-100 text-blue-700',
    red: 'bg-red-100 text-red-700',
    amber: 'bg-amber-100 text-amber-700',
  };
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-md ${tones[tone]}`}>{children}</span>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-bold text-slate-900 mb-3">{title}</h2>
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">{children}</div>
    </section>
  );
}
