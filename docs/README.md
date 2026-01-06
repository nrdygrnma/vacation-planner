# Vacation Planner Documentation

**Simple, practical documentation for development and testing.**

## 📚 Documentation Files

We keep it simple - just 2 main docs:

1. **[GUIDE.md](./GUIDE.md)** ⭐ - Complete guide (everything you need)
2. **[COMMANDS.md](./COMMANDS.md)** - Command reference

That's it!

---

## 🚀 Quick Start

### Daily Workflow (3 Terminals)

```bash
# Terminal 1: Dev Server
bun run dev

# Terminal 2: Allure Reports  
bun run qa:serve

# Terminal 3: Run Tests
bun run qa:run
```

**View Reports**: http://localhost:5252

---

## 📖 What's in Each Doc

### [GUIDE.md](./GUIDE.md)
- Quick start
- Development workflow
- Testing guide
- Allure reports setup
- Database commands
- Troubleshooting
- Tips & best practices

### [COMMANDS.md](./COMMANDS.md)
- All Bun commands
- Testing commands
- Database commands
- Utility scripts
- Port reference

---

## 🎯 Most Used Commands

```bash
# Development
bun run dev                       # Start dev server (port 3000)

# Testing
bun run qa:run                    # Full QA suite (API + E2E)
bun run qa:serve                  # Allure report server (port 5252)
bunx jest tests/api/              # API tests only

# Database
bun prisma generate               # Generate Prisma client
bun prisma migrate dev            # Run migrations
bun prisma studio                 # Database viewer
```

---

## 🧪 Testing Overview

### Test Files
- **110+ API tests** - Complete CRUD coverage
- **E2E tests** - User flow testing
- **Allure reports** - Unified, auto-refreshing reports

### How It Works
1. Dev server runs on port 3000
2. Tests execute against dev server
3. Results auto-generate in Allure
4. View at http://localhost:5252

---

## 🎓 Learn More

- **Complete Guide**: [GUIDE.md](./GUIDE.md) - Read this first!
- **Commands**: [COMMANDS.md](./COMMANDS.md) - Quick reference
- **Test Utilities**: `../tests/api/helpers/testUtils.ts`

---

## 🆘 Need Help?

### Common Issues

**Dev server not starting?**
```bash
# Check if port is in use
netstat -ano | findstr :3000    # Windows
lsof -i :3000                    # Mac/Linux
```

**Tests not running?**
```bash
# Make sure dev server is running
bun run dev

# Then run tests
bun run qa:run
```

**Database errors?**
```bash
bun prisma generate
bun prisma migrate dev
```

**No Allure reports?**
```bash
# Run tests first
bun run qa:run

# Then start Allure
bun run qa:serve
```

---

## 🎉 That's It!

We keep documentation simple and practical. Everything you need is in:
- **[GUIDE.md](./GUIDE.md)** - Complete guide
- **[COMMANDS.md](./COMMANDS.md)** - Command reference

**Start developing:**
```bash
bun run dev
```

**Start testing:**
```bash
bun run qa:run
bun run qa:serve
```
