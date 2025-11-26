/*
  Warnings:

  - You are about to drop the column `carType` on the `CarRental` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "CarType" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CarRental_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CarRental_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CarRental_carTypeId_fkey" FOREIGN KEY ("carTypeId") REFERENCES "CarType" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_CarRental" ("baseRate", "createdAt", "currencyId", "dropoffDate", "dropoffLocation", "fees", "id", "insurancePerDay", "pickupDate", "pickupLocation", "provider", "totalCostEUR", "tripId", "updatedAt") SELECT "baseRate", "createdAt", "currencyId", "dropoffDate", "dropoffLocation", "fees", "id", "insurancePerDay", "pickupDate", "pickupLocation", "provider", "totalCostEUR", "tripId", "updatedAt" FROM "CarRental";
DROP TABLE "CarRental";
ALTER TABLE "new_CarRental" RENAME TO "CarRental";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
