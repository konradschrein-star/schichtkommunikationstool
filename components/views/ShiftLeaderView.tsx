'use client';

import { Users, Clock, AlertCircle } from 'lucide-react';

export default function ShiftLeaderView() {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-serif font-bold mb-2">Schichtleiter Dashboard</h1>
        <p className="text-forest-600 dark:text-stone-400">
          Schicht 2 • {new Date().toLocaleDateString('de-DE')}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="luxury-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-lime-glow/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-lime-glow" />
            </div>
            <div>
              <p className="text-2xl font-bold">7</p>
              <p className="text-xs text-stone-400 uppercase">Arbeiter Aktiv</p>
            </div>
          </div>
        </div>

        <div className="luxury-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">5.5h</p>
              <p className="text-xs text-stone-400 uppercase">Verzögerungen</p>
            </div>
          </div>
        </div>

        <div className="luxury-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">3</p>
              <p className="text-xs text-stone-400 uppercase">Probleme</p>
            </div>
          </div>
        </div>
      </div>

      <div className="luxury-card p-6">
        <h2 className="text-lg font-bold mb-4">Berichte (heute)</h2>
        <p className="text-stone-400 text-sm">API Integration folgt...</p>
      </div>
    </div>
  );
}
