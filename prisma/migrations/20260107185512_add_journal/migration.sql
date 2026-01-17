/*
  Warnings:

  - You are about to drop the column `roomType` on the `Accommodation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `CarType` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CarRental" ADD COLUMN "imageUrl" TEXT;
ALTER TABLE "CarRental" ADD COLUMN "notes" TEXT;
ALTER TABLE "CarRental" ADD COLUMN "url" TEXT;

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tripId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "JournalEntry_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JournalPhoto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "journalEntryId" TEXT NOT NULL,
    CONSTRAINT "JournalPhoto_journalEntryId_fkey" FOREIGN KEY ("journalEntryId") REFERENCES "JournalEntry" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ComparisonSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tripId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "flightId" TEXT,
    "carRentalId" TEXT,
    "stopSelections" TEXT NOT NULL,
    "totalCostEUR" DECIMAL NOT NULL,
    "reasoning" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ComparisonSnapshot_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RoomType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "AccommodationImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "accommodationId" TEXT NOT NULL,
    CONSTRAINT "AccommodationImage_accommodationId_fkey" FOREIGN KEY ("accommodationId") REFERENCES "Accommodation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Accommodation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "provider" TEXT,
    "roomTypeId" TEXT,
    "nightlyRate" DECIMAL,
    "totalPrice" DECIMAL,
    "totalCostEUR" DECIMAL,
    "currencyId" TEXT NOT NULL,
    "tripStopId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "notes" TEXT,
    "url" TEXT,
    CONSTRAINT "Accommodation_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Accommodation_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Accommodation_tripStopId_fkey" FOREIGN KEY ("tripStopId") REFERENCES "TripStop" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Accommodation" ("createdAt", "currencyId", "id", "name", "nightlyRate", "provider", "totalCostEUR", "tripStopId", "updatedAt") SELECT "createdAt", "currencyId", "id", "name", "nightlyRate", "provider", "totalCostEUR", "tripStopId", "updatedAt" FROM "Accommodation";
DROP TABLE "Accommodation";
ALTER TABLE "new_Accommodation" RENAME TO "Accommodation";
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
    "airlineLogoUrl" TEXT,
    "notes" TEXT,
    "durationMin" INTEGER,
    "outboundDurationMin" INTEGER,
    "outboundStopoverMin" INTEGER,
    "returnDurationMin" INTEGER,
    "returnStopoverMin" INTEGER,
    "isRoundTrip" BOOLEAN NOT NULL DEFAULT false,
    "returnDepartureDate" DATETIME,
    "returnArrivalDate" DATETIME,
    "outboundNetDurationMin" INTEGER,
    "returnNetDurationMin" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "stopOverAirports" TEXT,
    "stopOverDurationMinutes" INTEGER,
    "segments" TEXT,
    CONSTRAINT "Flight_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Flight_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Flight" ("airline", "arrivalDate", "baseFare", "bookingUrl", "createdAt", "currencyId", "departureDate", "durationMin", "extras", "flightNumber", "fromAirport", "id", "notes", "stopOverAirports", "stopOverDurationMinutes", "stops", "toAirport", "totalCostEUR", "travelClass", "tripId", "updatedAt") SELECT "airline", "arrivalDate", "baseFare", "bookingUrl", "createdAt", "currencyId", "departureDate", "durationMin", "extras", "flightNumber", "fromAirport", "id", "notes", "stopOverAirports", "stopOverDurationMinutes", "stops", "toAirport", "totalCostEUR", "travelClass", "tripId", "updatedAt" FROM "Flight";
DROP TABLE "Flight";
ALTER TABLE "new_Flight" RENAME TO "Flight";
CREATE INDEX "Flight_tripId_idx" ON "Flight"("tripId");
CREATE INDEX "Flight_tripId_departureDate_idx" ON "Flight"("tripId", "departureDate");
CREATE INDEX "Flight_tripId_totalCostEUR_idx" ON "Flight"("tripId", "totalCostEUR");
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
CREATE TABLE "new_TripStop" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "lat" REAL,
    "lng" REAL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "type" TEXT NOT NULL DEFAULT 'STOP',
    "selectedAccommodationId" TEXT,
    "tripId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TripStop_selectedAccommodationId_fkey" FOREIGN KEY ("selectedAccommodationId") REFERENCES "Accommodation" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "TripStop_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TripStop" ("createdAt", "endDate", "id", "lat", "lng", "name", "selectedAccommodationId", "startDate", "tripId", "updatedAt") SELECT "createdAt", "endDate", "id", "lat", "lng", "name", "selectedAccommodationId", "startDate", "tripId", "updatedAt" FROM "TripStop";
DROP TABLE "TripStop";
ALTER TABLE "new_TripStop" RENAME TO "TripStop";
CREATE UNIQUE INDEX "TripStop_selectedAccommodationId_key" ON "TripStop"("selectedAccommodationId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "RoomType_name_key" ON "RoomType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CarType_name_key" ON "CarType"("name");
