export function calculateRentalDays(
  pickupDate?: string,
  dropoffDate?: string,
): number {
  if (!pickupDate || !dropoffDate) return 0;

  const start = new Date(pickupDate).getTime();
  const end = new Date(dropoffDate).getTime();

  if (isNaN(start) || isNaN(end)) return 0;

  const days = Math.round((end - start) / (1000 * 60 * 60 * 24));
  return Math.max(days, 1); // minimum 1 day rental
}

export function calculateRentalTotal(body: any): number {
  const base = Number(body.baseRate ?? 0);
  const fees = Number(body.fees ?? 0);
  const insurance = Number(body.insurancePerDay ?? 0);

  const days = calculateRentalDays(body.pickupDate, body.dropoffDate);

  return base + fees + insurance * days;
}

export function rentalDays(pickupDate?: string, dropoffDate?: string): number {
  if (!pickupDate || !dropoffDate) return 0;

  const start = new Date(pickupDate).getTime();
  const end = new Date(dropoffDate).getTime();

  if (isNaN(start) || isNaN(end)) return 0;

  return Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
}
