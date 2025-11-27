-- AlterTable
ALTER TABLE "Flight" ADD COLUMN "stopOverAirports" TEXT;
ALTER TABLE "Flight" ADD COLUMN "stopOverDurationMinutes" INTEGER;

-- CreateTable
CREATE TABLE "Airline" (
    "code" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);
