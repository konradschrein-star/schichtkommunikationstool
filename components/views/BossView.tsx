'use client';

import { TrendingUp, DollarSign, Clock, AlertTriangle } from 'lucide-react';

export default function BossView() {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-serif font-bold mb-2">Executive Dashboard</h1>
        <p className="text-forest-600 dark:text-stone-400">
          Projektübersicht • {new Date().toLocaleDateString('de-DE')}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="luxury-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-lime-glow" />
            <p className="text-xs text-stone-400 uppercase">Fortschritt</p>
          </div>
          <p className="text-3xl font-bold">78%</p>
        </div>

        <div className="luxury-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <p className="text-xs text-stone-400 uppercase">Verzögerungen</p>
          </div>
          <p className="text-3xl font-bold">23h</p>
        </div>

        <div className="luxury-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-red-500" />
            <p className="text-xs text-stone-400 uppercase">Mehrkosten</p>
          </div>
          <p className="text-3xl font-bold">€12k</p>
        </div>

        <div className="luxury-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <p className="text-xs text-stone-400 uppercase">Kritische</p>
          </div>
          <p className="text-3xl font-bold">5</p>
        </div>
      </div>

      <div className="luxury-card p-6">
        <h2 className="text-lg font-bold mb-4">KPI Charts</h2>
        <p className="text-stone-400 text-sm">Charts integration folgt...</p>
      </div>
    </div>
  );
}
