/**
 * Test script to verify SDK build artifacts
 */

import { existsSync } from 'fs';
import { join } from 'path';

// Simple color logger (no dependencies)
const logger = {
  colors: {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
  },

  info: (msg) => {
    console.log(`${logger.colors.blue}ℹ${logger.colors.reset} ${msg}`);
  },

  success: (msg) => {
    console.log(`${logger.colors.green}✓${logger.colors.reset} ${msg}`);
  },

  error: (msg) => {
    console.log(`${logger.colors.red}✗${logger.colors.reset} ${msg}`);
  },

  warn: (msg) => {
    console.log(`${logger.colors.yellow}⚠${logger.colors.reset} ${msg}`);
  },

  title: (msg) => {
    console.log(`\n${logger.colors.bright}${logger.colors.cyan}${msg}${logger.colors.reset}\n`);
  },

  section: (msg) => {
    console.log(`\n${logger.colors.bright}${msg}${logger.colors.reset}`);
  },
};

logger.title('🧪 Testing @fhevm-sdk build artifacts');

const distPath = './dist';

// Check if dist exists
if (!existsSync(distPath)) {
  logger.error('dist/ directory not found!');
  process.exit(1);
}

logger.success('dist/ directory exists');

// Define expected files
const expectedFiles = [
  'index.js',
  'index.d.ts',
  'core/index.js',
  'core/index.d.ts',
  'core/client.js',
  'core/client.d.ts',
  'core/EventEmitter.js',
  'core/EventEmitter.d.ts',
  'core/encryption.js',
  'core/encryption.d.ts',
  'core/decryption.js',
  'core/decryption.d.ts',
  'core/types.js',
  'core/types.d.ts',
  'react/index.js',
  'react/index.d.ts',
  'react/hooks/useFhevm.js',
  'react/hooks/useFhevm.d.ts',
  'react/hooks/useEncrypt.js',
  'react/hooks/useEncrypt.d.ts',
  'react/hooks/useDecrypt.js',
  'react/hooks/useDecrypt.d.ts',
  'storage/index.js',
  'storage/index.d.ts',
  'fhevmTypes.js',
  'fhevmTypes.d.ts',
];

let allFilesExist = true;
let successCount = 0;
let failCount = 0;

for (const file of expectedFiles) {
  const fullPath = join(distPath, file);
  if (existsSync(fullPath)) {
    logger.success(file);
    successCount++;
  } else {
    logger.error(`${file} - MISSING`);
    allFilesExist = false;
    failCount++;
  }
}

logger.section(`\n📊 Results: ${successCount} passed, ${failCount} failed`);

if (allFilesExist) {
  logger.section('\n📦 SDK Build Status: SUCCESS');

  logger.info('\n📚 Ready for use in bundled applications:');
  logger.info('   • Next.js');
  logger.info('   • Vite');
  logger.info('   • Webpack');
  logger.info('   • Create React App');

  logger.info('\n💡 Usage:');
  logger.info('   import { useFhevm, useEncrypt, useDecrypt } from "@fhevm-sdk/react"');
  logger.info('   import { createFhevmClient } from "@fhevm-sdk/core"');

  logger.warn('\n⚠️  Note: Direct Node.js ESM imports require a bundler.');
  logger.warn('   This is by design - the SDK is optimized for web applications.\n');
  process.exit(0);
} else {
  logger.error('\n❌ Some files are missing!\n');
  process.exit(1);
}
