/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Moon, Sun, ClipboardList, BarChart3, Settings, Users, DollarSign, Activity, Lightbulb, LogOut, BookOpen, Database } from 'lucide-react';

import LoginView from './views/LoginView';
import WorkerView from './views/WorkerView';
import ShiftLeaderView from './views/ShiftLeaderView';
import EmployeeKPIsView from './views/EmployeeKPIsView';
import BossView from './views/BossView';
import FinancialImpactView from './views/FinancialImpactView';
import SettingsView from './views/SettingsView';
import IdeasView from './views/IdeasView';
import TeamView from './views/TeamView';
import TutorialView from './views/TutorialView';
import ArchiveView from './views/ArchiveView';

type Role = 'worker' | 'leader' | 'boss' | null;
type View = 'dashboard' | 'kpis' | 'financial' | 'settings' | 'ideas' | 'team' | 'tutorial' | 'archive';

export default function App() {
  const [role, setRole] = useState<Role>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  if (!role) {
    return <LoginView onLogin={(r) => { setRole(r); setCurrentView('dashboard'); }} />;
  }

  const renderView = () => {
    if (currentView === 'settings') return <SettingsView />;
    if (currentView === 'ideas') return <IdeasView />;
    if (currentView === 'team') return <TeamView />;
    if (currentView === 'tutorial') return <TutorialView />;
    if (currentView === 'archive') return <ArchiveView />;
    
    switch (role) {
      case 'worker':
        return <WorkerView />;
      case 'leader':
        if (currentView === 'kpis') return <EmployeeKPIsView />;
        return <ShiftLeaderView />;
      case 'boss':
        if (currentView === 'financial') return <FinancialImpactView />;
        return <BossView />;
      default:
        return null;
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden font-sans transition-colors duration-500 ${isDarkMode ? 'bg-night-950 text-stone-100' : 'bg-cream text-forest-950'}`}>
      
      {/* Sidebar - Only visible for leader and boss */}
      {role !== 'worker' && (
        <aside className="w-64 border-r border-forest-100 dark:border-night-800 bg-white dark:bg-night-900 flex flex-col z-20">
          <div className="p-6">
            <h2 className="text-2xl font-serif font-bold text-forest-900 dark:text-lime-glow uppercase tracking-widest">Gleisbau_Core</h2>
            <p className="text-[10px] text-forest-500 dark:text-stone-500 mt-1 uppercase tracking-widest">System V.2.4.9</p>
          </div>
          
          <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
            <button 
              onClick={() => setCurrentView('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === 'dashboard' ? 'bg-forest-100 dark:bg-night-800 text-forest-900 dark:text-lime-glow font-medium border-l-4 border-lime-glow' : 'text-forest-600 dark:text-stone-400 hover:bg-forest-50 dark:hover:bg-night-800/50 border-l-4 border-transparent'}`}
            >
              <Activity className="w-5 h-5" />
              Overview
            </button>

            <button 
              onClick={() => setCurrentView('team')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === 'team' ? 'bg-forest-100 dark:bg-night-800 text-forest-900 dark:text-lime-glow font-medium border-l-4 border-lime-glow' : 'text-forest-600 dark:text-stone-400 hover:bg-forest-50 dark:hover:bg-night-800/50 border-l-4 border-transparent'}`}
            >
              <Users className="w-5 h-5" />
              Team-Übersicht
            </button>
            
            {role === 'leader' && (
              <button 
                onClick={() => setCurrentView('kpis')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === 'kpis' ? 'bg-forest-100 dark:bg-night-800 text-forest-900 dark:text-lime-glow font-medium border-l-4 border-lime-glow' : 'text-forest-600 dark:text-stone-400 hover:bg-forest-50 dark:hover:bg-night-800/50 border-l-4 border-transparent'}`}
              >
                <BarChart3 className="w-5 h-5" />
                Mitarbeiter-KPIs
              </button>
            )}

            {role === 'boss' && (
              <button 
                onClick={() => setCurrentView('financial')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === 'financial' ? 'bg-forest-100 dark:bg-night-800 text-forest-900 dark:text-lime-glow font-medium border-l-4 border-lime-glow' : 'text-forest-600 dark:text-stone-400 hover:bg-forest-50 dark:hover:bg-night-800/50 border-l-4 border-transparent'}`}
              >
                <DollarSign className="w-5 h-5" />
                Finanz-Impact
              </button>
            )}

            <button 
              onClick={() => setCurrentView('archive')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === 'archive' ? 'bg-forest-100 dark:bg-night-800 text-forest-900 dark:text-lime-glow font-medium border-l-4 border-lime-glow' : 'text-forest-600 dark:text-stone-400 hover:bg-forest-50 dark:hover:bg-night-800/50 border-l-4 border-transparent'}`}
            >
              <Database className="w-5 h-5" />
              Datenbank
            </button>

            {role === 'boss' && (
              <button 
                onClick={() => setCurrentView('ideas')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === 'ideas' ? 'bg-forest-100 dark:bg-night-800 text-forest-900 dark:text-lime-glow font-medium border-l-4 border-lime-glow' : 'text-forest-600 dark:text-stone-400 hover:bg-forest-50 dark:hover:bg-night-800/50 border-l-4 border-transparent'}`}
              >
                <Lightbulb className="w-5 h-5" />
                Ideen & Vision
              </button>
            )}

            <button 
              onClick={() => setCurrentView('settings')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${currentView === 'settings' ? 'bg-forest-100 dark:bg-night-800 text-forest-900 dark:text-lime-glow font-medium border-l-4 border-lime-glow' : 'text-forest-600 dark:text-stone-400 hover:bg-forest-50 dark:hover:bg-night-800/50 border-l-4 border-transparent'}`}
            >
              <Settings className="w-5 h-5" />
              Einstellungen
            </button>
          </nav>

          <div className="p-4 border-t border-forest-100 dark:border-night-800">
            <button 
              onClick={() => setRole(null)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-stone-500 hover:bg-red-500/10 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </aside>
      )}

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Topbar */}
        <header className="h-16 border-b border-forest-100 dark:border-night-800 bg-white/80 dark:bg-night-900/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-4">
            {role === 'worker' && <h2 className="text-xl font-serif font-bold text-forest-900 dark:text-lime-glow uppercase tracking-widest">Gleisbau_Core</h2>}
            
            {/* Role Switcher (For Demo) */}
            <div className="flex bg-forest-100 dark:bg-night-800 p-1 rounded-lg">
              {(['worker', 'leader', 'boss'] as Exclude<Role, null>[]).map(r => (
                <button
                  key={r}
                  onClick={() => { setRole(r); setCurrentView('dashboard'); }}
                  className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-all ${role === r ? 'bg-white dark:bg-night-700 shadow-sm text-forest-900 dark:text-lime-glow' : 'text-forest-500 dark:text-stone-400'}`}
                >
                  {r === 'worker' ? 'Arbeiter' : r === 'leader' ? 'Schichtleiter' : 'Executive'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {role === 'worker' && (
              <>
                <button 
                  onClick={() => setCurrentView('tutorial')}
                  className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors ${currentView === 'tutorial' ? 'text-lime-glow' : 'text-stone-400 hover:text-stone-200'}`}
                >
                  <BookOpen className="w-4 h-4" /> Hilfe
                </button>
                <div className="w-px h-4 bg-night-800"></div>
                <button 
                  onClick={() => setRole(null)}
                  className="text-xs font-bold text-stone-400 hover:text-stone-200 uppercase tracking-wider flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            )}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full bg-forest-50 dark:bg-night-800 text-forest-600 dark:text-stone-400 hover:text-forest-900 dark:hover:text-lime-glow transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${role}-${currentView}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
