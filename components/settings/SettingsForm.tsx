'use client';

import { useState } from 'react';
import { saveLLMSettings } from '@/app/actions/settings';
import type { LLMProvider } from '@/lib/store';

interface SettingsFormProps {
  initial: {
    provider: LLMProvider;
    baseUrl: string;
    model: string;
    hasKey: boolean;
  };
}

interface ResultState {
  ok: boolean;
  message: string;
}

const PROVIDERS: Array<{ value: LLMProvider; label: string }> = [
  { value: 'gemini', label: 'Gemini (eigener VPS)' },
  { value: 'anthropic', label: 'Anthropic (Claude)' },
  { value: 'openai', label: 'OpenAI' },
];

const inputClass =
  'w-full bg-[#0d1117] border border-[#2d333b] rounded-xl px-4 py-3 text-white focus:border-[#00bfff] outline-none transition-colors';
const labelClass = 'text-[#768390] text-sm font-semibold';

export default function SettingsForm({ initial }: SettingsFormProps) {
  const [provider, setProvider] = useState<LLMProvider>(initial.provider);
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState(initial.baseUrl);
  const [model, setModel] = useState(initial.model);

  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<ResultState | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setResult(null);

    try {
      const res = await saveLLMSettings({ provider, apiKey, baseUrl, model });
      if (res.success) {
        setResult({ ok: true, message: 'Einstellungen gespeichert.' });
        // Clear the (write-only) key field after a successful save.
        setApiKey('');
      } else {
        setResult({ ok: false, message: res.error ?? 'Speichern fehlgeschlagen.' });
      }
    } catch {
      setResult({ ok: false, message: 'Unerwarteter Fehler beim Speichern.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#1c2128]/40 backdrop-blur-xl rounded-2xl border border-[#2d333b]/50 p-6 shadow-2xl space-y-6"
    >
      <div className="space-y-2">
        <label htmlFor="provider" className={labelClass}>
          Anbieter
        </label>
        <select
          id="provider"
          value={provider}
          onChange={(e) => setProvider(e.target.value as LLMProvider)}
          className={inputClass}
        >
          {PROVIDERS.map((p) => (
            <option key={p.value} value={p.value} className="bg-[#0d1117] text-white">
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="apiKey" className={labelClass}>
          API-Schlüssel
        </label>
        <input
          id="apiKey"
          type="password"
          autoComplete="off"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={initial.hasKey ? '•••••• (gespeichert)' : 'API-Schlüssel eingeben'}
          className={inputClass}
        />
        <p className="text-xs text-[#768390]">
          {initial.hasKey
            ? 'Leer lassen, um den aktuell gespeicherten Schlüssel zu behalten.'
            : 'Der Schlüssel wird sicher auf dem Server gespeichert und nie an den Browser zurückgesendet.'}
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="baseUrl" className={labelClass}>
          Basis-URL (Endpoint)
        </label>
        <input
          id="baseUrl"
          type="text"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder="https://gemini.deinserver.de/v1beta"
          className={inputClass}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="model" className={labelClass}>
          Modell
        </label>
        <input
          id="model"
          type="text"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="gemini-2.0-flash"
          className={inputClass}
        />
      </div>

      {result && (
        <p
          className={`text-sm font-semibold ${
            result.ok ? 'text-[#00bfff]' : 'text-[#ff0055]'
          }`}
          role="status"
        >
          {result.message}
        </p>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-[#8a2be2] to-[#00bfff] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {saving ? 'Speichert …' : 'Speichern'}
        </button>
      </div>
    </form>
  );
}
