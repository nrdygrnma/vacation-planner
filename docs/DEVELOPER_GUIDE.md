# Developer Guide - Vacation Planner

Welcome to the Vacation Planner developer guide. This document contains everything you need to know about setting up,
developing, testing, and managing the application.

---

## 🚀 Quick Start

If you're already set up, here's your daily 3-terminal workflow:

```bash
# Terminal 1: Dev Server (leave running)
bun run dev

# Terminal 2: Allure Reports (leave running)  
bun run qa:serve

# Terminal 3: Run Tests / Database Commands
bun run qa:run                    # Full QA suite
bunx jest tests/api/              # API tests only
bun prisma studio                 # Database viewer
```

**View Reports**: http://localhost:5252
**Dev App**: http://localhost:3000

---

## 📚 Table of Contents

1. [Setup & Installation](#setup--installation)
2. [Development Workflow](#development-workflow)
3. [Command Reference](#command-reference)
4. [Testing Guide](#testing-guide)
5. [Database Management](#database-management)
6. [Allure Reports](#allure-reports)
7. [Troubleshooting](#troubleshooting)

---

## Setup & Installation

### Initial Setup (First Time)

```bash
# 1. Install dependencies
bun install

# 2. Setup database
bun prisma generate
bun prisma migrate dev

# 3. Start dev server
bun run dev
```

### Prisma Configuration

If you get "Query Engine not found" errors, regenerate the client:

```bash
bun prisma generate
```

---

## Development Workflow

### Daily Development

1. Start the dev server: `bun run dev`.
2. The server supports Hot Module Replacement (HMR), so changes to `app/` or `server/` will reflect automatically.
3. Keep the **Allure Report server** running (`bun run qa:serve`) to see test results update in real-time after your
   test runs.

### Project Structure

- `app/`: Frontend code (Nuxt 4 components and pages).
- `server/`: Backend API endpoints and Nitro server logic.
- `prisma/`: Database schema, migrations, and seed scripts.
- `tests/`: API (Jest) and E2E (Playwright) test suites.
- `scripts/`: Utility scripts for maintenance and setup.
- `docs/`: Developer documentation.

---

## Command Reference

### Essential Commands

| Task                     | Command                  |
|:-------------------------|:-------------------------|
| **Start Dev Server**     | `bun run dev`            |
| **Install Dependencies** | `bun install`            |
| **Run All Tests**        | `bun run qa:run`         |
| **Start Report Server**  | `bun run qa:serve`       |
| **Database Viewer**      | `bun prisma studio`      |
| **Apply Migrations**     | `bun prisma migrate dev` |

### Testing Commands

- **API Tests (Jest)**:
    - `bunx jest tests/api/` - Run all API tests.
    - `bunx jest tests/api/trips.test.ts` - Run specific file.
    - `bunx jest -t "should create"` - Run test by name.
    - `bunx jest tests/api/ --watch` - Watch mode.
- **E2E Tests (Playwright)**:
    - `bun run e2e` - Run all E2E tests.
    - `bun playwright test --ui` - Open Playwright UI.

---

## Testing Guide

### Test Suites

The project includes over **110 API tests** covering full CRUD operations:

- `tests/api/trips.test.ts`: Trip management logic.
- `tests/api/flights.test.ts`: Flight options and pricing.
- `tests/api/airlines.test.ts`: Airline data.
- `tests/api/currencies.test.ts`: Exchange rate logic.
- `tests/api/smoke.test.ts`: Basic health checks.

### Best Practices

1. **Keep Servers Running**: Start `dev` and `qa:serve` once and leave them running.
2. **Watch Mode**: Use `bunx jest ... --watch` during active development of a feature.
3. **Run Full QA**: Always run `bun run qa:run` before committing changes to ensure no regressions.

---

## Database Management

The application uses **SQLite** for development (stored at `prisma/dev.db`).

### Common Prisma Commands

```bash
bun prisma generate      # Update client after schema changes
bun prisma migrate dev   # Create and apply migrations
bun prisma studio        # Graphical UI for data
bun prisma db seed       # Reset data using seed script
bun prisma migrate reset # WARNING: Deletes all data and resets DB
```

---

## Allure Reports

We use Allure for unified reporting of both API and E2E tests.

1. **Execute**: Run `bun run qa:run`.
2. **Serve**: Start `bun run qa:serve` (if not already running).
3. **View**: Open `http://localhost:5252`.

The server auto-regenerates the report every time new results are detected in `tests/api/allure-results/`.

---

## Troubleshooting

### Port Conflicts

If port **3000** (Dev) or **5252** (Allure) is in use:

- **Windows**: `netstat -ano | findstr :3000` then `taskkill /PID <PID> /F`
- **Mac/Linux**: `lsof -ti:3000 | xargs kill -9`

### Database is Locked

If SQLite throws "Database is locked" or "Table not found":

1. Close Prisma Studio if it's open.
2. Run `bun prisma generate`.
3. If issues persist, try `bun prisma migrate reset --force`.

### Testing Connection Errors

Ensure the dev server (`bun run dev`) is actually running before starting tests. Tests target `http://localhost:3000` by
default.

---

**Happy Planning!** 🎉
