import React from 'react';
import { Fingerprint, User, Shield, Briefcase, Users } from 'lucide-react';

interface LoginViewProps {
  onLogin: (role: 'worker' | 'leader' | 'boss') => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-night-950 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-lime-glow/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md z-10 space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-serif font-bold text-lime-glow uppercase tracking-widest mb-2">Kinetic Intel</h1>
          <p className="text-stone-400 text-sm uppercase tracking-widest">Gleisbau Core System</p>
        </div>

        <div className="space-y-4 mt-12">
          {/* Worker Login */}
          <button 
            onClick={() => onLogin('worker')}
            className="w-full luxury-card p-6 rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-lime-glow/50 group transition-all"
          >
            <div className="w-16 h-16 rounded-full bg-lime-glow/10 flex items-center justify-center group-hover:bg-lime-glow/20 transition-colors">
              <Fingerprint className="w-8 h-8 text-lime-glow" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold">Arbeiter Login</h2>
              <p className="text-xs text-stone-400 mt-1">Face ID / Fingerabdruck</p>
            </div>
          </button>

          <div className="grid grid-cols-2 gap-4">
            {/* Shift Leader Login */}
            <button 
              onClick={() => onLogin('leader')}
              className="w-full luxury-card p-4 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-blue-400/50 group transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-blue-400/10 flex items-center justify-center group-hover:bg-blue-400/20 transition-colors">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-center">
                <h2 className="text-sm font-bold">Schichtleiter</h2>
                <p className="text-[10px] text-stone-400 mt-1">Dashboard</p>
              </div>
            </button>

            {/* Boss Login */}
            <button 
              onClick={() => onLogin('boss')}
              className="w-full luxury-card p-4 rounded-xl flex flex-col items-center justify-center gap-3 hover:border-purple-400/50 group transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-purple-400/10 flex items-center justify-center group-hover:bg-purple-400/20 transition-colors">
                <Briefcase className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-center">
                <h2 className="text-sm font-bold">Executive</h2>
                <p className="text-[10px] text-stone-400 mt-1">Command Center</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Need to import Users from lucide-react, I missed it in the import statement.
