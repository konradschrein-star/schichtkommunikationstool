import React from 'react';
import { AlertTriangle, Clock, CheckCircle2, TrendingUp, Package, Users, ArrowRight, PauseCircle, XCircle } from 'lucide-react';

export default function ShiftLeaderView() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight uppercase">Operations_CMD</h1>
          <p className="text-sm text-stone-400 mt-1 uppercase tracking-widest">Schichtleiter Dashboard • Sektor Nord</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 luxury-card rounded-lg flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-lime-glow animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-300">System_Live</span>
          </div>
        </div>
      </header>

      {/* 4 Quadrants for Shift Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* 1. Geschafft */}
        <div className="luxury-card p-5 rounded-xl border-t-4 border-lime-glow">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-lime-glow" />
            <h2 className="text-sm font-bold uppercase tracking-wider">Was wurde geschafft</h2>
          </div>
          <ul className="space-y-3">
            <li className="text-sm text-stone-300 flex items-start gap-2">
              <span className="text-lime-glow mt-1">•</span>
              Gleisbett Abschnitt B komplett verdichtet (100%).
            </li>
            <li className="text-sm text-stone-300 flex items-start gap-2">
              <span className="text-lime-glow mt-1">•</span>
              Materialeingang (40t Schotter) verbucht und verteilt.
            </li>
            <li className="text-sm text-stone-300 flex items-start gap-2">
              <span className="text-lime-glow mt-1">•</span>
              3 von 4 Fundamenten für Signalmasten gegossen.
            </li>
          </ul>
        </div>

        {/* 2. Offen / Übergabe */}
        <div className="luxury-card p-5 rounded-xl border-t-4 border-blue-400">
          <div className="flex items-center gap-2 mb-4">
            <ArrowRight className="w-5 h-5 text-blue-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider">Was muss gemacht werden (Übergabe)</h2>
          </div>
          <ul className="space-y-3">
            <li className="text-sm text-stone-300 flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              Fundament 4 muss noch gegossen werden (Betonmischer bestellt für 07:00).
            </li>
            <li className="text-sm text-stone-300 flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              Bagger 3 braucht dringend Hydraulik-Öl vor dem nächsten Einsatz.
            </li>
          </ul>
        </div>

        {/* 3. Mittendrin aufgehört */}
        <div className="luxury-card p-5 rounded-xl border-t-4 border-amber-500">
          <div className="flex items-center gap-2 mb-4">
            <PauseCircle className="w-5 h-5 text-amber-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider">Wo wurde mittendrin aufgehört</h2>
          </div>
          <ul className="space-y-3">
            <li className="text-sm text-stone-300 flex items-start gap-2">
              <span className="text-amber-500 mt-1">•</span>
              <span className="font-medium text-amber-500">Blockade:</span> Graben für Kabeltrasse bei KM 12.4 gestoppt. Undokumentiertes Abwasserrohr gefunden.
            </li>
            <li className="text-sm text-stone-300 flex items-start gap-2">
              <span className="text-amber-500 mt-1">•</span>
              Piotr hat den Graben gesichert, aber wir müssen auf Freigabe vom Bauamt warten.
            </li>
          </ul>
        </div>

        {/* 4. Nicht geschafft */}
        <div className="luxury-card p-5 rounded-xl border-t-4 border-red-500">
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="w-5 h-5 text-red-500" />
            <h2 className="text-sm font-bold uppercase tracking-wider">Was wurde nicht geschafft</h2>
          </div>
          <ul className="space-y-3">
            <li className="text-sm text-stone-300 flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              Reinigung der Baustraße Süd (wegen Zeitverlust am Abwasserrohr).
            </li>
            <li className="text-sm text-stone-300 flex items-start gap-2">
              <span className="text-red-500 mt-1">•</span>
              Einmessen der neuen Schwellen (Vermesser war krank).
            </li>
          </ul>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* AI Shift Log */}
        <div className="luxury-card p-5 rounded-xl md:col-span-2 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-lg font-bold uppercase tracking-tight flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-lime-glow"></span>
                Live Schicht-Log
              </h2>
              <p className="text-xs text-stone-400 uppercase tracking-widest mt-1">KI-Synthetisiert aus Sprachnotizen</p>
            </div>
            <span className="micro-label bg-lime-glow/10 text-lime-glow">Auto-Sync</span>
          </div>
          
          <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
            <div className="pl-4 border-l-2 border-amber-500/50 relative">
              <div className="absolute w-2 h-2 rounded-full bg-amber-500 -left-[5px] top-1.5"></div>
              <p className="text-xs text-amber-500 font-mono mb-1">03:15:22</p>
              <p className="text-sm font-medium">Undokumentiertes Rohr gefunden</p>
              <p className="text-xs text-stone-400 mt-1">Meldung von Piotr. "Hier ist ein fettes Rohr im Weg, wir mussten 2 Stunden per Hand graben..."</p>
            </div>
            <div className="pl-4 border-l-2 border-lime-glow/30 relative">
              <div className="absolute w-2 h-2 rounded-full bg-lime-glow -left-[5px] top-1.5"></div>
              <p className="text-xs text-lime-glow font-mono mb-1">01:42:15</p>
              <p className="text-sm font-medium">Hydraulik-Warnung Bagger 3</p>
              <p className="text-xs text-stone-400 mt-1">Werkstatt-Ticket #442 automatisch erstellt. Priorität hochgestuft.</p>
            </div>
            <div className="pl-4 border-l-2 border-stone-700 relative">
              <div className="absolute w-2 h-2 rounded-full bg-stone-500 -left-[5px] top-1.5"></div>
              <p className="text-xs text-stone-400 font-mono mb-1">22:00:00</p>
              <p className="text-sm font-medium">Schichtbeginn</p>
              <p className="text-xs text-stone-400 mt-1">Alle 12 Mitarbeiter anwesend. Sicherheitseinweisung durchgeführt.</p>
            </div>
          </div>
        </div>

        {/* Productivity Snapshot */}
        <div className="space-y-6">
          <div className="luxury-card p-5 rounded-xl border-t-2 border-lime-glow/30">
            <p className="text-[10px] text-stone-400 uppercase tracking-widest mb-1">Produktivität</p>
            <div className="flex items-end justify-between mb-4">
              <h3 className="text-3xl font-bold text-lime-glow tracking-tighter">88%</h3>
              <span className="text-xs text-amber-500 flex items-center gap-1"><TrendingUp className="w-3 h-3 rotate-180" /> -4% (Rohr)</span>
            </div>
            <div className="w-full bg-night-900 h-1.5 rounded-full overflow-hidden">
              <div className="bg-lime-glow h-full w-[88%]"></div>
            </div>
          </div>

          <div className="luxury-card p-5 rounded-xl border-t-2 border-blue-500/30">
            <p className="text-[10px] text-stone-400 uppercase tracking-widest mb-1">Materialfluss</p>
            <div className="flex items-end justify-between mb-4">
              <h3 className="text-3xl font-bold text-blue-400 tracking-tighter">95%</h3>
              <span className="text-xs text-stone-400 flex items-center gap-1"><Package className="w-3 h-3" /> Stabil</span>
            </div>
            <div className="w-full bg-night-900 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-400 h-full w-[95%]"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
