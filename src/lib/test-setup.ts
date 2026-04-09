/**
 * Test Setup & Verification Utilities
 * Run this to verify Phase 1 & 2 implementation
 */

import { saveWorkerReport, readWorkerReport, saveAudioFile } from './filesystem';
import { encryptApiKey, decryptApiKey, storeApiKey, getApiKey } from './api-keys';
import { runQAAgent, runCleanerAgent } from '@/agents';
import { createInitialFrontmatter, type MarkdownFrontmatter } from '@/types/markdown';

// ============================================================================
// FILESYSTEM TESTS
// ============================================================================

export async function testFilesystem() {
  console.log('🧪 Testing Filesystem...');

  const testFrontmatter: MarkdownFrontmatter = {
    id: crypto.randomUUID(),
    workerId: crypto.randomUUID(),
    workerName: 'Piotr Kowalski',
    profession: 'Baggerfahrer',
    shiftId: crypto.randomUUID(),
    date: '2026-04-07',
    timestamp: new Date().toISOString(),
    shiftType: 'NIGHT',
    language: 'de',
    location: 'Sektor B, Achse 7',
    taskType: 'excavation',
    materialUsed: ['DN500 Rohre', 'Kies 20m³'],
    machineHours: 3.5,
    delayMinutes: 120,
    hindrance: true,
    tags: ['abwasserrohr', 'verzögerung'],
  };

  const testContent = {
    rawTranscript: 'Test transkript...',
    translatedText: '',
    cleanedText: 'Sauberer Bericht...',
  };

  try {
    // Test write
    const filePath = await saveWorkerReport(
      testFrontmatter.workerId,
      new Date(),
      testFrontmatter,
      testContent
    );
    console.log('✅ Markdown saved to:', filePath);

    // Test read
    const { frontmatter, content } = await readWorkerReport(filePath);
    console.log('✅ Markdown read successfully');
    console.log('  - Worker:', frontmatter.workerName);
    console.log('  - Location:', frontmatter.location);
    console.log('  - VOB/B Relevant:', frontmatter.hindrance);

    return true;
  } catch (error) {
    console.error('❌ Filesystem test failed:', error);
    return false;
  }
}

// ============================================================================
// ENCRYPTION TESTS
// ============================================================================

export async function testEncryption() {
  console.log('\n🧪 Testing Encryption...');

  const testApiKey = 'sk-ant-test-1234567890abcdef';

  try {
    // Test encrypt
    const encrypted = encryptApiKey(testApiKey);
    console.log('✅ API key encrypted');

    // Test decrypt
    const decrypted = decryptApiKey(encrypted);
    console.log('✅ API key decrypted');

    if (decrypted === testApiKey) {
      console.log('✅ Encryption roundtrip successful');
      return true;
    } else {
      console.error('❌ Decrypted key does not match original');
      return false;
    }
  } catch (error) {
    console.error('❌ Encryption test failed:', error);
    return false;
  }
}

// ============================================================================
// AGENT TESTS (requires valid API key)
// ============================================================================

export async function testAgents(apiKey?: string) {
  console.log('\n🧪 Testing Agents...');

  if (!apiKey) {
    console.log('⚠️  Skipping agent tests (no API key provided)');
    return true;
  }

  const testTranscript = `Ich habe heute im Sektor B gearbeitet.
    Wir mussten ein unbekanntes Abwasserrohr umgraben, das hat uns 2 Stunden gekostet.
    Haben 20 Kubikmeter Kies verwendet und der Bagger lief 3,5 Stunden.`;

  try {
    // Test QA Agent
    console.log('  Testing QA Agent...');
    const qaResult = await runQAAgent(testTranscript, apiKey);
    console.log('✅ QA Agent response:', {
      complete: qaResult.isComplete,
      confidence: qaResult.confidence,
    });

    // Test Cleaner Agent
    console.log('  Testing Cleaner Agent...');
    const cleanerResult = await runCleanerAgent(
      {
        transcript: testTranscript,
        frontmatter: {
          workerId: crypto.randomUUID(),
          workerName: 'Test Worker',
          shiftId: crypto.randomUUID(),
          shiftType: 'DAY',
          language: 'de',
        },
      },
      apiKey
    );
    console.log('✅ Cleaner Agent extracted location:', cleanerResult.structuredData.location);
    console.log('  Task type:', cleanerResult.structuredData.taskType);

    return true;
  } catch (error) {
    console.error('❌ Agent test failed:', error);
    return false;
  }
}

// ============================================================================
// RUN ALL TESTS
// ============================================================================

export async function runAllTests(apiKey?: string) {
  console.log('🚀 Running Phase 1 & 2 Tests\n');
  console.log('='.repeat(50));

  const results = {
    filesystem: await testFilesystem(),
    encryption: await testEncryption(),
    agents: await testAgents(apiKey),
  };

  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Results:');
  console.log('  Filesystem:', results.filesystem ? '✅' : '❌');
  console.log('  Encryption:', results.encryption ? '✅' : '❌');
  console.log('  Agents:', results.agents ? '✅' : '❌');

  const allPassed = Object.values(results).every((r) => r === true);
  console.log('\n' + (allPassed ? '🎉 All tests passed!' : '⚠️  Some tests failed'));

  return allPassed;
}
