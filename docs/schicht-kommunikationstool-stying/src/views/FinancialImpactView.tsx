import React from 'react';
import { DollarSign, TrendingDown, AlertTriangle, FileText, Activity } from 'lucide-react';

export default function FinancialImpactView() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight uppercase">Finanz-Impact</h1>
          <p className="text-sm text-stone-400 mt-1 uppercase tracking-widest">Echtzeit-Analyse • Leakage & Effizienz</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 luxury-card rounded-lg flex items-center gap-2 hover:bg-white/5 transition-colors">
            <span className="text-xs font-bold uppercase tracking-wider text-lime-glow">Report Generieren</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue Potential */}
        <div className="luxury-card p-6 rounded-xl border-l-4 border-lime-glow">
          <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-1">Umsatzpotenzial (YTD)</p>
          <div className="flex items-end gap-3 mb-4">
            <h2 className="text-4xl font-bold tracking-tighter">€1.2M</h2>
          </div>
          <div className="h-2 w-full bg-night-900 rounded-full overflow-hidden">
            <div className="bg-lime-glow h-full w-[75%]"></div>
          </div>
          <p className="text-xs text-stone-500 mt-2">75% des Jahresziels erreicht</p>
        </div>

        {/* Identified Leakage */}
        <div className="luxury-card p-6 rounded-xl border-l-4 border-amber-500">
          <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-1">Identifiziertes Leakage</p>
          <div className="flex items-end gap-3 mb-4">
            <h2 className="text-4xl font-bold tracking-tighter text-amber-500">€42.5k</h2>
            <span className="text-xs text-amber-500 font-bold mb-1 flex items-center"><TrendingDown className="w-3 h-3 mr-1" /> 3.5%</span>
          </div>
          <div className="h-2 w-full bg-night-900 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full w-[35%]"></div>
          </div>
          <p className="text-xs text-stone-500 mt-2">Hauptsächlich durch ungenaue Doku</p>
        </div>

        {/* Doc Efficiency */}
        <div className="luxury-card p-6 rounded-xl border-l-4 border-blue-400">
          <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-1">Doku-Effizienz (KI-Bewertet)</p>
          <div className="flex items-end gap-3 mb-4">
            <h2 className="text-4xl font-bold tracking-tighter text-blue-400">88%</h2>
          </div>
          <div className="h-2 w-full bg-night-900 rounded-full overflow-hidden">
            <div className="bg-blue-400 h-full w-[88%]"></div>
          </div>
          <p className="text-xs text-stone-500 mt-2">Verbesserung um 12% seit letztem Monat</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leakage Breakdown */}
        <div className="luxury-card p-6 rounded-xl">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Leakage Ursachen
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-stone-300">Nicht erfasste Überstunden</span>
                <span className="text-amber-500 font-bold">€18.2k</span>
              </div>
              <div className="w-full bg-night-900 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[45%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-stone-300">Materialschwund</span>
                <span className="text-amber-500 font-bold">€12.5k</span>
              </div>
              <div className="w-full bg-night-900 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[30%]"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-stone-300">Maschinen-Leerlauf</span>
                <span className="text-amber-500 font-bold">€11.8k</span>
              </div>
              <div className="w-full bg-night-900 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[25%]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Events */}
        <div className="luxury-card p-6 rounded-xl">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-lime-glow" />
            Kostenrelevante Events
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-night-900/50 rounded-lg border border-night-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-amber-500/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-bold">Nachtrag Gleis 4</p>
                  <p className="text-xs text-stone-400">Zusätzlicher Schotter benötigt</p>
                </div>
              </div>
              <span className="text-sm font-bold text-amber-500">+ €4.500</span>
            </div>
            <div className="p-3 bg-night-900/50 rounded-lg border border-night-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-lime-glow/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-lime-glow" />
                </div>
                <div>
                  <p className="text-sm font-bold">Maschinen-Miete beendet</p>
                  <p className="text-xs text-stone-400">Bagger 2 früher zurückgegeben</p>
                </div>
              </div>
              <span className="text-sm font-bold text-lime-glow">- €1.200</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
