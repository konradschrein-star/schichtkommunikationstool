import { getAllShiftsWithKPIs } from '@/app/actions/shift-aggregation';
import { ProductivityChart, HindranceHeatmap } from '@/components/boss/DashboardCharts';

export default async function BossDashboard({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const params = await searchParams;
  const period = params.period || 'week';

  let shiftsData: any[];
  try {
    const result = await getAllShiftsWithKPIs();
    shiftsData = (result.success && result.data) ? result.data : [];
  } catch (error) {
    console.error('Error fetching shifts:', error);
    shiftsData = [];
  }

  const now = new Date();
  const filteredShifts = shiftsData.filter((shift) => {
    const shiftDate = new Date(shift.date);
    const daysDiff = Math.floor((now.getTime() - shiftDate.getTime()) / (1000 * 60 * 60 * 24));

    if (period === 'today') return daysDiff === 0;
    if (period === 'week') return daysDiff <= 7;
    if (period === 'month') return daysDiff <= 30;
    return true;
  });

  const completedShifts = filteredShifts.filter((s) => s.aggregation);

  const totalLeakageEUR = completedShifts.reduce((sum, shift) => {
    return sum + (shift.aggregation?.kpis?.materialCostEUR || 0);
  }, 0);

  const avgProductivity =
    completedShifts.length > 0
      ? completedShifts.reduce((sum, shift) => sum + (shift.aggregation?.kpis?.productivityScore || 0), 0) /
        completedShifts.length
      : 0;

  const totalHindrances = completedShifts.reduce((sum, shift) => {
    return sum + (shift.aggregation?.kpis?.hindranceEvents || 0);
  }, 0);

  const productivityData = completedShifts.slice(-7).map((shift) => {
    return shift.aggregation?.kpis?.productivityScore || 0;
  });

  const productivityLabels = completedShifts.slice(-7).map((shift) => {
    const date = new Date(shift.date);
    return date.toLocaleDateString('de-DE', { weekday: 'short' });
  });

  const heatmapData: number[][] = [];
  const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  const shifts = ['NIGHT', 'DAY', 'DAY'];

  completedShifts.slice(-21).forEach((shift) => {
    const date = new Date(shift.date);
    const dayIndex = (date.getDay() + 6) % 7;
    const shiftIndex = shift.type === 'NIGHT' ? 0 : 1;
    const hindrances = shift.aggregation?.kpis?.hindranceEvents || 0;
    heatmapData.push([dayIndex, shiftIndex, hindrances]);
  });

  const performersData = completedShifts
    .map((shift) => ({
      date: new Date(shift.date).toLocaleDateString('de-DE'),
      topPerformer: shift.aggregation?.kpis?.topPerformer || 'N/A',
      underperformer: shift.aggregation?.kpis?.underperformer || 'N/A',
      productivity: shift.aggregation?.kpis?.productivityScore || 0,
      hindrances: shift.aggregation?.kpis?.hindranceEvents || 0,
    }))
    .slice(-10)
    .reverse();

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-[#8a2be2] to-[#00bfff] bg-clip-text text-transparent">
              Boss Dashboard
            </h1>
            <p className="text-[#768390] text-lg">Echtzeit-Einblicke in Produktivität & Kosten</p>
          </div>

          <div className="flex gap-2 bg-[#1c2128] rounded-xl p-2 border border-[#2d333b]">
            <PeriodButton period="today" active={period === 'today'} />
            <PeriodButton period="week" active={period === 'week'} />
            <PeriodButton period="month" active={period === 'month'} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <KPICard
            label="Leakage / Verlust"
            value={`€${totalLeakageEUR.toLocaleString('de-DE')}`}
            trend={totalLeakageEUR > 5000 ? 'up' : 'down'}
            color="red"
          />
          <KPICard
            label="Produktivitäts-Score"
            value={`${Math.round(avgProductivity)}%`}
            trend={avgProductivity > 80 ? 'up' : 'down'}
            color="blue"
          />
          <KPICard
            label="Kritische VOB/B Behinderungen"
            value={totalHindrances.toString()}
            trend={totalHindrances > 5 ? 'up' : 'down'}
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <div className="bg-[#1c2128]/40 backdrop-blur-xl rounded-2xl border border-[#2d333b]/50 p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-[#00bfff]">Produktivität (7 Tage)</h2>
            <ProductivityChart
              data={productivityData.length > 0 ? productivityData : undefined}
              labels={productivityLabels.length > 0 ? productivityLabels : undefined}
            />
          </div>

          <div className="bg-[#1c2128]/40 backdrop-blur-xl rounded-2xl border border-[#2d333b]/50 p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-[#8a2be2]">VOB/B Behinderungen Heatmap</h2>
            <HindranceHeatmap data={heatmapData.length > 0 ? heatmapData : undefined} />
          </div>
        </div>

        <div className="bg-[#1c2128]/40 backdrop-blur-xl rounded-2xl border border-[#2d333b]/50 p-6 shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 text-white">Performance Leaderboard</h2>

          {performersData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2d333b]">
                    <th className="text-left py-4 px-4 text-[#768390] font-semibold">Datum</th>
                    <th className="text-left py-4 px-4 text-[#768390] font-semibold">Top Performer</th>
                    <th className="text-left py-4 px-4 text-[#768390] font-semibold">Underperformer</th>
                    <th className="text-center py-4 px-4 text-[#768390] font-semibold">Produktivität</th>
                    <th className="text-center py-4 px-4 text-[#768390] font-semibold">Behinderungen</th>
                  </tr>
                </thead>
                <tbody>
                  {performersData.map((row, index) => (
                    <tr
                      key={index}
                      className="border-b border-[#2d333b]/50 hover:bg-[#2d333b]/30 transition-colors"
                    >
                      <td className="py-4 px-4 text-[#768390] font-mono">{row.date}</td>
                      <td className="py-4 px-4">
                        <span className="text-[#00bfff] font-semibold">{row.topPerformer}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-[#ff0055] font-semibold">{row.underperformer}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full font-bold ${
                            row.productivity >= 90
                              ? 'bg-[#00bfff]/20 text-[#00bfff]'
                              : row.productivity >= 75
                              ? 'bg-[#8a2be2]/20 text-[#8a2be2]'
                              : 'bg-[#ff0055]/20 text-[#ff0055]'
                          }`}
                        >
                          {row.productivity}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-full font-bold ${
                            row.hindrances === 0
                              ? 'bg-[#00bfff]/20 text-[#00bfff]'
                              : row.hindrances <= 2
                              ? 'bg-[#8a2be2]/20 text-[#8a2be2]'
                              : 'bg-[#ff0055]/20 text-[#ff0055]'
                          }`}
                        >
                          {row.hindrances}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-[#768390]">
              <div className="text-4xl mb-4">📊</div>
              <p className="text-lg">Noch keine Daten für den gewählten Zeitraum</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PeriodButton({ period, active }: { period: string; active: boolean }) {
  const labels: Record<string, string> = {
    today: 'Heute',
    week: 'Woche',
    month: 'Monat',
  };

  return (
    <a
      href={`/boss/dashboard?period=${period}`}
      className={`px-6 py-2 rounded-lg font-semibold transition-all ${
        active
          ? 'bg-gradient-to-r from-[#8a2be2] to-[#00bfff] text-white shadow-lg shadow-[#8a2be2]/50'
          : 'text-[#768390] hover:text-white hover:bg-[#2d333b]'
      }`}
    >
      {labels[period]}
    </a>
  );
}

interface KPICardProps {
  label: string;
  value: string;
  trend: 'up' | 'down';
  color: 'red' | 'blue' | 'purple';
}

function KPICard({ label, value, trend, color }: KPICardProps) {
  const colorMap = {
    red: {
      gradient: 'from-[#ff0055] to-[#ff0055]/50',
      glow: 'shadow-[#ff0055]/50',
      text: 'text-[#ff0055]',
    },
    blue: {
      gradient: 'from-[#00bfff] to-[#00bfff]/50',
      glow: 'shadow-[#00bfff]/50',
      text: 'text-[#00bfff]',
    },
    purple: {
      gradient: 'from-[#8a2be2] to-[#8a2be2]/50',
      glow: 'shadow-[#8a2be2]/50',
      text: 'text-[#8a2be2]',
    },
  };

  const { gradient, glow, text } = colorMap[color];

  return (
    <div
      className={`relative bg-[#1c2128]/40 backdrop-blur-xl rounded-2xl border border-[#2d333b]/50 p-8 shadow-2xl ${glow} hover:scale-105 transition-transform`}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-[#768390] text-sm font-semibold uppercase tracking-wide">{label}</h3>
        <div className={`${trend === 'up' ? 'text-[#ff0055]' : 'text-[#00bfff]'}`}>
          {trend === 'up' ? '↑' : '↓'}
        </div>
      </div>
      <div className={`text-5xl font-bold mb-2 bg-gradient-to-br ${gradient} bg-clip-text text-transparent`}>
        {value}
      </div>
      <div className={`text-sm ${text} font-semibold`}>
        {trend === 'up' ? 'Erhöht' : 'Gesunken'} im Vergleich
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Boss Dashboard | ShiftSync',
  description: 'Management Dashboard - KPIs, Produktivität & VOB/B Behinderungen',
};
