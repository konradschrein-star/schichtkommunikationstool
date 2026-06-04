// ============================================================================
// LLM CLIENT FACTORIES
//
// One unified interface over Anthropic / OpenAI / Gemini. Every provider
// supports an optional `baseUrl` so we can point at a self-hosted gateway
// (e.g. the VPS Gemini endpoint) and an optional `model` override.
// ============================================================================

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

export type LLMProvider = 'anthropic' | 'openai' | 'gemini';

export interface LLMSettings {
  provider: LLMProvider;
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

const DEFAULT_MODELS: Record<LLMProvider, string> = {
  anthropic: 'claude-sonnet-4-20250514',
  openai: 'gpt-4o',
  gemini: 'gemini-2.0-flash',
};

// ============================================================================
// ANTHROPIC
// ============================================================================

async function callAnthropic(settings: LLMSettings, prompt: string): Promise<string> {
  const client = new Anthropic({
    apiKey: settings.apiKey,
    ...(settings.baseUrl ? { baseURL: settings.baseUrl } : {}),
  });

  const response = await client.messages.create({
    model: settings.model || DEFAULT_MODELS.anthropic,
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const textContent = response.content.find((block) => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in Anthropic response');
  }
  return textContent.text;
}

// ============================================================================
// OPENAI (also covers OpenAI-compatible gateways via baseUrl)
// ============================================================================

async function callOpenAI(settings: LLMSettings, prompt: string): Promise<string> {
  const client = new OpenAI({
    apiKey: settings.apiKey,
    ...(settings.baseUrl ? { baseURL: settings.baseUrl } : {}),
  });

  const response = await client.chat.completions.create({
    model: settings.model || DEFAULT_MODELS.openai,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 4096,
    temperature: 0,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No content in OpenAI response');
  }
  return content;
}

// ============================================================================
// GEMINI (Google-native; baseUrl points at a self-hosted/proxied endpoint)
// ============================================================================

async function callGemini(settings: LLMSettings, prompt: string): Promise<string> {
  const client = new GoogleGenerativeAI(settings.apiKey);
  const generativeModel = client.getGenerativeModel(
    { model: settings.model || DEFAULT_MODELS.gemini },
    settings.baseUrl ? { baseUrl: settings.baseUrl } : undefined
  );

  const result = await generativeModel.generateContent(prompt);
  const text = result.response.text();
  if (!text) {
    throw new Error('No text in Gemini response');
  }
  return text;
}

// ============================================================================
// UNIFIED INTERFACE
// ============================================================================

export interface LLMClient {
  provider: LLMProvider;
  call: (prompt: string) => Promise<string>;
}

export function createLLMClient(settings: LLMSettings): LLMClient {
  switch (settings.provider) {
    case 'anthropic':
      return { provider: 'anthropic', call: (p) => callAnthropic(settings, p) };
    case 'openai':
      return { provider: 'openai', call: (p) => callOpenAI(settings, p) };
    case 'gemini':
      return { provider: 'gemini', call: (p) => callGemini(settings, p) };
    default:
      throw new Error(`Unsupported LLM provider: ${settings.provider}`);
  }
}
