import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async () => {
  try {
    const response = await $fetch<any>(
      "https://api.frankfurter.dev/v1/latest?base=EUR",
    );
    const rates = response.rates || {};

    const dbCurrencies = await prisma.currency.findMany();

    for (const c of dbCurrencies) {
      let rateToEUR = 1.0;
      if (c.symbol === "EUR") {
        rateToEUR = 1.0;
      } else if (rates[c.symbol]) {
        rateToEUR = 1 / rates[c.symbol];
      } else {
        continue;
      }

      await prisma.currency.update({
        where: { id: c.id },
        data: { rateToEUR },
      });
    }

    return { success: true };
  } catch (e) {
    console.error("Failed to sync exchange rates", e);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to sync exchange rates",
    });
  }
});
