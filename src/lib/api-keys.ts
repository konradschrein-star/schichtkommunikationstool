import crypto from 'crypto';
import { db } from '@/db';
import { apiKeys, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// ============================================================================
// ENCRYPTION CONFIGURATION
// ============================================================================

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // For AES, this is always 16
const AUTH_TAG_LENGTH = 16;

/**
 * Gets encryption key from environment
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }

  // Decode base64 key
  return Buffer.from(key, 'base64');
}

// ============================================================================
// ENCRYPTION / DECRYPTION
// ============================================================================

export interface EncryptedData {
  encrypted: string;
  iv: string;
  authTag: string;
}

/**
 * Encrypts API key using AES-256-GCM
 */
export function encryptApiKey(apiKey: string): EncryptedData {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(apiKey, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  const authTag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
  };
}

/**
 * Decrypts API key using AES-256-GCM
 */
export function decryptApiKey(encryptedData: EncryptedData): string {
  const key = getEncryptionKey();
  const iv = Buffer.from(encryptedData.iv, 'base64');
  const authTag = Buffer.from(encryptedData.authTag, 'base64');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedData.encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

export type LLMProvider = 'openai' | 'anthropic' | 'gemini';

/**
 * Stores encrypted API key for a user
 */
export async function storeApiKey(
  userId: string,
  provider: LLMProvider,
  apiKey: string
): Promise<string> {
  // Encrypt the API key
  const { encrypted, iv, authTag } = encryptApiKey(apiKey);

  // Check if key already exists for this user and provider
  const existing = await db
    .select()
    .from(apiKeys)
    .where(and(
      eq(apiKeys.userId, userId),
      eq(apiKeys.provider, provider)
    ))
    .limit(1);

  if (existing.length > 0) {
    // Update existing key
    await db
      .update(apiKeys)
      .set({
        encryptedKey: encrypted,
        iv,
        authTag,
        isActive: true,
      })
      .where(eq(apiKeys.id, existing[0].id));

    return existing[0].id;
  } else {
    // Insert new key
    const [result] = await db
      .insert(apiKeys)
      .values({
        userId,
        provider,
        encryptedKey: encrypted,
        iv,
        authTag,
        isActive: true,
      })
      .returning({ id: apiKeys.id });

    return result.id;
  }
}

/**
 * Retrieves and decrypts API key for a user
 */
export async function getApiKey(
  userId: string,
  provider: LLMProvider
): Promise<string | null> {
  const result = await db
    .select()
    .from(apiKeys)
    .where(and(
      eq(apiKeys.userId, userId),
      eq(apiKeys.provider, provider),
      eq(apiKeys.isActive, true)
    ))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  const key = result[0];

  try {
    return decryptApiKey({
      encrypted: key.encryptedKey,
      iv: key.iv,
      authTag: key.authTag,
    });
  } catch (error) {
    console.error('Failed to decrypt API key:', error);
    return null;
  }
}

/**
 * Gets API key for user by role, with fallback to default
 */
export async function getUserApiKey(
  role: 'BOSS' | 'SHIFT_LEADER' | 'WORKER',
  preferredProvider?: LLMProvider
): Promise<{ decrypted: string; provider: LLMProvider }> {
  // Get boss user (only boss can configure API keys)
  const [bossUser] = await db
    .select()
    .from(users)
    .where(eq(users.role, 'BOSS'))
    .limit(1);

  if (!bossUser) {
    // Fallback to default key from env
    return getDefaultApiKey(preferredProvider);
  }

  // Try to get user's configured key
  const provider = preferredProvider || getDefaultProvider();
  const userKey = await getApiKey(bossUser.id, provider);

  if (userKey) {
    return { decrypted: userKey, provider };
  }

  // Fallback to default key from env
  return getDefaultApiKey(provider);
}

/**
 * Gets default API key from environment variables
 */
function getDefaultApiKey(provider?: LLMProvider): { decrypted: string; provider: LLMProvider } {
  const envProvider = provider || getDefaultProvider();

  let apiKey: string | undefined;

  switch (envProvider) {
    case 'anthropic':
      apiKey = process.env.DEFAULT_LLM_API_KEY || process.env.ANTHROPIC_API_KEY;
      break;
    case 'openai':
      apiKey = process.env.OPENAI_API_KEY;
      break;
    case 'gemini':
      apiKey = process.env.GEMINI_API_KEY;
      break;
  }

  if (!apiKey) {
    throw new Error(`No API key configured for provider: ${envProvider}`);
  }

  return { decrypted: apiKey, provider: envProvider };
}

/**
 * Gets default provider from environment
 */
function getDefaultProvider(): LLMProvider {
  const provider = process.env.DEFAULT_LLM_PROVIDER as LLMProvider;

  if (!provider || !['openai', 'anthropic', 'gemini'].includes(provider)) {
    return 'anthropic'; // Default fallback
  }

  return provider;
}

/**
 * Deactivates an API key
 */
export async function deactivateApiKey(userId: string, provider: LLMProvider): Promise<void> {
  await db
    .update(apiKeys)
    .set({ isActive: false })
    .where(and(
      eq(apiKeys.userId, userId),
      eq(apiKeys.provider, provider)
    ));
}

/**
 * Deletes an API key permanently
 */
export async function deleteApiKey(userId: string, provider: LLMProvider): Promise<void> {
  await db
    .delete(apiKeys)
    .where(and(
      eq(apiKeys.userId, userId),
      eq(apiKeys.provider, provider)
    ));
}

/**
 * Lists all providers configured for a user
 */
export async function listUserProviders(userId: string): Promise<LLMProvider[]> {
  const results = await db
    .select({ provider: apiKeys.provider })
    .from(apiKeys)
    .where(and(
      eq(apiKeys.userId, userId),
      eq(apiKeys.isActive, true)
    ));

  return results.map(r => r.provider as LLMProvider);
}

/**
 * Validates API key format (basic check)
 */
export function validateApiKeyFormat(provider: LLMProvider, apiKey: string): boolean {
  switch (provider) {
    case 'anthropic':
      return apiKey.startsWith('sk-ant-');
    case 'openai':
      return apiKey.startsWith('sk-') || apiKey.startsWith('sk-proj-');
    case 'gemini':
      return apiKey.length > 20; // Gemini keys don't have specific prefix
    default:
      return false;
  }
}
