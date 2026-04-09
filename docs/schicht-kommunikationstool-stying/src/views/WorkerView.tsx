import React, { useState } from 'react';
import { Mic, Camera, FileUp, Send, CheckCircle2, AlertCircle, Clock, X } from 'lucide-react';

export default function WorkerView() {
  const [showQA, setShowQA] = useState(true);

  return (
    <div className="max-w-3xl mx-auto p-4 pb-24 space-y-6 relative">
      <header className="mb-8">
        <h1 className="text-2xl font-serif font-bold mb-1">Hallo Piotr,</h1>
        <p className="text-forest-600 dark:text-stone-400 text-sm">Schicht 2 • Baggerfahrer • Gleis 4</p>
      </header>

      {/* QA Popup (Simulated) */}
      {showQA && (
        <div className="absolute top-4 left-4 right-4 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-night-800 border-2 border-amber-500/50 rounded-xl p-5 shadow-2xl shadow-amber-500/10">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2 text-amber-500">
                <AlertCircle className="w-5 h-5" />
                <span className="font-bold uppercase tracking-wider text-xs">KI-Rückfrage</span>
              </div>
              <button onClick={() => setShowQA(false)} className="text-stone-400 hover:text-stone-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-lg font-medium mb-4">"Du hast das undokumentierte Rohr erwähnt. Wie viele Stunden hat euch das gekostet?"</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowQA(false)}
                className="flex-1 bg-lime-glow text-night-950 font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-lime-400 transition-colors"
              >
                <Mic className="w-5 h-5" /> Antworten
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Card */}
      <div className="luxury-card p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-lime-glow/20 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-lime-glow" />
          </div>
          <div>
            <p className="text-sm font-bold">Status: Aktiv</p>
            <p className="text-xs text-stone-400">Letztes Update: vor 12 Min</p>
          </div>
        </div>
        <button className="px-3 py-1.5 rounded-md border border-forest-200 dark:border-night-700 text-xs font-medium hover:bg-forest-50 dark:hover:bg-night-800 transition-colors">
          Pause melden
        </button>
      </div>

      {/* Voice Input Area */}
      <div className="luxury-card p-6 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-24 h-24 rounded-full bg-lime-glow/10 flex items-center justify-center cursor-pointer hover:bg-lime-glow/20 transition-colors border border-lime-glow/30 relative group">
          <div className="absolute inset-0 rounded-full bg-lime-glow/20 animate-ping opacity-0 group-hover:opacity-100"></div>
          <Mic className="w-10 h-10 text-lime-glow" />
        </div>
        <div>
          <p className="font-bold text-lg mb-1">Sprachnotiz aufnehmen</p>
          <p className="text-xs text-stone-400">"Wir brauchen mehr Schotter an Gleis 4..."</p>
        </div>
        
        <div className="flex gap-4 w-full mt-4">
          <button className="flex-1 py-4 rounded-xl bg-forest-50 dark:bg-night-800 border border-forest-100 dark:border-night-700 flex items-center justify-center gap-2 hover:bg-forest-100 dark:hover:bg-night-700 transition-colors">
            <Camera className="w-5 h-5 text-forest-600 dark:text-stone-300" />
            <span className="text-sm font-bold">Foto</span>
          </button>
          <button className="flex-1 py-4 rounded-xl bg-forest-50 dark:bg-night-800 border border-forest-100 dark:border-night-700 flex items-center justify-center gap-2 hover:bg-forest-100 dark:hover:bg-night-700 transition-colors">
            <FileUp className="w-5 h-5 text-forest-600 dark:text-stone-300" />
            <span className="text-sm font-bold">Datei</span>
          </button>
        </div>
      </div>

      {/* AI Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-stone-400">Letzte Einträge</h2>
          <span className="text-xs text-lime-glow">Live</span>
        </div>

        <div className="luxury-card p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-stone-400" />
              <span className="text-xs text-stone-400">10:42 Uhr</span>
            </div>
            <span className="micro-label bg-lime-glow/10 text-lime-glow">Erfasst</span>
          </div>
          <p className="text-sm">"Bagger 3 hat ein Problem mit der Hydraulik, verliert etwas Öl."</p>
          <div className="p-3 rounded-md bg-forest-50 dark:bg-night-800 border border-forest-100 dark:border-night-700">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-500 mb-1">KI-Analyse: Wartung erforderlich</p>
                <p className="text-xs text-stone-400">Meldung wurde an die Werkstatt weitergeleitet. Priorität: Hoch.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="luxury-card p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-stone-400" />
              <span className="text-xs text-stone-400">09:15 Uhr</span>
            </div>
            <span className="micro-label bg-lime-glow/10 text-lime-glow">Erfasst</span>
          </div>
          <p className="text-sm">"Schotterlieferung für Gleis 4 ist angekommen und wird verteilt."</p>
          <div className="p-3 rounded-md bg-forest-50 dark:bg-night-800 border border-forest-100 dark:border-night-700">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-lime-glow shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-lime-glow mb-1">KI-Analyse: Materialeingang</p>
                <p className="text-xs text-stone-400">Bestand aktualisiert. Baufortschritt im Plan.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
