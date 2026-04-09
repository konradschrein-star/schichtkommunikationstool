// ============================================================================
// LLM CLIENT FACTORIES
// ============================================================================

import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

export type LLMProvider = 'anthropic' | 'openai' | 'gemini';

// ============================================================================
// ANTHROPIC CLIENT
// ============================================================================

export function createAnthropicClient(apiKey: string): Anthropic {
  return new Anthropic({
    apiKey,
  });
}

export async function callAnthropicAgent(
  client: Anthropic,
  systemPrompt: string,
  model: string = 'claude-sonnet-4-20250514'
): Promise<string> {
  const response = await client.messages.create({
    model,
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: systemPrompt,
      },
    ],
  });

  const textContent = response.content.find((block) => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in Anthropic response');
  }

  return textContent.text;
}

// ============================================================================
// OPENAI CLIENT
// ============================================================================

export function createOpenAIClient(apiKey: string): OpenAI {
  return new OpenAI({
    apiKey,
  });
}

export async function callOpenAIAgent(
  client: OpenAI,
  systemPrompt: string,
  model: string = 'gpt-4o'
): Promise<string> {
  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: 'user',
        content: systemPrompt,
      },
    ],
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
// GEMINI CLIENT
// ============================================================================

export function createGeminiClient(apiKey: string): GoogleGenerativeAI {
  return new GoogleGenerativeAI(apiKey);
}

export async function callGeminiAgent(
  client: GoogleGenerativeAI,
  systemPrompt: string,
  model: string = 'gemini-2.0-flash-exp'
): Promise<string> {
  const generativeModel = client.getGenerativeModel({ model });

  const result = await generativeModel.generateContent(systemPrompt);
  const response = result.response;
  const text = response.text();

  if (!text) {
    throw new Error('No text in Gemini response');
  }

  return text;
}

// ============================================================================
// UNIFIED CLIENT INTERFACE
// ============================================================================

export interface LLMClient {
  provider: LLMProvider;
  call: (systemPrompt: string) => Promise<string>;
}

/**
 * Creates a unified LLM client for any provider
 */
export function createLLMClient(provider: LLMProvider, apiKey: string): LLMClient {
  switch (provider) {
    case 'anthropic': {
      const client = createAnthropicClient(apiKey);
      return {
        provider: 'anthropic',
        call: (prompt: string) => callAnthropicAgent(client, prompt),
      };
    }

    case 'openai': {
      const client = createOpenAIClient(apiKey);
      return {
        provider: 'openai',
        call: (prompt: string) => callOpenAIAgent(client, prompt),
      };
    }

    case 'gemini': {
      const client = createGeminiClient(apiKey);
      return {
        provider: 'gemini',
        call: (prompt: string) => callGeminiAgent(client, prompt),
      };
    }

    default:
      throw new Error(`Unsupported LLM provider: ${provider}`);
  }
}
