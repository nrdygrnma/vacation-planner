import { PrismaClient } from "@prisma/client";
import { Currency } from "../app/types/tripTypes";

const prisma = new PrismaClient();

const currencies: Currency[] = [
  { name: "Euro (EUR)", symbol: "€" },
  { name: "US Dollar (USD)", symbol: "$" },
  { name: "British Pound (GBP)", symbol: "£" },
  { name: "Costa Rican Colón (CRC)", symbol: "₡" },
];

const carTypes = [
  { id: "1", name: "Sedan" },
  { id: "2", name: "SUV" },
  { id: "3", name: "Coupe" },
  { id: "4", name: "Hatchback" },
  { id: "5", name: "Pickup" },
  { id: "6", name: "Van" },
  { id: "7", name: "Minivan" },
  { id: "8", name: "Truck" },
  { id: "9", name: "Bus" },
  { id: "10", name: "Other" },
];

const roomTypes = [
  { name: "House" },
  { name: "Cabin" },
  { name: "Apartment" },
  { name: "Room" },
  { name: "Hotel" },
  { name: "Villa" },
  { name: "Resort" },
  { name: "Hostel" },
  { name: "Cottage" },
  { name: "Glamping" },
  { name: "Other" },
];

async function main() {
  for (const c of currencies) {
    await prisma.currency.upsert({
      where: { symbol: c.symbol },
      update: { name: c.name },
      create: c,
    });
  }

  for (const ct of carTypes) {
    await prisma.carType.upsert({
      where: { name: ct.name },
      update: { id: ct.id },
      create: ct,
    });
  }

  for (const rt of roomTypes) {
    await prisma.roomType.upsert({
      where: { name: rt.name },
      update: {},
      create: rt,
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
