import { PrismaClient } from "@prisma/client";
import { Currency } from "../app/types/tripTypes";

const prisma = new PrismaClient();

const currencies: Currency[] = [
  { name: "Euro (EUR)", symbol: "€" },
  { name: "US Dollar (USD)", symbol: "$" },
  { name: "British Pound (GBP)", symbol: "£" },
  { name: "Costa Rican Colón (CRC)", symbol: "₡" },
];

async function main() {
  for (const c of currencies) {
    await prisma.currency.upsert({
      where: { symbol: c.symbol },
      update: { name: c.name },
      create: c,
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
