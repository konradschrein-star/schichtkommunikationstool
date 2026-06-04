'use server';

import { revalidatePath } from 'next/cache';
import { getConfig, setLLMConfig, type LLMProvider } from '@/lib/store';
import { validateApiKeyFormat } from '@/lib/api-keys';

/**
 * Persists the boss-configured LLM settings (the VPS Gemini endpoint by default).
 *
 * Security note: the stored API key is never sent to the client. When the boss
 * leaves the key field blank we KEEP the already-stored key — so a blank
 * `apiKey` here means "do not change the key", not "clear the key".
 */
export async function saveLLMSettings(input: {
  provider: LLMProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
}): Promise<{ success: boolean; error?: string }> {
  const provider = input.provider;
  const apiKey = input.apiKey.trim();
  const baseUrl = input.baseUrl.trim();
  const model = input.model.trim();

  // Validate the format only when a new key is actually provided.
  if (apiKey && !validateApiKeyFormat(provider, apiKey)) {
    return {
      success: false,
      error: 'Schlüsselformat ungültig für den gewählten Anbieter.',
    };
  }

  // A blank key means "keep the current one" — reuse the stored value.
  let effectiveKey: string | undefined = apiKey || undefined;
  if (!effectiveKey) {
    const existing = await getConfig();
    effectiveKey = existing.llm?.apiKey || undefined;
  }

  try {
    await setLLMConfig({
      provider,
      apiKey: effectiveKey,
      baseUrl: baseUrl || undefined,
      model: model || undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unbekannter Fehler beim Speichern.';
    return { success: false, error: `Speichern fehlgeschlagen: ${message}` };
  }

  revalidatePath('/settings');
  return { success: true };
}
