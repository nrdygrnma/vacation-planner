-- CreateTable
CREATE TABLE "TripOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tripId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "people" INTEGER,
    "totalCostEUR" DECIMAL,
    "isPreferred" BOOLEAN NOT NULL DEFAULT false,
    "selectedFlightId" TEXT,
    "selectedCarRentalId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TripOption_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TripOption_selectedFlightId_fkey" FOREIGN KEY ("selectedFlightId") REFERENCES "Flight" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TripOption_selectedCarRentalId_fkey" FOREIGN KEY ("selectedCarRentalId") REFERENCES "CarRental" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "tripOptionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CarRental_carTypeId_fkey" FOREIGN KEY ("carTypeId") REFERENCES "CarType" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CarRental_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CarRental_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CarRental_tripOptionId_fkey" FOREIGN KEY ("tripOptionId") REFERENCES "TripOption" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CarRental" ("baseRate", "carTypeId", "createdAt", "currencyId", "dropoffDate", "dropoffLocation", "fees", "id", "insurancePerDay", "pickupDate", "pickupLocation", "provider", "totalCostEUR", "tripId", "updatedAt") SELECT "baseRate", "carTypeId", "createdAt", "currencyId", "dropoffDate", "dropoffLocation", "fees", "id", "insurancePerDay", "pickupDate", "pickupLocation", "provider", "totalCostEUR", "tripId", "updatedAt" FROM "CarRental";
DROP TABLE "CarRental";
ALTER TABLE "new_CarRental" RENAME TO "CarRental";
CREATE INDEX "CarRental_tripId_idx" ON "CarRental"("tripId");
CREATE INDEX "CarRental_tripOptionId_idx" ON "CarRental"("tripOptionId");
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
    "tripOptionId" TEXT,
    "flightNumber" TEXT,
    "stops" INTEGER DEFAULT 0,
    "bookingUrl" TEXT,
    "notes" TEXT,
    "durationMin" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "stopOverAirports" TEXT,
    "stopOverDurationMinutes" INTEGER,
    CONSTRAINT "Flight_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Flight_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Flight_tripOptionId_fkey" FOREIGN KEY ("tripOptionId") REFERENCES "TripOption" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Flight" ("airline", "arrivalDate", "baseFare", "bookingUrl", "createdAt", "currencyId", "departureDate", "durationMin", "extras", "flightNumber", "fromAirport", "id", "notes", "stopOverAirports", "stopOverDurationMinutes", "stops", "toAirport", "totalCostEUR", "travelClass", "tripId", "updatedAt") SELECT "airline", "arrivalDate", "baseFare", "bookingUrl", "createdAt", "currencyId", "departureDate", "durationMin", "extras", "flightNumber", "fromAirport", "id", "notes", "stopOverAirports", "stopOverDurationMinutes", "stops", "toAirport", "totalCostEUR", "travelClass", "tripId", "updatedAt" FROM "Flight";
DROP TABLE "Flight";
ALTER TABLE "new_Flight" RENAME TO "Flight";
CREATE INDEX "Flight_tripId_idx" ON "Flight"("tripId");
CREATE INDEX "Flight_tripId_departureDate_idx" ON "Flight"("tripId", "departureDate");
CREATE INDEX "Flight_tripId_totalCostEUR_idx" ON "Flight"("tripId", "totalCostEUR");
CREATE INDEX "Flight_tripOptionId_idx" ON "Flight"("tripOptionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "TripOption_selectedFlightId_key" ON "TripOption"("selectedFlightId");

-- CreateIndex
CREATE UNIQUE INDEX "TripOption_selectedCarRentalId_key" ON "TripOption"("selectedCarRentalId");

-- CreateIndex
CREATE INDEX "TripOption_tripId_idx" ON "TripOption"("tripId");

-- CreateIndex
CREATE INDEX "TripOption_isPreferred_idx" ON "TripOption"("isPreferred");
