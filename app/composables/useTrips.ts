import type { Trip } from "@/types/tripTypes";

export function useTrips() {
  const search = ref("");
  const {
    data: trips,
    refresh,
    pending,
    error,
  } = useFetch<Trip[]>("/api/trips", {
    key: "trips",
    default: () => [],
  });

  const filteredTrips = computed<Trip[]>(() => {
    const list = trips?.value ?? [];
    const q = search.value.trim().toLowerCase();
    if (!q) return list as Trip[];
    return (list as Trip[]).filter((t) => t.title.toLowerCase().includes(q));
  });

  return { trips, filteredTrips, search, refresh, pending, error };
}
