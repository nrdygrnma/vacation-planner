-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_JournalEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tripId" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "date" DATETIME,
    "locationName" TEXT,
    "lat" REAL,
    "lng" REAL,
    "coverImageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "JournalEntry_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_JournalEntry" ("content", "contentType", "coverImageUrl", "createdAt", "date", "id", "lat", "lng", "locationName", "title", "tripId", "updatedAt") SELECT "content", "contentType", "coverImageUrl", "createdAt", "date", "id", "lat", "lng", "locationName", "title", "tripId", "updatedAt" FROM "JournalEntry";
DROP TABLE "JournalEntry";
ALTER TABLE "new_JournalEntry" RENAME TO "JournalEntry";
CREATE INDEX "JournalEntry_tripId_date_idx" ON "JournalEntry"("tripId", "date");
CREATE INDEX "JournalEntry_tripId_createdAt_idx" ON "JournalEntry"("tripId", "createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
