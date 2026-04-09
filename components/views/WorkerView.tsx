'use client';

import { useState } from 'react';
import { Mic, Camera, FileUp, CheckCircle2, Clock } from 'lucide-react';

export default function WorkerView() {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div className="max-w-3xl mx-auto p-4 pb-24 space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl font-serif font-bold mb-1">Hallo Piotr,</h1>
        <p className="text-forest-600 dark:text-stone-400 text-sm">
          Schicht 2 • Baggerfahrer • Gleis 4
        </p>
      </header>

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
        <button
          onClick={() => setIsRecording(!isRecording)}
          className={`w-24 h-24 rounded-full flex items-center justify-center cursor-pointer transition-all border ${
            isRecording
              ? 'bg-red-500/20 border-red-500/50 animate-pulse'
              : 'bg-lime-glow/10 border-lime-glow/30 hover:bg-lime-glow/20'
          } relative group`}
        >
          <Mic className={`w-10 h-10 ${isRecording ? 'text-red-500' : 'text-lime-glow'}`} />
        </button>
        <div>
          <p className="font-bold text-lg mb-1">
            {isRecording ? 'Aufnahme läuft...' : 'Sprachnotiz aufnehmen'}
          </p>
          <p className="text-xs text-stone-400">
            {isRecording ? '00:05' : '"Wir brauchen mehr Schotter an Gleis 4..."'}
          </p>
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

      {/* Recent Entries */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-stone-400">
            Letzte Einträge
          </h2>
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
          <p className="text-sm">
            "Bagger 3 hat ein Problem mit der Hydraulik, verliert etwas Öl."
          </p>
        </div>
      </div>
    </div>
  );
}
