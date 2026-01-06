# Command Reference

**Complete command reference for the Vacation Planner project using Bun.**

## 🚀 Quick Commands

```bash
# Start everything
bun run dev          # Dev server (Terminal 1)
bun run qa:serve     # Allure reports (Terminal 2)
bun run qa:run       # Run all tests (Terminal 3)
```

---

## Development

```bash
# Start dev server
bun run dev

# Start dev server on custom port
PORT=3005 bun run dev

# Build for production (rarely needed)
bun run build
bun run preview
```

---

## Testing

### Full QA Suite
```bash
bun run qa:run       # API + E2E tests, generates report
bun run qa:serve     # Start Allure report server
```

### API Tests
```bash
bunx jest tests/api/                    # All API tests
bunx jest tests/api/trips.test.ts       # Specific file
bunx jest tests/api/smoke.test.ts       # Smoke tests only
bunx jest -t "should create"            # Specific test by name
bunx jest tests/api/ --watch            # Watch mode
bunx jest tests/api/ --coverage         # With coverage
bunx jest tests/api/ --verbose          # Verbose output
```

### E2E Tests
```bash
bun run e2e                             # Run E2E tests
bun playwright test --ui                # With UI
bun playwright test --headed            # See browser
bun playwright test --debug             # Debug mode
```

---

## Database

```bash
# Generate Prisma client
bun prisma generate

# Run migrations
bun prisma migrate dev

# Reset database (WARNING: deletes all data!)
bun prisma migrate reset --force

# Check migration status
bun prisma migrate status

# Open database viewer
bun prisma studio

# Seed database
bun prisma db seed
```

---

## Package Management

```bash
# Install dependencies
bun install

# Add a package
bun add <package-name>

# Add dev dependency
bun add -d <package-name>

# Remove package
bun remove <package-name>

# Update dependencies
bun update
```

---

## Utility Scripts

```bash
# Setup everything (first time)
node scripts/setup-api-tests.mjs

# Fix DATABASE_URL path
node scripts/fix-database-url.mjs

# Verify setup
node scripts/verify-test-setup.mjs

# Manual API health check
bun run test:api:manual

# Copy Prisma engines (for production builds)
node scripts/postbuild-prisma.mjs
```

---

## Allure Reports

```bash
# Start persistent server (auto-refresh)
bun run qa:serve

# View at: http://localhost:5252
```

---

## Development Workflow

```bash
# Morning setup (do once)
bun run dev          # Terminal 1
bun run qa:serve     # Terminal 2

# Throughout the day (Terminal 3)
bunx jest tests/api/trips.test.ts      # Run specific tests
bun run qa:run                          # Run full suite
```

---

## Common Tasks

### Reset Everything
```bash
# Stop all servers (Ctrl+C in each terminal)

# Clean and rebuild
rm -rf .nuxt .output node_modules/.cache
bun prisma migrate reset --force
bun prisma generate
bun install
```

### Update Dependencies
```bash
bun update
bun prisma generate
```

### Check for Issues
```bash
# Verify setup
node scripts/verify-test-setup.mjs

# Check if dev server responds
curl http://localhost:3000/api/currencies

# Check database
bun prisma studio
```

---

## Port Reference

- **3000** - Dev server
- **5252** - Allure report server

---

## Most Used Commands

```bash
bun run dev              # Start dev server
bun run qa:run           # Run all tests
bun run qa:serve         # Allure reports
bunx jest tests/api/     # API tests
bun prisma generate      # Prisma client
bun prisma studio        # Database viewer
```
