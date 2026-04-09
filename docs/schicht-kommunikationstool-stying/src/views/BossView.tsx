import React from 'react';
import { TrendingUp, TrendingDown, Activity, Users, DollarSign, Target } from 'lucide-react';

export default function BossView() {
  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight uppercase text-lime-glow">Kinetic Intel</h1>
          <p className="text-sm text-stone-400 mt-1 uppercase tracking-widest">Executive Command</p>
        </div>
        <div className="flex gap-4">
          <button className="px-4 py-2 rounded-md border border-lime-glow/20 text-lime-glow text-xs font-bold uppercase tracking-wider hover:bg-lime-glow/10 transition-colors">
            Export Report
          </button>
        </div>
      </header>

      {/* Hero Section: KPI Cards */}
      <section className="space-y-4">
        <div className="flex justify-between items-end mb-2">
          <h2 className="text-sm font-bold text-stone-400 tracking-widest uppercase">Global Performance</h2>
          <span className="micro-label bg-lime-glow/10 text-lime-glow">Live Feed</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* KPI 1 */}
          <div className="luxury-card p-6 rounded-xl border-l-4 border-lime-glow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-1">Total Revenue</p>
                <h3 className="text-4xl font-bold tracking-tighter">€4.2M</h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-lime-glow flex items-center gap-1 font-bold">+12.4% <TrendingUp className="w-3 h-3" /></span>
              </div>
            </div>
          </div>

          {/* KPI 2 */}
          <div className="luxury-card p-6 rounded-xl border-l-4 border-blue-400">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-1">Active Projects</p>
                <h3 className="text-4xl font-bold tracking-tighter">142</h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-amber-500 flex items-center gap-1 font-bold">-2.1% <TrendingDown className="w-3 h-3" /></span>
              </div>
            </div>
          </div>

          {/* KPI 3 */}
          <div className="luxury-card p-6 rounded-xl border-l-4 border-purple-400">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-1">Overall Efficiency</p>
                <h3 className="text-4xl font-bold tracking-tighter">88.4%</h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-lime-glow flex items-center gap-1 font-bold">+5.8% <TrendingUp className="w-3 h-3" /></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Charts Area */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="luxury-card p-6 rounded-xl">
          <h3 className="text-lg font-bold mb-6">Productivity Trend</h3>
          <div className="h-48 flex items-end gap-2">
            {/* Simulated Chart */}
            {[40, 60, 45, 70, 85, 65, 90, 80, 95, 100].map((val, i) => (
              <div key={i} className="flex-1 bg-lime-glow/20 rounded-t-sm relative group hover:bg-lime-glow/40 transition-colors" style={{ height: `${val}%` }}>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-night-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {val}%
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="luxury-card p-6 rounded-xl">
          <h3 className="text-lg font-bold mb-6">Resource Allocation</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Personal</span>
                <span className="text-lime-glow font-bold">85%</span>
              </div>
              <div className="w-full bg-night-900 h-2 rounded-full overflow-hidden">
                <div className="bg-lime-glow h-full w-[85%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Maschinen</span>
                <span className="text-blue-400 font-bold">92%</span>
              </div>
              <div className="w-full bg-night-900 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-400 h-full w-[92%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Material</span>
                <span className="text-purple-400 font-bold">64%</span>
              </div>
              <div className="w-full bg-night-900 h-2 rounded-full overflow-hidden">
                <div className="bg-purple-400 h-full w-[64%]"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ranking Section */}
      <section className="luxury-card rounded-xl overflow-hidden">
        <div className="p-6 border-b border-night-800 flex justify-between items-center">
          <h3 className="text-lg font-bold">Top Performer vs. Nachzügler</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] text-stone-500 uppercase tracking-widest border-b border-night-800 bg-night-900/30">
                <th className="px-6 py-4 font-normal">Einheit / Team</th>
                <th className="px-6 py-4 font-normal">Output</th>
                <th className="px-6 py-4 font-normal">Qualität</th>
                <th className="px-6 py-4 font-normal text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-night-800">
              <tr className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-lime-glow/20 flex items-center justify-center text-lime-glow font-bold text-xs">P1</div>
                    <div>
                      <p className="text-sm font-bold">Produktionslinie A-12</p>
                      <p className="text-[10px] text-stone-500 uppercase">Shift Leader: J. Doe</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-mono">12,450</td>
                <td className="px-6 py-4">
                  <span className="text-xs font-bold text-lime-glow">99.2%</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="px-2 py-1 rounded-full bg-lime-glow/10 text-lime-glow text-[10px] font-bold uppercase tracking-widest">Elite</span>
                </td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-xs">L5</div>
                    <div>
                      <p className="text-sm font-bold">Logistik-Hub Nord</p>
                      <p className="text-[10px] text-stone-500 uppercase">Manager: K. Vance</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 font-mono text-stone-400">8,120</td>
                <td className="px-6 py-4">
                  <span className="text-xs font-bold text-amber-500">82.4%</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="px-2 py-1 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-widest">Action Req</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
