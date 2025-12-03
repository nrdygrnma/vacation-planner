import type { CarRentalOption } from "@/types/tripTypes";

export function rentalDaysFromOption(rental: CarRentalOption): number {
  if (!rental.pickupDate || !rental.dropoffDate) return 0;

  const start = new Date(rental.pickupDate).getTime();
  const end = new Date(rental.dropoffDate).getTime();

  if (isNaN(start) || isNaN(end)) return 0;

  return Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
}
