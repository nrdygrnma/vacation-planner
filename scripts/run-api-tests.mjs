#!/usr/bin/env node

/**
 * API Test Runner Script
 *
 * This script runs the API tests with proper environment setup
 * and suppresses deprecation warnings from Node.js
 * Works with Bun package manager
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Suppress deprecation warnings
process.env.NODE_NO_WARNINGS = '1';
process.env.NODE_OPTIONS = '--no-deprecation';

console.log('🧪 Starting API Tests...\n');

// Build jest arguments from command line
const args = process.argv.slice(2);

// Use bunx to run jest (works with Bun)
const command = process.platform === 'win32' ? 'bunx' : 'bunx';
const jestArgs = ['jest', ...args];

// Run jest with suppressed warnings
const jest = spawn(command, jestArgs, {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  cwd: rootDir,
  env: {
    ...process.env,
    NODE_NO_WARNINGS: '1',
    NODE_OPTIONS: '--no-deprecation',
  },
});

jest.on('error', (error) => {
  console.error('❌ Failed to start Jest:', error);
  console.error('Make sure Jest is installed: bun add -d jest');
  process.exit(1);
});

jest.on('exit', (code) => {
  if (code === 0) {
    console.log('\n✅ All tests passed!');
  } else if (code !== null) {
    console.log(`\n❌ Tests failed with exit code ${code}`);
  }
  process.exit(code || 0);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n⚠️  Test run interrupted');
  jest.kill('SIGINT');
  process.exit(130);
});
