import type { Trip } from "@/types/tripTypes";

export const useTrip = (tripId: string) => {
  const { data, refresh, pending, error } = useFetch<Trip>(
    () => `/api/trips/${tripId}`,
    {
      key: () => `trip-${tripId}`,
      default: () => undefined as unknown as Trip,
    },
  );

  const trip = computed(() => data.value as Trip | undefined);

  return { trip, refresh, pending, error };
}
