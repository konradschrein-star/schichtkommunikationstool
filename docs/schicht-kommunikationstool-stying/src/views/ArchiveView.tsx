import React from 'react';
import { Database, FileText, Download, Filter, Search, Play } from 'lucide-react';

export default function ArchiveView() {
  const logs = [
    { id: '9a8b7c', date: '2026-04-09', time: '03:15:22', worker: 'Piotr Kowalski', role: 'Baggerfahrer', tags: ['rohr', 'verzögerung', 'tiefbau'], hasAudio: true, hasImage: true },
    { id: '3f2d1a', date: '2026-04-09', time: '01:42:15', worker: 'Hans Krupp', role: 'Maschinenführer', tags: ['wartung', 'bagger3', 'hydraulik'], hasAudio: true, hasImage: false },
    { id: '7e5c9b', date: '2026-04-08', time: '23:30:00', worker: 'Jan Schmidt', role: 'Gleisbauer', tags: ['material', 'schotter', 'eingang'], hasAudio: true, hasImage: true },
    { id: '1b8a4f', date: '2026-04-08', time: '22:15:00', worker: 'Marek Nowak', role: 'Hilfsarbeiter', tags: ['sicherheit', 'einweisung'], hasAudio: false, hasImage: false },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight uppercase">Datenbank & Archiv</h1>
          <p className="text-sm text-stone-400 mt-1 uppercase tracking-widest">Rohdaten • Markdown Files • Medien</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input 
              type="text" 
              placeholder="Tags, Mitarbeiter, ID..." 
              className="pl-9 pr-4 py-2 bg-night-900 border border-night-800 rounded-lg text-sm focus:outline-none focus:border-lime-glow transition-colors w-64"
            />
          </div>
          <button className="px-4 py-2 luxury-card rounded-lg flex items-center gap-2 hover:bg-white/5 transition-colors">
            <Filter className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Filter</span>
          </button>
          <button className="px-4 py-2 bg-lime-glow text-night-950 rounded-lg flex items-center gap-2 hover:bg-lime-400 transition-colors font-bold">
            <Download className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider">Export</span>
          </button>
        </div>
      </header>

      <div className="luxury-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] text-stone-500 uppercase tracking-widest border-b border-night-800 bg-night-900/30">
                <th className="px-6 py-4 font-normal">ID / Datum</th>
                <th className="px-6 py-4 font-normal">Mitarbeiter</th>
                <th className="px-6 py-4 font-normal">Tags</th>
                <th className="px-6 py-4 font-normal">Medien</th>
                <th className="px-6 py-4 font-normal text-right">Aktion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-night-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="w-4 h-4 text-stone-500" />
                      <span className="text-xs font-mono text-stone-400">{log.id}.md</span>
                    </div>
                    <p className="text-sm font-bold">{log.date} <span className="text-stone-500 font-normal">{log.time}</span></p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold">{log.worker}</p>
                    <p className="text-[10px] text-stone-500 uppercase tracking-widest">{log.role}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {log.tags.map(tag => (
                        <span key={tag} className="px-2 py-0.5 rounded bg-night-800 text-[10px] text-stone-400 uppercase tracking-wider border border-night-700">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {log.hasAudio && (
                        <button className="p-1.5 rounded bg-lime-glow/10 text-lime-glow hover:bg-lime-glow/20 transition-colors" title="Play Audio">
                          <Play className="w-3 h-3" />
                        </button>
                      )}
                      {log.hasImage && (
                        <button className="p-1.5 rounded bg-blue-400/10 text-blue-400 hover:bg-blue-400/20 transition-colors" title="View Image">
                          <FileText className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-xs font-bold text-lime-glow hover:text-lime-400 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                      Ansehen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simulated Markdown Preview */}
      <div className="mt-8 luxury-card p-6 rounded-xl border-l-4 border-stone-600 bg-night-900/50">
        <div className="flex items-center justify-between mb-4 border-b border-night-800 pb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4" /> Vorschau: 9a8b7c.md
          </h3>
          <span className="text-xs text-stone-500 font-mono">Cloudflare R2</span>
        </div>
        <pre className="text-xs text-stone-300 font-mono whitespace-pre-wrap">
{`---
id: 9a8b7c
mitarbeiter: Piotr Kowalski
rolle: Baggerfahrer
datum: 2026-04-09
zeit: 03:15:22
schicht: nacht
tags: [rohr, verzoegerung, tiefbau]
audio_url: r2://bucket/audio/9a8b7c.webm
image_urls: [r2://bucket/img/9a8b7c_1.jpg]
---

## Original Transkript (Polnisch)
Tutaj jest gruba rura w drodze, musieliśmy kopać ręcznie przez 2 godziny i zostawić koparkę.

## Übersetzt & Bereinigt (Deutsch)
Bei Grabungsarbeiten stießen wir auf ein undokumentiertes Abwasserrohr. 
Das Problem wurde umgangen, führte jedoch zu 2 Stunden Stillstand des Baggers. Handarbeit war erforderlich.`}
        </pre>
      </div>
    </div>
  );
}
