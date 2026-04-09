import React from 'react';
import { User, BrainCircuit, Activity, Mic, TrendingUp, AlertCircle } from 'lucide-react';

export default function EmployeeKPIsView() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight uppercase">Personal-KPI</h1>
          <p className="text-sm text-stone-400 mt-1 uppercase tracking-widest">Detailanalyse • Hans Krupp</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 luxury-card rounded-lg flex items-center gap-2 hover:bg-white/5 transition-colors">
            <span className="text-xs font-bold uppercase tracking-wider">Historie</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="luxury-card p-6 rounded-xl flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-lime-glow/20 flex items-center justify-center mb-4 border-2 border-lime-glow/50 relative">
            <User className="w-10 h-10 text-lime-glow" />
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-night-950 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-lime-glow rounded-full animate-pulse"></div>
            </div>
          </div>
          <h2 className="text-xl font-bold">Hans Krupp</h2>
          <p className="text-xs text-stone-400 uppercase tracking-widest mt-1 mb-4">Maschinenführer • Level 4</p>
          
          <div className="w-full space-y-3 mt-4">
            <div className="flex justify-between text-sm p-2 bg-night-900/50 rounded">
              <span className="text-stone-400">Effizienz Score</span>
              <span className="font-bold text-lime-glow">98.5%</span>
            </div>
            <div className="flex justify-between text-sm p-2 bg-night-900/50 rounded">
              <span className="text-stone-400">Fehlerrate</span>
              <span className="font-bold text-lime-glow">0.2%</span>
            </div>
            <div className="flex justify-between text-sm p-2 bg-night-900/50 rounded">
              <span className="text-stone-400">Betriebszugehörigkeit</span>
              <span className="font-bold">4 Jahre</span>
            </div>
          </div>
        </div>

        {/* AI Analysis */}
        <div className="luxury-card p-6 rounded-xl lg:col-span-2 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <BrainCircuit className="w-5 h-5 text-lime-glow" />
            <h3 className="text-lg font-bold uppercase tracking-tight">KI-Verhaltensanalyse</h3>
          </div>
          <div className="flex-1 bg-night-900/30 rounded-lg p-4 border border-lime-glow/10 space-y-4">
            <p className="text-sm leading-relaxed text-stone-300">
              Hans zeigt eine außergewöhnlich hohe Konstanz in der Bedienung von Großgerät. 
              Die Analyse der letzten 30 Tage zeigt eine <span className="text-lime-glow font-bold">Optimierung des Kraftstoffverbrauchs um 12%</span> im Vergleich zum Teamdurchschnitt.
            </p>
            <div className="flex items-start gap-3 p-3 bg-lime-glow/5 border border-lime-glow/20 rounded-md">
              <TrendingUp className="w-5 h-5 text-lime-glow shrink-0" />
              <div>
                <p className="text-xs font-bold text-lime-glow uppercase mb-1">Stärke identifiziert</p>
                <p className="text-xs text-stone-400">Präzise Materialaufnahme reduziert Verschleiß an der Schaufelhydraulik signifikant.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-md">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-500 uppercase mb-1">Entwicklungspotenzial</p>
                <p className="text-xs text-stone-400">Kommunikation bei Schichtübergabe oft sehr knapp. Detailliertere Logs empfohlen.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Voice Logs */}
        <div className="luxury-card p-6 rounded-xl lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-stone-400" />
              <h3 className="text-lg font-bold uppercase tracking-tight">Letzte Sprach-Logs</h3>
            </div>
            <span className="text-xs text-stone-500">Transkribiert von KI</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-night-900/50 rounded-lg border border-night-800">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] text-stone-500 font-mono">Heute, 14:30</span>
                <span className="micro-label bg-lime-glow/10 text-lime-glow">Positiv</span>
              </div>
              <p className="text-sm italic text-stone-300">"Gleisbett für Abschnitt B ist fertig verdichtet. Werte sehen gut aus. Gehe jetzt in Pause."</p>
            </div>
            <div className="p-4 bg-night-900/50 rounded-lg border border-night-800">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] text-stone-500 font-mono">Gestern, 09:15</span>
                <span className="micro-label bg-amber-500/10 text-amber-500">Neutral</span>
              </div>
              <p className="text-sm italic text-stone-300">"Brauche mehr Diesel an Bagger 2. Tankanzeige spinnt ein bisschen, aber sollte noch für 2 Stunden reichen."</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
