'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { User, HardHat, Briefcase } from 'lucide-react';

type Role = 'worker' | 'leader' | 'boss';

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const handleLogin = (role: Role) => {
    setSelectedRole(role);
    // Store role in localStorage for demo (no real auth)
    if (typeof window !== 'undefined') {
      localStorage.setItem('role', role);
    }

    // Redirect to role-specific dashboard
    const routes: Record<Role, string> = {
      worker: '/worker',
      leader: '/leader',
      boss: '/boss'
    };
    router.push(routes[role]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-950 via-night-950 to-night-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-serif font-bold text-lime-glow mb-3 uppercase tracking-widest">
            Gleisbau_Core
          </h1>
          <p className="text-stone-400 text-sm uppercase tracking-wider">
            System V.2.4.9 • Baudokumentation MVP
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <button
            onClick={() => handleLogin('worker')}
            className="luxury-card p-8 hover:border-lime-glow/50 transition-all group hover:scale-105"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-lime-glow/10 flex items-center justify-center group-hover:bg-lime-glow/20 transition-colors">
              <HardHat className="w-8 h-8 text-lime-glow" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-white">Arbeiter</h2>
            <p className="text-sm text-stone-400">Sprachnotizen, Fotos, Status</p>
          </button>

          <button
            onClick={() => handleLogin('leader')}
            className="luxury-card p-8 hover:border-lime-glow/50 transition-all group hover:scale-105"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-lime-glow/10 flex items-center justify-center group-hover:bg-lime-glow/20 transition-colors">
              <User className="w-8 h-8 text-lime-glow" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-white">Schichtleiter</h2>
            <p className="text-sm text-stone-400">Team-Übersicht, KPIs</p>
          </button>

          <button
            onClick={() => handleLogin('boss')}
            className="luxury-card p-8 hover:border-lime-glow/50 transition-all group hover:scale-105"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-lime-glow/10 flex items-center justify-center group-hover:bg-lime-glow/20 transition-colors">
              <Briefcase className="w-8 h-8 text-lime-glow" />
            </div>
            <h2 className="text-xl font-bold mb-2 text-white">Executive</h2>
            <p className="text-sm text-stone-400">Analytics, Finanz-Impact</p>
          </button>
        </div>

        <p className="text-center text-stone-500 text-xs mt-8 uppercase tracking-wider">
          Demo-Modus • Keine Authentifizierung erforderlich
        </p>
      </div>
    </div>
  );
}
