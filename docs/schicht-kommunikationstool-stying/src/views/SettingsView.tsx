import React, { useState } from 'react';
import { Settings, Shield, Bell, Database, Key, Save, CheckCircle2 } from 'lucide-react';

export default function SettingsView() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto pb-24">
      <header className="mb-8">
        <h1 className="text-3xl font-serif font-bold tracking-tight uppercase">System-Einstellungen</h1>
        <p className="text-sm text-stone-400 mt-1 uppercase tracking-widest">Konfiguration & API-Keys</p>
      </header>

      <div className="space-y-6">
        {/* API Keys Section */}
        <div className="luxury-card p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-lime-glow/20 flex items-center justify-center shrink-0">
              <Key className="w-5 h-5 text-lime-glow" />
            </div>
            <div>
              <h3 className="text-lg font-bold">KI-Modell API-Schlüssel</h3>
              <p className="text-xs text-stone-400">Hinterlegen Sie hier Ihre eigenen API-Keys für die KI-Verarbeitung.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">OpenAI API Key</label>
              <input 
                type="password" 
                placeholder="sk-..." 
                className="w-full bg-night-950 border border-night-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-lime-glow transition-colors"
                defaultValue="sk-proj-1234567890abcdef"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">Anthropic API Key</label>
              <input 
                type="password" 
                placeholder="sk-ant-..." 
                className="w-full bg-night-950 border border-night-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-lime-glow transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">Gemini API Key</label>
              <input 
                type="password" 
                placeholder="AIzaSy..." 
                className="w-full bg-night-950 border border-night-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-lime-glow transition-colors"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <button 
              onClick={handleSave}
              className="px-6 py-2 bg-lime-glow text-night-950 font-bold rounded-lg hover:bg-lime-400 transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Speichern
            </button>
            {saved && (
              <span className="text-lime-glow text-sm flex items-center gap-1 animate-pulse">
                <CheckCircle2 className="w-4 h-4" /> Gespeichert
              </span>
            )}
          </div>
        </div>

        {/* Other Settings */}
        <div className="luxury-card p-6 rounded-xl flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-400/20 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-1">Sicherheit & Zugriff (RBAC)</h3>
            <p className="text-sm text-stone-400 mb-4">Verwalten Sie Rollen, Berechtigungen und Mitarbeiter-Accounts.</p>
            <button className="px-4 py-2 rounded-md border border-night-700 text-sm font-medium hover:bg-night-800 transition-colors">
              Konfigurieren
            </button>
          </div>
        </div>

        <div className="luxury-card p-6 rounded-xl flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-purple-400/20 flex items-center justify-center shrink-0">
            <Database className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-1">Cloudflare R2 Storage</h3>
            <p className="text-sm text-stone-400 mb-4">Verbindung zum Object Storage für Audio, Bilder und Markdown-Files.</p>
            <button className="px-4 py-2 rounded-md border border-night-700 text-sm font-medium hover:bg-night-800 transition-colors">
              Konfigurieren
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
