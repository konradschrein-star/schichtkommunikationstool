'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Moon, Sun, LogOut, Activity, Users, BarChart3, DollarSign, Database, Lightbulb, Settings, BookOpen } from 'lucide-react';
import { useTheme } from 'next-themes';

type Role = 'worker' | 'leader' | 'boss';

interface RoleLayoutProps {
  children: ReactNode;
  role: Role;
  currentView?: string;
}

export function RoleLayout({ children, role, currentView = 'dashboard' }: RoleLayoutProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('role');
    }
    router.push('/login');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Role switcher for demo
  const switchRole = (newRole: Role) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('role', newRole);
    }
    const routes: Record<Role, string> = {
      worker: '/worker',
      leader: '/leader',
      boss: '/boss'
    };
    router.push(routes[newRole]);
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans transition-colors duration-500 bg-cream dark:bg-night-950 text-forest-950 dark:text-stone-100">

      {/* Sidebar - Only for leader and boss */}
      {role !== 'worker' && (
        <aside className="w-64 border-r border-forest-100 dark:border-night-800 bg-white dark:bg-night-900 flex flex-col z-20">
          <div className="p-6">
            <h2 className="text-2xl font-serif font-bold text-forest-900 dark:text-lime-glow uppercase tracking-widest">
              Gleisbau_Core
            </h2>
            <p className="text-[10px] text-forest-500 dark:text-stone-500 mt-1 uppercase tracking-widest">
              System V.2.4.9
            </p>
          </div>

          <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
            <Link
              href={`/${role}`}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-forest-100 dark:bg-night-800 text-forest-900 dark:text-lime-glow font-medium border-l-4 border-lime-glow'
                  : 'text-forest-600 dark:text-stone-400 hover:bg-forest-50 dark:hover:bg-night-800/50 border-l-4 border-transparent'
              }`}
            >
              <Activity className="w-5 h-5" />
              Overview
            </Link>

            <Link
              href="/team"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentView === 'team'
                  ? 'bg-forest-100 dark:bg-night-800 text-forest-900 dark:text-lime-glow font-medium border-l-4 border-lime-glow'
                  : 'text-forest-600 dark:text-stone-400 hover:bg-forest-50 dark:hover:bg-night-800/50 border-l-4 border-transparent'
              }`}
            >
              <Users className="w-5 h-5" />
              Team-Übersicht
            </Link>

            {role === 'boss' && (
              <Link
                href="/boss/financial"
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === 'financial'
                    ? 'bg-forest-100 dark:bg-night-800 text-forest-900 dark:text-lime-glow font-medium border-l-4 border-lime-glow'
                    : 'text-forest-600 dark:text-stone-400 hover:bg-forest-50 dark:hover:bg-night-800/50 border-l-4 border-transparent'
                }`}
              >
                <DollarSign className="w-5 h-5" />
                Finanz-Impact
              </Link>
            )}

            <Link
              href="/archive"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentView === 'archive'
                  ? 'bg-forest-100 dark:bg-night-800 text-forest-900 dark:text-lime-glow font-medium border-l-4 border-lime-glow'
                  : 'text-forest-600 dark:text-stone-400 hover:bg-forest-50 dark:hover:bg-night-800/50 border-l-4 border-transparent'
              }`}
            >
              <Database className="w-5 h-5" />
              Datenbank
            </Link>

            {role === 'boss' && (
              <Link
                href="/ideas"
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentView === 'ideas'
                    ? 'bg-forest-100 dark:bg-night-800 text-forest-900 dark:text-lime-glow font-medium border-l-4 border-lime-glow'
                    : 'text-forest-600 dark:text-stone-400 hover:bg-forest-50 dark:hover:bg-night-800/50 border-l-4 border-transparent'
                }`}
              >
                <Lightbulb className="w-5 h-5" />
                Ideen & Vision
              </Link>
            )}

            <Link
              href="/settings"
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentView === 'settings'
                  ? 'bg-forest-100 dark:bg-night-800 text-forest-900 dark:text-lime-glow font-medium border-l-4 border-lime-glow'
                  : 'text-forest-600 dark:text-stone-400 hover:bg-forest-50 dark:hover:bg-night-800/50 border-l-4 border-transparent'
              }`}
            >
              <Settings className="w-5 h-5" />
              Einstellungen
            </Link>
          </nav>

          <div className="p-4 border-t border-forest-100 dark:border-night-800">
            <button
              onClick={handleLogout}
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
            {role === 'worker' && (
              <h2 className="text-xl font-serif font-bold text-forest-900 dark:text-lime-glow uppercase tracking-widest">
                Gleisbau_Core
              </h2>
            )}

            {/* Role Switcher (Demo) */}
            <div className="flex bg-forest-100 dark:bg-night-800 p-1 rounded-lg">
              {(['worker', 'leader', 'boss'] as Role[]).map(r => (
                <button
                  key={r}
                  onClick={() => switchRole(r)}
                  className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-all ${
                    role === r
                      ? 'bg-white dark:bg-night-700 shadow-sm text-forest-900 dark:text-lime-glow'
                      : 'text-forest-500 dark:text-stone-400'
                  }`}
                >
                  {r === 'worker' ? 'Arbeiter' : r === 'leader' ? 'Schichtleiter' : 'Executive'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {role === 'worker' && (
              <>
                <Link
                  href="/tutorial"
                  className="text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors text-stone-400 hover:text-stone-200"
                >
                  <BookOpen className="w-4 h-4" /> Hilfe
                </Link>
                <div className="w-px h-4 bg-night-800"></div>
                <button
                  onClick={handleLogout}
                  className="text-xs font-bold text-stone-400 hover:text-stone-200 uppercase tracking-wider flex items-center gap-1"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            )}
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-forest-50 dark:bg-night-800 text-forest-600 dark:text-stone-400 hover:text-forest-900 dark:hover:text-lime-glow transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto relative">
          {children}
        </div>
      </main>
    </div>
  );
}
