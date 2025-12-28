# Vacation Planner - Complete Guide

**Everything you need to know in one place.**

## 🚀 Quick Start

### Daily Workflow (3 Terminals)

```bash
# Terminal 1: Dev Server (leave running)
bun run dev

# Terminal 2: Allure Reports (leave running)  
bun run qa:serve

# Terminal 3: Run Tests
bun run qa:run                    # Full QA suite
bunx jest tests/api/              # API tests only
bunx jest tests/api/trips.test.ts # Specific file
bun run e2e                       # E2E tests
```

**View Reports**: http://localhost:5252

---

## 📚 Table of Contents

1. [Quick Commands](#quick-commands)
2. [Development Workflow](#development-workflow)
3. [Testing](#testing)
4. [Allure Reports](#allure-reports)
5. [Database](#database)
6. [Troubleshooting](#troubleshooting)

---

## Quick Commands

### Essential Commands
```bash
# Development
bun run dev                       # Start dev server (port 3000)
bun install                       # Install dependencies

# Testing
bun run qa:run                    # Full QA suite (API + E2E)
bun run qa:serve                  # Allure report server (port 5252)
bunx jest tests/api/              # API tests only
bun run e2e                       # E2E tests only

# Database
bun prisma generate               # Generate Prisma client
bun prisma migrate dev            # Run migrations
bun prisma studio                 # Database viewer
```

See **docs/COMMANDS.md** for complete command reference.

---

## Development Workflow

### Setup (First Time)

```bash
# 1. Install dependencies
bun install

# 2. Setup database
bun prisma generate
bun prisma migrate dev

# 3. Start dev server
bun run dev
```

### Daily Development

```bash
# Terminal 1: Start dev server (leave running)
bun run dev

# Edit code, server hot-reloads automatically
# That's it!
```

---

## Testing

### Run All Tests

```bash
# Make sure dev server is running first
bun run dev

# Then run full QA suite
bun run qa:run
```

### Run Specific Tests

```bash
# All API tests
bunx jest tests/api/

# Specific file
bunx jest tests/api/trips.test.ts

# Specific test
bunx jest -t "should create a new trip"

# Watch mode (auto-run on save)
bunx jest tests/api/ --watch

# E2E tests
bun run e2e
```

### Test Files

- **tests/api/trips.test.ts** - Trip CRUD tests (35+ tests)
- **tests/api/flights.test.ts** - Flight tests (30+ tests)
- **tests/api/airlines.test.ts** - Airlines tests (15+ tests)
- **tests/api/currencies.test.ts** - Currency tests (10+ tests)
- **tests/api/smoke.test.ts** - Smoke tests (12+ tests)

**Total**: 110+ API tests + E2E tests

---

## Allure Reports

### Start Report Server

```bash
bun run qa:serve
```

- Server starts on **http://localhost:5252**
- Watches for new test results
- Auto-regenerates reports (2-second delay)
- Keep running all day!

### How It Works

1. Run tests: `bun run qa:run`
2. Results saved to: `tests/api/allure-results/`
3. Allure detects new files
4. Report auto-regenerates
5. Refresh browser to see updates

### Report Features

- **Unified Dashboard** - API + E2E tests together
- **Test Hierarchy** - Organized by API/Frontend
- **Historical Trends** - Track performance over time
- **Duration Tracking** - See how long tests take
- **Screenshots** - E2E test screenshots on failure
- **Detailed Logs** - Error messages and stack traces

---

## Database

### Common Commands

```bash
# Generate Prisma client
bun prisma generate

# Run migrations
bun prisma migrate dev

# Reset database (deletes all data!)
bun prisma migrate reset --force

# Check migration status
bun prisma migrate status

# Open database viewer
bun prisma studio
```

### Database Location

Development database: `prisma/dev.db`

### Prisma Issue Fix

If you get "Query Engine not found" errors:

```bash
# 1. Regenerate client
bun prisma generate

# 2. Rebuild (only if needed for production)
bun run build:test

# 3. Copy engines (only if needed for production)
node scripts/postbuild-prisma.mjs
```

---

## Troubleshooting

### Dev Server Issues

**Error**: Port 3000 already in use

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Test Issues

**Error**: Tests fail with connection errors

```bash
# Make sure dev server is running
bun run dev

# Check it's responding
curl http://localhost:3000/api/currencies
```

**Error**: No tests showing in Allure

```bash
# Run tests first
bun run qa:run

# Then start Allure
bun run qa:serve
```

### Database Issues

**Error**: Table not found or database locked

```bash
# Reset and regenerate
bun prisma migrate reset --force
bun prisma generate
```

### Prisma Issues

**Error**: Query engine not found

```bash
# Regenerate Prisma client
bun prisma generate

# If still failing, rebuild
bun run build:test
node scripts/postbuild-prisma.mjs
```

---

## Complete Workflow Example

### Morning Setup
```bash
# Terminal 1
bun run dev
# ✅ Dev server starts on http://localhost:3000

# Terminal 2
bun run qa:serve
# ✅ Allure server starts on http://localhost:5252
```

### Throughout the Day
```bash
# Terminal 3
# Make code changes...

# Run tests
bun run qa:run

# Or specific tests
bunx jest tests/api/trips.test.ts

# View reports
# Open: http://localhost:5252
# Refresh to see updates
```

---

## Tips & Best Practices

### 1. Keep Servers Running
Start dev and Allure servers once in the morning, leave them running all day.

### 2. Use Watch Mode for TDD
```bash
bunx jest tests/api/trips.test.ts --watch
# Edit code → Save → Tests auto-run
```

### 3. Check Reports Regularly
Keep browser tab open to http://localhost:5252 and refresh after test runs.

### 4. Run Full QA Before Commits
```bash
bun run qa:run
# Wait for all tests to pass
# Then commit
```

---

## Key Differences: Dev vs Production

| Feature | Dev Mode (Current) | Production Build |
|---------|-------------------|------------------|
| Startup | Instant | 2-3 minutes |
| Port | 3000 | 3001 |
| Hot Reload | ✅ Yes | ❌ No |
| Build Required | ❌ No | ✅ Yes |
| Feedback Loop | Fast | Slow |

We use **dev mode** for testing - it's faster and simpler!

---

## File Structure

```
vacation-planner/
├── app/                   # Frontend code
├── server/                # API endpoints
├── tests/
│   ├── api/              # API tests (Jest)
│   └── e2e/              # E2E tests (Playwright)
├── prisma/               # Database schema & migrations
├── scripts/              # Utility scripts
├── docs/                 # Documentation (you are here!)
└── .allure/              # Allure reports (auto-generated)
```

---

## Need More Help?

- **Commands Reference**: See `docs/COMMANDS.md`
- **Bun Specific**: All commands use Bun package manager
- **Test Utilities**: Check `tests/api/helpers/testUtils.ts`

---

**That's it! You're ready to develop and test!** 🎉

```bash
bun run dev      # Start developing
bun run qa:run   # Run tests
bun run qa:serve # View reports
```
