#!/usr/bin/env node

/**
 * Test Setup Verification Script
 *
 * This script verifies that everything is properly configured
 * for running API tests with Jest.
 */

import { access, readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const checks = [];
let allPassed = true;

function pass(message) {
  console.log(`✅ ${message}`);
  checks.push({ passed: true, message });
}

function fail(message) {
  console.log(`❌ ${message}`);
  checks.push({ passed: false, message });
  allPassed = false;
}

function info(message) {
  console.log(`ℹ️  ${message}`);
}

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function checkNodeVersion() {
  const version = process.version;
  const major = parseInt(version.slice(1).split('.')[0]);

  if (major >= 18) {
    pass(`Node.js version ${version} (requires 18+)`);
  } else {
    fail(`Node.js version ${version} is too old (requires 18+)`);
  }
}

async function checkPackageJson() {
  const pkgPath = join(rootDir, 'package.json');

  if (await fileExists(pkgPath)) {
    pass('package.json exists');

    try {
      const content = await readFile(pkgPath, 'utf-8');
      const pkg = JSON.parse(content);

      // Check for required dependencies
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };

      if (deps.jest) {
        pass('Jest is installed');
      } else {
        fail('Jest is not installed');
      }

      if (deps['ts-jest']) {
        pass('ts-jest is installed');
      } else {
        fail('ts-jest is not installed');
      }

      if (deps['wait-on']) {
        pass('wait-on is installed');
      } else {
        fail('wait-on is not installed');
      }

      // Check scripts
      if (pkg.scripts?.['test:api']) {
        pass('test:api script exists');
      } else {
        fail('test:api script missing in package.json');
      }

      if (pkg.scripts?.['test:api:manual']) {
        pass('test:api:manual script exists');
      } else {
        fail('test:api:manual script missing in package.json');
      }

    } catch (error) {
      fail('Failed to parse package.json');
    }
  } else {
    fail('package.json not found');
  }
}

async function checkJestConfig() {
  const configPath = join(rootDir, 'jest.config.cjs');

  if (await fileExists(configPath)) {
    pass('jest.config.cjs exists');
  } else {
    fail('jest.config.cjs not found');
  }
}

async function checkTestFiles() {
  const testDir = join(rootDir, 'tests', 'api');

  if (await fileExists(testDir)) {
    pass('tests/api directory exists');

    const testFiles = [
      'trips.test.ts',
      'flights.test.ts',
      'airlines.test.ts',
      'currencies.test.ts',
      'smoke.test.ts',
    ];

    for (const file of testFiles) {
      const filePath = join(testDir, file);
      if (await fileExists(filePath)) {
        pass(`Test file ${file} exists`);
      } else {
        fail(`Test file ${file} not found`);
      }
    }
  } else {
    fail('tests/api directory not found');
  }
}

async function checkGlobalSetup() {
  const setupPath = join(rootDir, 'tests', 'jest', 'globalSetup.ts');

  if (await fileExists(setupPath)) {
    pass('Global setup file exists');
  } else {
    fail('Global setup file not found');
  }

  const teardownPath = join(rootDir, 'tests', 'jest', 'globalTeardown.ts');

  if (await fileExists(teardownPath)) {
    pass('Global teardown file exists');
  } else {
    fail('Global teardown file not found');
  }
}

async function checkTestUtilities() {
  const utilsPath = join(rootDir, 'tests', 'api', 'helpers', 'testUtils.ts');

  if (await fileExists(utilsPath)) {
    pass('Test utilities (testUtils.ts) exist');
  } else {
    fail('Test utilities not found');
  }
}

async function checkDocumentation() {
  const docs = [
    'README.md',
    'GETTING_STARTED.md',
    'TROUBLESHOOTING.md',
    'QUICK_REFERENCE.md',
  ];

  const docsDir = join(rootDir, 'tests', 'api');

  for (const doc of docs) {
    const docPath = join(docsDir, doc);
    if (await fileExists(docPath)) {
      pass(`Documentation ${doc} exists`);
    } else {
      fail(`Documentation ${doc} not found`);
    }
  }
}

async function checkPrisma() {
  const schemaPath = join(rootDir, 'prisma', 'schema.prisma');

  if (await fileExists(schemaPath)) {
    pass('Prisma schema exists');
  } else {
    fail('Prisma schema not found');
  }

  const clientPath = join(rootDir, 'node_modules', '@prisma', 'client');

  if (await fileExists(clientPath)) {
    pass('Prisma client is installed');
  } else {
    fail('Prisma client not installed - run: bun prisma generate');
  }
}

async function checkEnvFile() {
  const envPath = join(rootDir, '.env');

  if (await fileExists(envPath)) {
    pass('.env file exists');

    try {
      const content = await readFile(envPath, 'utf-8');
      if (content.includes('DATABASE_URL')) {
        pass('DATABASE_URL configured in .env');
      } else {
        fail('DATABASE_URL not found in .env');
      }
    } catch {
      fail('Failed to read .env file');
    }
  } else {
    fail('.env file not found');
  }
}

async function checkScripts() {
  const scripts = [
    'run-api-tests.mjs',
    'test-api-manual.mjs',
  ];

  const scriptsDir = join(rootDir, 'scripts');

  for (const script of scripts) {
    const scriptPath = join(scriptsDir, script);
    if (await fileExists(scriptPath)) {
      pass(`Script ${script} exists`);
    } else {
      fail(`Script ${script} not found`);
    }
  }
}

async function main() {
  console.log('🔍 Verifying API Test Setup\n');
  console.log('═'.repeat(50));

  console.log('\n📦 Checking Environment...');
  await checkNodeVersion();

  console.log('\n📄 Checking Configuration Files...');
  await checkPackageJson();
  await checkJestConfig();
  await checkEnvFile();

  console.log('\n🧪 Checking Test Files...');
  await checkTestFiles();
  await checkGlobalSetup();
  await checkTestUtilities();

  console.log('\n📚 Checking Documentation...');
  await checkDocumentation();

  console.log('\n🗄️  Checking Database Setup...');
  await checkPrisma();

  console.log('\n📜 Checking Scripts...');
  await checkScripts();

  console.log('\n' + '═'.repeat(50));

  const passedCount = checks.filter(c => c.passed).length;
  const totalCount = checks.length;

  console.log(`\n📊 Results: ${passedCount}/${totalCount} checks passed`);

  if (allPassed) {
    console.log('\n✅ All checks passed! Your test setup is ready.');
    console.log('\nNext steps:');
    console.log('  1. Run: bun run test:api:manual (check server)');
    console.log('  2. Run: bun run test:api (run all tests)');
  } else {
    console.log('\n❌ Some checks failed. Please address the issues above.');
    console.log('\nCommon fixes:');
    console.log('  - Missing dependencies: npm install');
    console.log('  - Missing Prisma client: bun prisma generate');
    console.log('  - Missing .env: copy .env.example to .env');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('\n❌ Verification failed:', error);
  process.exit(1);
});
