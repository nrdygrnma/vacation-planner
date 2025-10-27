-- CreateTable
CREATE TABLE "Currency" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Trip" (
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
    CONSTRAINT "Trip_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Trip_selectedFlightId_fkey" FOREIGN KEY ("selectedFlightId") REFERENCES "Flight" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Trip_selectedCarRentalId_fkey" FOREIGN KEY ("selectedCarRentalId") REFERENCES "CarRental" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Flight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "airline" JSONB NOT NULL,
    "fromAirport" JSONB NOT NULL,
    "toAirport" JSONB NOT NULL,
    "departureDate" DATETIME,
    "arrivalDate" DATETIME,
    "travelClass" TEXT NOT NULL,
    "baseFare" DECIMAL NOT NULL,
    "extras" JSONB,
    "currencyId" TEXT NOT NULL,
    "totalCostEUR" DECIMAL NOT NULL,
    "tripId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Flight_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Flight_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CarRental" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "carType" TEXT NOT NULL,
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
    CONSTRAINT "CarRental_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CarRental_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TripStop" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "lat" REAL,
    "lng" REAL,
    "selectedAccommodationId" TEXT,
    "tripId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TripStop_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TripStop_selectedAccommodationId_fkey" FOREIGN KEY ("selectedAccommodationId") REFERENCES "Accommodation" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Accommodation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "provider" TEXT,
    "roomType" TEXT,
    "nightlyRate" DECIMAL,
    "totalCostEUR" DECIMAL,
    "currencyId" TEXT NOT NULL,
    "tripStopId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Accommodation_tripStopId_fkey" FOREIGN KEY ("tripStopId") REFERENCES "TripStop" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Accommodation_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Trip_selectedFlightId_key" ON "Trip"("selectedFlightId");

-- CreateIndex
CREATE UNIQUE INDEX "Trip_selectedCarRentalId_key" ON "Trip"("selectedCarRentalId");

-- CreateIndex
CREATE UNIQUE INDEX "TripStop_selectedAccommodationId_key" ON "TripStop"("selectedAccommodationId");
