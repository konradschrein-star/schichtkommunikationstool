/**
 * LLM credential resolution for the local/free MVP.
 *
 * No database, no KMS. The boss can set provider/key/baseUrl/model via the
 * Settings page (persisted to the flat-file config), otherwise we fall back to
 * environment variables. The VPS Gemini endpoint is wired here by default.
 */

import { getConfig, type LLMConfig, type LLMProvider } from './store';
import type { LLMSettings } from '@/agents/llm-clients';

export type { LLMProvider } from './store';

function getDefaultProvider(): LLMProvider {
  const provider = process.env.DEFAULT_LLM_PROVIDER as LLMProvider | undefined;
  if (provider && ['openai', 'anthropic', 'gemini'].includes(provider)) {
    return provider;
  }
  return 'gemini';
}

function credentialsFromEnv(provider: LLMProvider): LLMSettings {
  switch (provider) {
    case 'gemini':
      return {
        provider,
        apiKey: process.env.GEMINI_API_KEY || process.env.DEFAULT_LLM_API_KEY || '',
        baseUrl: process.env.GEMINI_BASE_URL || undefined,
        model: process.env.GEMINI_MODEL || undefined,
      };
    case 'anthropic':
      return {
        provider,
        apiKey: process.env.ANTHROPIC_API_KEY || process.env.DEFAULT_LLM_API_KEY || '',
        baseUrl: process.env.ANTHROPIC_BASE_URL || undefined,
        model: process.env.ANTHROPIC_MODEL || undefined,
      };
    case 'openai':
      return {
        provider,
        apiKey: process.env.OPENAI_API_KEY || process.env.DEFAULT_LLM_API_KEY || '',
        baseUrl: process.env.OPENAI_BASE_URL || undefined,
        model: process.env.OPENAI_MODEL || undefined,
      };
  }
}

/**
 * Resolves the LLM settings to use for an agent call.
 * Config (Settings page) takes precedence over environment variables.
 */
export async function getLLMCredentials(): Promise<LLMSettings> {
  const config = await getConfig();

  const configuredKey = config.llm?.apiKey;
  if (config.llm && configuredKey) {
    const llm: LLMConfig = config.llm;
    return {
      provider: llm.provider,
      apiKey: configuredKey,
      baseUrl: llm.baseUrl || undefined,
      model: llm.model || undefined,
    };
  }

  const provider = config.llm?.provider || getDefaultProvider();
  const fromEnv = credentialsFromEnv(provider);

  // Allow config to override baseUrl/model even when the key comes from env.
  if (config.llm) {
    fromEnv.baseUrl = config.llm.baseUrl || fromEnv.baseUrl;
    fromEnv.model = config.llm.model || fromEnv.model;
  }

  if (!fromEnv.apiKey) {
    throw new Error(
      `Kein LLM-API-Schlüssel konfiguriert (Provider: ${provider}). Bitte in den Einstellungen hinterlegen oder in .env.local setzen.`
    );
  }

  return fromEnv;
}

/**
 * Basic format validation for API keys (used by the Settings page).
 */
export function validateApiKeyFormat(provider: LLMProvider, apiKey: string): boolean {
  switch (provider) {
    case 'anthropic':
      return apiKey.startsWith('sk-ant-');
    case 'openai':
      return apiKey.startsWith('sk-');
    case 'gemini':
      return apiKey.length > 10;
    default:
      return false;
  }
}
