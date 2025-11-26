-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Flight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "airline" TEXT NOT NULL,
    "fromAirport" TEXT NOT NULL,
    "toAirport" TEXT NOT NULL,
    "departureDate" DATETIME,
    "arrivalDate" DATETIME,
    "travelClass" TEXT NOT NULL,
    "baseFare" DECIMAL NOT NULL,
    "extras" TEXT,
    "currencyId" TEXT NOT NULL,
    "totalCostEUR" DECIMAL NOT NULL,
    "tripId" TEXT NOT NULL,
    "flightNumber" TEXT,
    "stops" INTEGER DEFAULT 0,
    "bookingUrl" TEXT,
    "notes" TEXT,
    "durationMin" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Flight_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Flight_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Flight" ("airline", "arrivalDate", "baseFare", "createdAt", "currencyId", "departureDate", "extras", "fromAirport", "id", "toAirport", "totalCostEUR", "travelClass", "tripId", "updatedAt") SELECT "airline", "arrivalDate", "baseFare", "createdAt", "currencyId", "departureDate", "extras", "fromAirport", "id", "toAirport", "totalCostEUR", "travelClass", "tripId", "updatedAt" FROM "Flight";
DROP TABLE "Flight";
ALTER TABLE "new_Flight" RENAME TO "Flight";
CREATE INDEX "Flight_tripId_idx" ON "Flight"("tripId");
CREATE INDEX "Flight_tripId_departureDate_idx" ON "Flight"("tripId", "departureDate");
CREATE INDEX "Flight_tripId_totalCostEUR_idx" ON "Flight"("tripId", "totalCostEUR");
CREATE TABLE "new_CarRental" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "carTypeId" TEXT,
    "pickupDate" DATETIME,
    "dropoffDate" DATETIME,
    "pickupLocation" TEXT NOT NULL,
    "dropoffLocation" TEXT NOT NULL,
    "baseRate" DECIMAL NOT NULL,
    "fees" DECIMAL,
    "insurancePerDay" DECIMAL,
    "currencyId" TEXT NOT NULL,
    "totalCostEUR" DECIMAL,
    "tripId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CarRental_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CarRental_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CarRental_carTypeId_fkey" FOREIGN KEY ("carTypeId") REFERENCES "CarType" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CarRental" ("baseRate", "carTypeId", "createdAt", "currencyId", "dropoffDate", "dropoffLocation", "fees", "id", "insurancePerDay", "pickupDate", "pickupLocation", "provider", "totalCostEUR", "tripId", "updatedAt") SELECT "baseRate", "carTypeId", "createdAt", "currencyId", "dropoffDate", "dropoffLocation", "fees", "id", "insurancePerDay", "pickupDate", "pickupLocation", "provider", "totalCostEUR", "tripId", "updatedAt" FROM "CarRental";
DROP TABLE "CarRental";
ALTER TABLE "new_CarRental" RENAME TO "CarRental";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE INDEX "Trip_startDate_idx" ON "Trip"("startDate");

-- CreateIndex
CREATE INDEX "Trip_endDate_idx" ON "Trip"("endDate");
