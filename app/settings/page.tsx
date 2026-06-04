import AppNav from '@/components/AppNav';
import SettingsForm from '@/components/settings/SettingsForm';
import { getConfig, type LLMProvider } from '@/lib/store';

export const dynamic = 'force-dynamic';

const PROVIDER_LABELS: Record<LLMProvider, string> = {
  gemini: 'Gemini (eigener VPS)',
  anthropic: 'Anthropic (Claude)',
  openai: 'OpenAI',
};

export default async function SettingsPage() {
  const config = await getConfig();

  const provider: LLMProvider = config.llm?.provider ?? 'gemini';
  const baseUrl = config.llm?.baseUrl ?? '';
  const model = config.llm?.model ?? '';
  const hasKey = !!config.llm?.apiKey;

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <AppNav active="settings" />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-[#8a2be2] to-[#00bfff] bg-clip-text text-transparent">
            Einstellungen
          </h1>
          <p className="text-[#768390] text-lg leading-relaxed">
            Hier konfiguriert der Chef die eigene LLM-API – zum Beispiel die Gemini-API
            auf dem VPS. Diese Zugangsdaten werden von allen KI-Agenten (Transkription,
            Bereinigung, Aggregation) verwendet. Der API-Schlüssel wird ausschließlich
            auf dem Server gespeichert und niemals an den Browser zurückgesendet.
          </p>
        </header>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-[#00bfff]">LLM konfigurieren</h2>
          <SettingsForm initial={{ provider, baseUrl, model, hasKey }} />
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4 text-[#8a2be2]">Aktuell aktiv</h2>
          <div className="bg-[#1c2128]/40 backdrop-blur-xl rounded-2xl border border-[#2d333b]/50 p-6 shadow-2xl">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-[#768390] text-sm font-semibold">Anbieter</dt>
                <dd className="text-white mt-1">{PROVIDER_LABELS[provider]}</dd>
              </div>
              <div>
                <dt className="text-[#768390] text-sm font-semibold">Schlüssel hinterlegt</dt>
                <dd className={`mt-1 font-semibold ${hasKey ? 'text-[#00bfff]' : 'text-[#ff0055]'}`}>
                  {hasKey ? 'Ja' : 'Nein'}
                </dd>
              </div>
              <div>
                <dt className="text-[#768390] text-sm font-semibold">Basis-URL</dt>
                <dd className="text-white mt-1 break-all font-mono text-sm">
                  {baseUrl || <span className="text-[#768390]">Standard / aus .env</span>}
                </dd>
              </div>
              <div>
                <dt className="text-[#768390] text-sm font-semibold">Modell</dt>
                <dd className="text-white mt-1 font-mono text-sm">
                  {model || <span className="text-[#768390]">Standard / aus .env</span>}
                </dd>
              </div>
            </dl>
          </div>
        </section>
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Einstellungen | ShiftSync',
  description: 'LLM-Konfiguration (eigene Gemini-API auf dem VPS) für den Chef',
};
