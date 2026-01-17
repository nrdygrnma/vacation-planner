-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Currency" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "rateToEUR" DECIMAL NOT NULL DEFAULT 1.0
);
INSERT INTO "new_Currency" ("id", "name", "symbol") SELECT "id", "name", "symbol" FROM "Currency";
DROP TABLE "Currency";
ALTER TABLE "new_Currency" RENAME TO "Currency";
CREATE UNIQUE INDEX "Currency_name_key" ON "Currency"("name");
CREATE UNIQUE INDEX "Currency_symbol_key" ON "Currency"("symbol");
CREATE TABLE "new_Trip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "people" INTEGER NOT NULL DEFAULT 1,
    "totalCostEUR" DECIMAL NOT NULL,
    "currencyId" TEXT NOT NULL,
    "selectedFlightId" TEXT,
    "selectedCarRentalId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "imageUrl" TEXT,
    "startLocationName" TEXT,
    "startLat" REAL,
    "startLng" REAL,
    "endLocationName" TEXT,
    "endLat" REAL,
    "endLng" REAL,
    "splitFlightCost" BOOLEAN NOT NULL DEFAULT false,
    "splitCarRentalCost" BOOLEAN NOT NULL DEFAULT true,
    "splitAccommodationCost" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Trip_selectedCarRentalId_fkey" FOREIGN KEY ("selectedCarRentalId") REFERENCES "CarRental" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Trip_selectedFlightId_fkey" FOREIGN KEY ("selectedFlightId") REFERENCES "Flight" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Trip_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Trip" ("createdAt", "currencyId", "endDate", "id", "imageUrl", "people", "selectedCarRentalId", "selectedFlightId", "startDate", "title", "totalCostEUR", "updatedAt") SELECT "createdAt", "currencyId", "endDate", "id", "imageUrl", "people", "selectedCarRentalId", "selectedFlightId", "startDate", "title", "totalCostEUR", "updatedAt" FROM "Trip";
DROP TABLE "Trip";
ALTER TABLE "new_Trip" RENAME TO "Trip";
CREATE UNIQUE INDEX "Trip_selectedFlightId_key" ON "Trip"("selectedFlightId");
CREATE UNIQUE INDEX "Trip_selectedCarRentalId_key" ON "Trip"("selectedCarRentalId");
CREATE INDEX "Trip_startDate_idx" ON "Trip"("startDate");
CREATE INDEX "Trip_endDate_idx" ON "Trip"("endDate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
