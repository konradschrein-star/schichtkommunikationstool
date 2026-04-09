import { db } from '@/db';
import { shifts, shiftAggregations } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import CompleteShiftButton from '@/components/shift-leader/CompleteShiftButton';

export default async function ShiftLeaderPage() {
  let latestCompletedShift;
  try {
    const completedShifts = await db.query.shifts.findMany({
      where: eq(shifts.status, 'completed'),
      with: {
        aggregation: true,
      },
      orderBy: [desc(shifts.date)],
      limit: 1,
    });
    latestCompletedShift = completedShifts[0];
  } catch (error) {
    console.error('Error fetching completed shift:', error);
  }

  let activeShift;
  try {
    activeShift = await db.query.shifts.findFirst({
      where: eq(shifts.status, 'active'),
      orderBy: [desc(shifts.date)],
    });
  } catch (error) {
    console.error('Error fetching active shift:', error);
  }

  if (!latestCompletedShift || !latestCompletedShift.aggregation) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-2xl text-center space-y-8">
          <div className="text-8xl mb-6">📋</div>
          <h1 className="text-4xl font-bold text-black mb-4">Noch keine abgeschlossene Schicht</h1>
          <p className="text-xl text-gray-600 mb-8">
            Sobald eine Schicht beendet wurde, erscheint hier die vollständige Übergabe-Dokumentation.
          </p>

          {activeShift && (
            <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-4 text-black">Aktive Schicht</h2>
              <div className="text-lg text-gray-700 mb-6">
                <div className="font-mono">{activeShift.projectName}</div>
                <div className="text-gray-500 mt-2">
                  {new Date(activeShift.date).toLocaleDateString('de-DE', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
              <CompleteShiftButton shiftId={activeShift.id} projectName={activeShift.projectName} />
            </div>
          )}
        </div>
      </div>
    );
  }

  const aggregation = latestCompletedShift.aggregation;
  const summary = aggregation.structuredSummary as {
    completed?: string[];
    inProgress?: string[];
    blocked?: string[];
    nextShiftActions?: string[];
    criticalIssues?: string[];
  };

  const shiftDate = new Date(latestCompletedShift.date);
  const formattedDate = shiftDate.toLocaleDateString('de-DE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const completed = summary.completed || [];
  const inProgress = summary.inProgress || [];
  const blocked = [...(summary.blocked || []), ...(summary.criticalIssues || [])];
  const nextActions = summary.nextShiftActions || [];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-start justify-between mb-12 pb-8 border-b-4 border-black">
          <div>
            <div className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">
              Schichtübergabe
            </div>
            <h1 className="text-5xl font-bold text-black mb-3 leading-tight">
              {latestCompletedShift.projectName}
            </h1>
            <div className="text-xl font-mono text-gray-700">{formattedDate}</div>
            <div className="mt-2 inline-block px-4 py-1 bg-gray-900 text-white text-sm font-bold rounded-full">
              {latestCompletedShift.type === 'DAY' ? 'Tagschicht' : 'Nachtschicht'}
            </div>
          </div>

          {activeShift && (
            <div className="text-right">
              <CompleteShiftButton shiftId={activeShift.id} projectName={activeShift.projectName} />
              <div className="text-sm text-gray-500 mt-2">Aktive Schicht bereit</div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <QuadrantCard
            title="✓ Was wurde geschafft?"
            items={completed}
            color="green"
            icon="✓"
          />

          <QuadrantCard
            title="⏱ Was ist in Arbeit?"
            items={inProgress}
            color="blue"
            icon="⏱"
          />

          <QuadrantCard
            title="⚠ BLOCKER!"
            items={blocked}
            color="red"
            icon="⚠"
            priority
          />

          <QuadrantCard
            title="📋 Übergabe / To-Dos"
            items={nextActions}
            color="yellow"
            icon="📋"
          />
        </div>

        <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-10">
          <h2 className="text-2xl font-bold text-black mb-6 pb-4 border-b-2 border-gray-300">
            Zusammenfassung
          </h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-800 leading-relaxed text-lg whitespace-pre-line">
              {aggregation.summaryMarkdownPath || 'Keine Zusammenfassung verfügbar.'}
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t-2 border-gray-200 text-center text-sm text-gray-500">
          <div className="mb-2">Aggregation erstellt: {new Date(aggregation.createdAt).toLocaleString('de-DE')}</div>
          <div className="font-mono text-xs text-gray-400">ID: {aggregation.id}</div>
        </div>
      </div>
    </div>
  );
}

interface QuadrantCardProps {
  title: string;
  items: string[];
  color: 'green' | 'blue' | 'red' | 'yellow';
  icon: string;
  priority?: boolean;
}

function QuadrantCard({ title, items, color, icon, priority }: QuadrantCardProps) {
  const colorMap = {
    green: {
      border: 'border-green-500',
      bg: 'bg-green-50',
      text: 'text-green-900',
      accent: 'text-green-600',
      dot: 'bg-green-500',
    },
    blue: {
      border: 'border-blue-500',
      bg: 'bg-blue-50',
      text: 'text-blue-900',
      accent: 'text-blue-600',
      dot: 'bg-blue-500',
    },
    red: {
      border: 'border-red-600',
      bg: 'bg-red-50',
      text: 'text-red-900',
      accent: 'text-red-600',
      dot: 'bg-red-600',
    },
    yellow: {
      border: 'border-yellow-500',
      bg: 'bg-yellow-50',
      text: 'text-yellow-900',
      accent: 'text-yellow-700',
      dot: 'bg-yellow-500',
    },
  };

  const styles = colorMap[color];

  return (
    <div
      className={`border-4 ${styles.border} ${styles.bg} rounded-2xl p-6 ${
        priority ? 'shadow-2xl ring-4 ring-red-200' : 'shadow-lg'
      }`}
    >
      <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-current">
        <div className={`text-4xl ${priority ? 'animate-pulse' : ''}`}>{icon}</div>
        <h3 className={`text-2xl font-bold ${styles.text} leading-tight`}>{title}</h3>
      </div>

      {items.length > 0 ? (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className={`w-2 h-2 ${styles.dot} rounded-full mt-2 flex-shrink-0`}></div>
              <span className={`text-base ${styles.text} leading-relaxed font-medium`}>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-gray-500 italic text-center py-8">Keine Einträge</div>
      )}

      {priority && items.length > 0 && (
        <div className="mt-6 pt-4 border-t-2 border-red-300 text-sm font-bold text-red-700 uppercase tracking-wide">
          ⚡ Sofortige Aufmerksamkeit erforderlich
        </div>
      )}
    </div>
  );
}

export const metadata = {
  title: 'Schichtleiter Übergabe | ShiftSync',
  description: 'Operative Schichtübergabe - Was läuft, was blockiert, was ist zu tun',
};
