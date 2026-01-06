export const useCurrencyUtils = () => {
  const { data: currencies } = useFetch("/api/currencies");

  const convertToEUR = (amount: number, currencyId: string) => {
    if (!currencies.value) return amount;
    const currency = (currencies.value as any[]).find(
      (c: any) => c.id === currencyId,
    );
    if (!currency) return amount;
    return amount * Number(currency.rateToEUR);
  };

  const formatEUR = (amount: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  return {
    convertToEUR,
    formatEUR,
    currencies,
  };
};
