import { PrismaClient } from "@prisma/client";
import { Currency } from "../app/types/tripTypes";

const prisma = new PrismaClient();

const currencies: Currency[] = [
  { name: "Euro", symbol: "€" },
  { name: "US Dollar", symbol: "$" },
  { name: "British Pound", symbol: "£" },
  { name: "Costa Rican Colón", symbol: "₡" },
];

async function main() {
  for (const c of currencies) {
    await prisma.currency.upsert({
      where: { name: c.name },
      update: {},
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
