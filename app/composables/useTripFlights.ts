import type { FlightOption } from "@/types/tripTypes";

export function useTripFlights(tripId: string) {
  const { data, refresh, pending, error } = useFetch<FlightOption[]>(
    () => `/api/trips/${tripId}/flights`,
    { key: `trip-flights-${tripId}`, default: () => [] },
  );

  const flights = computed(() => data.value ?? []);

  async function addFlight(payload: Partial<FlightOption>) {
    await $fetch(`/api/trips/${tripId}/flights`, {
      method: "POST",
      body: payload,
    });
    await refresh();
  }

  async function updateFlight(id: string, payload: Partial<FlightOption>) {
    await $fetch(`/api/flights/${id}`, { method: "PUT", body: payload });
    await refresh();
  }

  async function deleteFlight(id: string) {
    await $fetch(`/api/flights/${id}`, { method: "DELETE" });
    await refresh();
  }

  async function selectFinalFlight(flightId: string) {
    await $fetch(`/api/trips/${tripId}/final-flight`, {
      method: "PUT",
      body: { flightId },
    });
    await refresh();
    await refreshNuxtData("trips");
  }

  return {
    flights,
    refresh,
    pending,
    error,
    addFlight,
    updateFlight,
    deleteFlight,
    selectFinalFlight,
  };
}
