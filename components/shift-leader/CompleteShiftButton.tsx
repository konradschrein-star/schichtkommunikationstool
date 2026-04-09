'use client';

import { useState } from 'react';
import { completeShift } from '@/app/actions/shift-aggregation';

interface CompleteShiftButtonProps {
  shiftId: string;
  projectName: string;
}

export default function CompleteShiftButton({ shiftId, projectName }: CompleteShiftButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompleteShift = async () => {
    if (!confirm(`Schicht "${projectName}" wirklich beenden?\n\nDies startet die KI-Analyse aller Worker-Reports.`)) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const result = await completeShift({ shiftId });

      if (result.success) {
        window.location.reload();
      } else {
        setError(result.error);
        setIsProcessing(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-12 max-w-md mx-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold mb-3 text-black">KI analysiert Schicht...</h2>
          <p className="text-gray-600 mb-2">Bitte warten, dies kann 30-60 Sekunden dauern.</p>
          <div className="text-sm text-gray-500 space-y-1 mt-4 text-left bg-gray-50 p-4 rounded-lg">
            <div>✓ Worker-Reports sammeln</div>
            <div className="animate-pulse">→ Shift-Aggregation läuft...</div>
            <div className="text-gray-400">○ Boss-KPIs extrahieren</div>
            <div className="text-gray-400">○ Markdown speichern</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleCompleteShift}
        className="px-8 py-4 bg-black text-white font-bold text-lg rounded-xl hover:bg-gray-800 active:scale-95 transition-all shadow-lg"
      >
        Aktuelle Schicht beenden
      </button>

      {error && (
        <div className="fixed bottom-8 right-8 bg-red-500 text-white px-6 py-4 rounded-xl shadow-2xl max-w-md">
          <div className="font-bold mb-1">Fehler beim Beenden</div>
          <div className="text-sm">{error}</div>
          <button
            onClick={() => setError(null)}
            className="mt-3 text-xs underline hover:no-underline"
          >
            Schließen
          </button>
        </div>
      )}
    </>
  );
}
