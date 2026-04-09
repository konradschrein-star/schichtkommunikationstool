import React from 'react';
import { Lightbulb, BrainCircuit, Eye, BookOpen, ShieldCheck, Wrench, ShoppingCart, CalendarClock, Radio } from 'lucide-react';

export default function IdeasView() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-24">
      <header className="mb-8">
        <h1 className="text-3xl font-serif font-bold tracking-tight uppercase text-lime-glow">Zukunftsvision & Expansion</h1>
        <p className="text-sm text-stone-400 mt-1 uppercase tracking-widest">Ideen-Board für Phase 2 & 3</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* RAG / Long-term Memory */}
        <div className="luxury-card p-6 rounded-xl border-l-4 border-purple-500 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
              <BrainCircuit className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold">Langzeitgedächtnis (RAG)</h2>
          </div>
          <p className="text-sm text-stone-300 leading-relaxed mb-4 flex-1">
            Vektorisierung aller Markdown-Files und Reports. Der Chef kann das System wie einen allwissenden Projektmanager befragen: 
            <span className="italic text-stone-400 block mt-2">"Wie oft hatten wir 2025 Probleme mit Rohren in Sektor 4?"</span>
            <span className="italic text-stone-400 block">"Welcher Bagger hat die meisten Ausfallzeiten?"</span>
          </p>
          <div className="flex gap-2 mt-auto">
            <span className="px-2 py-1 bg-night-800 rounded text-[10px] text-stone-400 uppercase tracking-wider">Vector DB</span>
            <span className="px-2 py-1 bg-night-800 rounded text-[10px] text-stone-400 uppercase tracking-wider">Semantic Search</span>
          </div>
        </div>

        {/* Computer Vision */}
        <div className="luxury-card p-6 rounded-xl border-l-4 border-blue-500 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold">Computer Vision (QA)</h2>
          </div>
          <p className="text-sm text-stone-300 leading-relaxed mb-4 flex-1">
            Automatische Analyse der von den Arbeitern hochgeladenen Fotos. Die KI erkennt Qualitätsmängel sofort.
            <span className="italic text-stone-400 block mt-2">"Wurde das Kabel tief genug verlegt?"</span>
            <span className="italic text-stone-400 block">"Ist der Schotter gleichmäßig verteilt?"</span>
          </p>
          <div className="flex gap-2 mt-auto">
            <span className="px-2 py-1 bg-night-800 rounded text-[10px] text-stone-400 uppercase tracking-wider">Image Analysis</span>
            <span className="px-2 py-1 bg-night-800 rounded text-[10px] text-stone-400 uppercase tracking-wider">GPT-4V</span>
          </div>
        </div>

        {/* In-App Tutorials */}
        <div className="luxury-card p-6 rounded-xl border-l-4 border-amber-500 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold">In-App Tutorials</h2>
          </div>
          <p className="text-sm text-stone-300 leading-relaxed mb-4 flex-1">
            KI-generierte Guides für neue Mitarbeiter direkt im Tool. Wenn jemand nicht weiß, wie eine Maschine bedient wird oder ein Prozess abläuft, generiert die KI sofort eine bebilderte Schritt-für-Schritt-Anleitung.
          </p>
          <div className="flex gap-2 mt-auto">
            <span className="px-2 py-1 bg-night-800 rounded text-[10px] text-stone-400 uppercase tracking-wider">HR</span>
            <span className="px-2 py-1 bg-night-800 rounded text-[10px] text-stone-400 uppercase tracking-wider">Training</span>
          </div>
        </div>

        {/* DSGVO & Privacy */}
        <div className="luxury-card p-6 rounded-xl border-l-4 border-lime-glow flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-lime-glow/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-lime-glow" />
            </div>
            <h2 className="text-xl font-bold">DSGVO-Konformität</h2>
          </div>
          <p className="text-sm text-stone-300 leading-relaxed mb-4 flex-1">
            Automatisches Anonymisieren von personenbezogenen Daten, bevor sie an externe APIs geschickt werden. Namen und sensible Daten werden durch Platzhalter ersetzt und lokal wieder zusammengeführt.
          </p>
          <div className="flex gap-2 mt-auto">
            <span className="px-2 py-1 bg-night-800 rounded text-[10px] text-stone-400 uppercase tracking-wider">Privacy</span>
            <span className="px-2 py-1 bg-night-800 rounded text-[10px] text-stone-400 uppercase tracking-wider">Compliance</span>
          </div>
        </div>

        {/* Predictive Maintenance */}
        <div className="luxury-card p-6 rounded-xl border-l-4 border-cyan-500 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
              <Wrench className="w-5 h-5 text-cyan-400" />
            </div>
            <h2 className="text-xl font-bold">Predictive Maintenance</h2>
          </div>
          <p className="text-sm text-stone-300 leading-relaxed mb-4 flex-1">
            Die KI analysiert die Sprachberichte der Arbeiter ("Bagger 3 klingt komisch") und kombiniert sie mit Telemetriedaten, um Maschinenausfälle vorherzusagen, bevor sie passieren.
          </p>
          <div className="flex gap-2 mt-auto">
            <span className="px-2 py-1 bg-night-800 rounded text-[10px] text-stone-400 uppercase tracking-wider">IoT</span>
            <span className="px-2 py-1 bg-night-800 rounded text-[10px] text-stone-400 uppercase tracking-wider">Analytics</span>
          </div>
        </div>

        {/* Automated Resource Ordering */}
        <div className="luxury-card p-6 rounded-xl border-l-4 border-orange-500 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
              <ShoppingCart className="w-5 h-5 text-orange-400" />
            </div>
            <h2 className="text-xl font-bold">Auto-Materialbestellung</h2>
          </div>
          <p className="text-sm text-stone-300 leading-relaxed mb-4 flex-1">
            Wenn die KI aus den Sprachlogs erkennt, dass Material (z.B. Schotter) knapp wird, erstellt sie automatisch einen Bestellentwurf im ERP-System (z.B. SAP), den der Polier nur noch abnicken muss.
          </p>
          <div className="flex gap-2 mt-auto">
            <span className="px-2 py-1 bg-night-800 rounded text-[10px] text-stone-400 uppercase tracking-wider">ERP Sync</span>
            <span className="px-2 py-1 bg-night-800 rounded text-[10px] text-stone-400 uppercase tracking-wider">Logistics</span>
          </div>
        </div>

        {/* Dynamic Scheduling */}
        <div className="luxury-card p-6 rounded-xl border-l-4 border-indigo-500 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center shrink-0">
              <CalendarClock className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold">Dynamische Schichtplanung</h2>
          </div>
          <p className="text-sm text-stone-300 leading-relaxed mb-4 flex-1">
            KI-gestützte Anpassung der Schichtpläne in Echtzeit. Bei Starkregen oder Materialverzögerungen schlägt das System automatisch vor, welche Teams umverteilt werden sollten, um Leerlauf zu vermeiden.
          </p>
          <div className="flex gap-2 mt-auto">
            <span className="px-2 py-1 bg-night-800 rounded text-[10px] text-stone-400 uppercase tracking-wider">Scheduling</span>
            <span className="px-2 py-1 bg-night-800 rounded text-[10px] text-stone-400 uppercase tracking-wider">Weather API</span>
          </div>
        </div>

        {/* Real-time Intercom */}
        <div className="luxury-card p-6 rounded-xl border-l-4 border-pink-500 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5 text-pink-400" />
            </div>
            <h2 className="text-xl font-bold">Echtzeit-Übersetzungs-Funk</h2>
          </div>
          <p className="text-sm text-stone-300 leading-relaxed mb-4 flex-1">
            Ein Walkie-Talkie-Modus in der App. Ein polnischer Arbeiter spricht in seiner Muttersprache, und der deutsche Schichtleiter hört oder liest die Nachricht in Echtzeit auf Deutsch.
          </p>
          <div className="flex gap-2 mt-auto">
            <span className="px-2 py-1 bg-night-800 rounded text-[10px] text-stone-400 uppercase tracking-wider">WebRTC</span>
            <span className="px-2 py-1 bg-night-800 rounded text-[10px] text-stone-400 uppercase tracking-wider">Live Translate</span>
          </div>
        </div>

      </div>
    </div>
  );
}
