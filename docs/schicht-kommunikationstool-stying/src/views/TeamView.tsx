import React from 'react';
import { User, Search, Filter, ChevronRight, Activity } from 'lucide-react';

export default function TeamView() {
  const team = [
    { id: 1, name: 'Hans Krupp', role: 'Maschinenführer', level: 'Level 4', status: 'Aktiv', efficiency: '98.5%', avatar: 'HK' },
    { id: 2, name: 'Piotr Kowalski', role: 'Baggerfahrer', level: 'Level 3', status: 'Aktiv', efficiency: '92.1%', avatar: 'PK' },
    { id: 3, name: 'Jan Schmidt', role: 'Gleisbauer', level: 'Level 2', status: 'Pause', efficiency: '88.4%', avatar: 'JS' },
    { id: 4, name: 'Marek Nowak', role: 'Hilfsarbeiter', level: 'Level 1', status: 'Aktiv', efficiency: '85.0%', avatar: 'MN' },
    { id: 5, name: 'Klaus Dieter', role: 'Polier', level: 'Level 5', status: 'Offline', efficiency: '95.2%', avatar: 'KD' },
    { id: 6, name: 'Tomasz Wójcik', role: 'Gleisbauer', level: 'Level 2', status: 'Aktiv', efficiency: '89.7%', avatar: 'TW' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight uppercase">Team-Übersicht</h1>
          <p className="text-sm text-stone-400 mt-1 uppercase tracking-widest">Personal & Status • Sektor Nord</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input 
              type="text" 
              placeholder="Mitarbeiter suchen..." 
              className="pl-9 pr-4 py-2 bg-night-900 border border-night-800 rounded-lg text-sm focus:outline-none focus:border-lime-glow transition-colors w-64"
            />
          </div>
          <button className="px-4 py-2 luxury-card rounded-lg flex items-center gap-2 hover:bg-white/5 transition-colors">
            <Filter className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Filter</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.map((member) => (
          <div key={member.id} className="luxury-card p-5 rounded-xl group cursor-pointer hover:border-lime-glow/50 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-night-800 border border-night-700 flex items-center justify-center font-bold text-stone-300 group-hover:text-lime-glow group-hover:border-lime-glow/30 transition-colors">
                  {member.avatar}
                </div>
                <div>
                  <h3 className="font-bold">{member.name}</h3>
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest">{member.role} • {member.level}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-stone-600 group-hover:text-lime-glow transition-colors" />
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="bg-night-900/50 p-2 rounded border border-night-800">
                <p className="text-[10px] text-stone-500 uppercase tracking-widest mb-1">Status</p>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${member.status === 'Aktiv' ? 'bg-lime-glow animate-pulse' : member.status === 'Pause' ? 'bg-amber-500' : 'bg-stone-600'}`}></span>
                  <span className="text-xs font-bold">{member.status}</span>
                </div>
              </div>
              <div className="bg-night-900/50 p-2 rounded border border-night-800">
                <p className="text-[10px] text-stone-500 uppercase tracking-widest mb-1">Effizienz</p>
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-stone-400" />
                  <span className="text-xs font-bold text-stone-300">{member.efficiency}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
