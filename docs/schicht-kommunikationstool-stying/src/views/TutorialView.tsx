import React from 'react';
import { BookOpen, Mic, Camera, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function TutorialView() {
  return (
    <div className="max-w-3xl mx-auto p-4 pb-24 space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl font-serif font-bold mb-1">Hilfe & Guides</h1>
        <p className="text-forest-600 dark:text-stone-400 text-sm">So benutzt du die App richtig</p>
      </header>

      <div className="space-y-6">
        {/* Guide 1: Voice Notes */}
        <div className="luxury-card p-6 rounded-xl border-l-4 border-lime-glow">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-lime-glow/20 flex items-center justify-center">
              <Mic className="w-5 h-5 text-lime-glow" />
            </div>
            <h2 className="text-lg font-bold">Sprachnotizen aufnehmen</h2>
          </div>
          <p className="text-sm text-stone-300 mb-4">
            Drücke auf das große Mikrofon und sprich ganz normal. Du kannst auch Polnisch sprechen, das System übersetzt es automatisch.
          </p>
          <div className="bg-night-900/50 p-4 rounded-lg border border-night-800 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">Was du sagen solltest:</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-lime-glow shrink-0 mt-0.5" />
                <span>Was hast du gerade gemacht? (z.B. "Gleisbett verdichtet")</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-lime-glow shrink-0 mt-0.5" />
                <span>Welches Material hast du verbraucht? (z.B. "2 Tonnen Schotter")</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-lime-glow shrink-0 mt-0.5" />
                <span>Wo machst du weiter?</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Guide 2: Problems */}
        <div className="luxury-card p-6 rounded-xl border-l-4 border-amber-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <h2 className="text-lg font-bold">Probleme melden</h2>
          </div>
          <p className="text-sm text-stone-300 mb-4">
            Wenn etwas schiefgeht oder du nicht weiterarbeiten kannst, melde es sofort. Das ist wichtig für die Abrechnung!
          </p>
          <div className="bg-night-900/50 p-4 rounded-lg border border-night-800 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">Beispiele für Probleme:</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm">
                <span className="text-amber-500 mt-1">•</span>
                <span>Unbekannte Rohre oder Kabel im Boden</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <span className="text-amber-500 mt-1">•</span>
                <span>Maschine ist kaputt oder verliert Öl</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <span className="text-amber-500 mt-1">•</span>
                <span>Material fehlt oder ist falsch geliefert</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Guide 3: Photos */}
        <div className="luxury-card p-6 rounded-xl border-l-4 border-blue-400">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-400/20 flex items-center justify-center">
              <Camera className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-lg font-bold">Fotos machen</h2>
          </div>
          <p className="text-sm text-stone-300">
            Mache immer ein Foto, wenn du ein Problem meldest (z.B. das Rohr im Boden) oder wenn du einen großen Abschnitt fertiggestellt hast. Das hilft dem Schichtleiter, die Situation besser einzuschätzen.
          </p>
        </div>

      </div>
    </div>
  );
}
