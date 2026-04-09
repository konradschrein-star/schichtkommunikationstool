'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, Clock, AlertTriangle, FileText } from 'lucide-react';

interface Report {
  id: string;
  mitarbeiter: string;
  datum: string;
  zeit: string;
  schicht: number;
  summary?: string;
  delay_hours?: number;
  estimated_cost?: number;
  tags: string[];
}

interface Aggregated {
  totalDelays: number;
  totalCost: number;
  reportsCount: number;
}

export default function BossView() {
  const [reports, setReports] = useState<Report[]>([]);
  const [aggregated, setAggregated] = useState<Aggregated | null>(null);
  const [loading, setLoading] = useState(true);
  const [usedFallback, setUsedFallback] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/reports?limit=20');
      const data = await res.json();

      if (data.success) {
        setReports(data.reports);
        setAggregated(data.aggregated);
        setUsedFallback(data.usedFallback || false);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <p className="text-stone-400">Lädt...</p>
      </div>
    );
  }

  const progress = Math.min(100, Math.round((reports.length / 100) * 100));
  const criticalCount = reports.filter(r =>
    r.tags?.some(tag => tag.toLowerCase().includes('kritisch') || tag.toLowerCase().includes('verzögerung'))
  ).length;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-serif font-bold mb-2">Executive Dashboard</h1>
        <div className="flex items-center gap-3">
          <p className="text-forest-600 dark:text-stone-400">
            Projektübersicht • {new Date().toLocaleDateString('de-DE')}
          </p>
          {usedFallback && (
            <span className="micro-label bg-amber-500/10 text-amber-500">Demo-Daten</span>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="luxury-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-lime-glow" />
            <p className="text-xs text-stone-400 uppercase">Berichte</p>
          </div>
          <p className="text-3xl font-bold">{aggregated?.reportsCount || 0}</p>
        </div>

        <div className="luxury-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <p className="text-xs text-stone-400 uppercase">Verzögerungen</p>
          </div>
          <p className="text-3xl font-bold">{aggregated?.totalDelays.toFixed(1) || 0}h</p>
        </div>

        <div className="luxury-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-red-500" />
            <p className="text-xs text-stone-400 uppercase">Mehrkosten</p>
          </div>
          <p className="text-3xl font-bold">€{((aggregated?.totalCost || 0) / 1000).toFixed(1)}k</p>
        </div>

        <div className="luxury-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <p className="text-xs text-stone-400 uppercase">Kritische</p>
          </div>
          <p className="text-3xl font-bold">{criticalCount}</p>
        </div>
      </div>

      <div className="luxury-card p-6">
        <h2 className="text-lg font-bold mb-4">Aktuelle Berichte</h2>
        <div className="space-y-3">
          {reports.slice(0, 5).map(report => (
            <div key={report.id} className="p-4 rounded-lg bg-forest-50 dark:bg-night-800 border border-forest-100 dark:border-night-700">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-bold text-sm">{report.mitarbeiter}</p>
                  <p className="text-xs text-stone-400">
                    {report.datum} • {report.zeit} • Schicht {report.schicht}
                  </p>
                </div>
                <div className="flex gap-2">
                  {report.delay_hours && report.delay_hours > 0 && (
                    <span className="micro-label bg-amber-500/10 text-amber-500">
                      {report.delay_hours}h
                    </span>
                  )}
                  {report.estimated_cost && report.estimated_cost > 0 && (
                    <span className="micro-label bg-red-500/10 text-red-500">
                      €{report.estimated_cost}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-stone-600 dark:text-stone-300">
                {report.summary || 'Kein Summary verfügbar'}
              </p>
              {report.tags && report.tags.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {report.tags.map((tag, idx) => (
                    <span key={idx} className="micro-label bg-lime-glow/10 text-lime-glow">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
