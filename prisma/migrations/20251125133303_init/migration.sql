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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Flight_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Flight_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Flight" ("airline", "arrivalDate", "baseFare", "createdAt", "currencyId", "departureDate", "extras", "fromAirport", "id", "toAirport", "totalCostEUR", "travelClass", "tripId", "updatedAt") SELECT "airline", "arrivalDate", "baseFare", "createdAt", "currencyId", "departureDate", "extras", "fromAirport", "id", "toAirport", "totalCostEUR", "travelClass", "tripId", "updatedAt" FROM "Flight";
DROP TABLE "Flight";
ALTER TABLE "new_Flight" RENAME TO "Flight";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
