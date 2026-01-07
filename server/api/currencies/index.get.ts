import { prisma } from "~~/server/utils/prisma";

export default defineEventHandler(async () => {
  const dbCurrencies = await prisma.currency.findMany({
    orderBy: { name: "asc" },
  });

  try {
    const response = await $fetch<any>(
      "https://api.frankfurter.dev/v1/latest?base=EUR",
    );
    const rates = response.rates || {};

    return dbCurrencies.map((c) => {
      let rateToEUR = Number(c.rateToEUR);

      if (c.symbol === "EUR") {
        rateToEUR = 1.0;
      } else if (rates[c.symbol]) {
        // rates[c.symbol] is how many [c.symbol] per 1 EUR
        // 1 [c.symbol] = 1 / rates[c.symbol] EUR
        rateToEUR = 1 / rates[c.symbol];
      }

      return {
        ...c,
        rateToEUR,
      };
    });
  } catch (e) {
    console.error("Failed to fetch live exchange rates", e);
    return dbCurrencies;
  }
});
