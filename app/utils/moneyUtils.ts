export function formatMoney(value: number): string {
  const num = Number(value);
  if (isNaN(num)) return "";
  return num.toFixed(2);
}
