# Vacation Planner Application

This is a full-featured Vacation Planner application built with **Nuxt 4**, **Vue 3**, **TypeScript**, **Pinia**, *
*TailwindCSS**, and **Prisma** (SQLite). It allows users to manage trips, flights, car rentals, accommodations, and
stops, with full relational data support.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Documentation](#documentation)
- [Prisma Setup](#prisma-setup)
- [Running the Application](#running-the-application)

---

## Features

- Create and manage **Trips** with multiple **Flights**, **Car Rentals**, and **Trip Stops**
- Assign a **selected Flight** and **selected Car Rental** per trip
- Manage **Trip Stops** with multiple **Accommodations**
- Track **costs in EUR** and associate a **Currency**
- Fully typed using TypeScript with Prisma-generated types
- Drag-and-drop assignment of flights, cars, and accommodations (via Vue components)
- Interactive Map with road routing and clickable markers
- Professional PDF Exports for Trip Summaries, Comparisons, and Route Details

---

## Tech Stack

- **Frontend:** Nuxt 4, Vue 3, Pinia, TailwindCSS, Nuxt UI
- **Maps:** Leaflet, Leaflet Routing Machine (OSRM for routing)
- **PDF Generation:** jsPDF, jspdf-autotable
- **Backend / ORM:** Prisma with SQLite (can switch to PostgreSQL or MySQL)
- **Language:** TypeScript
- **Validation:** zod
- **State Management:** Pinia
- **Testing:** Jest (API), Playwright (E2E)

---

## Documentation

- **[End-User Documentation](http://localhost:3000/docs)** - Accessible within the app when running.
- **[Developer Guide](./docs/DEVELOPER_GUIDE.md)** - Setup, testing, and technical reference.

---

## Prisma Setup

```bash
# Create SQLite database & initial migration
bunx prisma migrate dev --name init

# Open Prisma Studio
bunx prisma studio
```

---

## Running the Application

```bash
# Development mode
bun dev

# Production build
bun build
bun start
```

---
