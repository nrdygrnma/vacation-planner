/** @type {import('jest').Config} */
module.exports = {
  testMatch: ["<rootDir>/tests/api/**/*.test.ts"],
  transform: {
    "^.+\\.(t|j)sx?$": ["ts-jest", { tsconfig: "tsconfig.json" }],
  },
  testEnvironment: "allure-jest/node",
  testEnvironmentOptions: {
    resultsDir: "tests/api/allure-results",
  },
  // No globalSetup/globalTeardown - assumes dev server is already running
  // Start dev server manually: bun run dev
  // Then run tests: bunx jest tests/api/
  testTimeout: 30000,
  verbose: true,
  detectOpenHandles: true,
  forceExit: false,
  silent: false,
  setupFilesAfterEnv: [],
  passWithNoTests: true,
};
