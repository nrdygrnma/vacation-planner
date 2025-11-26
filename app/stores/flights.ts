import { defineStore } from "pinia";
import { ref } from "vue";
import type { FlightOption } from "@/types/tripTypes";
import { toast } from "vue-sonner";

interface FlightBucket {
  items: FlightOption[];
  pending: boolean;
  error: string | null;
}

export const useFlightsStore = defineStore("flights", () => {
  // -----------------------------------
  // State
  // -----------------------------------
  const byTrip = ref<Record<string, FlightBucket>>({});

  // -----------------------------------
  // Helpers
  // -----------------------------------
  function ensure(tripId: string): FlightBucket {
    if (!byTrip.value[tripId]) {
      byTrip.value[tripId] = {
        items: [],
        pending: false,
        error: null,
      };
    }
    return byTrip.value[tripId];
  }

  function mapFormToApi(data: any, defaults?: { currencyId?: string }) {
    const extras = {
      seatReservation: Number(data.extrasSeatReservation) || 0,
      checkedBaggage: Number(data.extrasCheckedBaggage) || 0,
      other: Number(data.extrasOther) || 0,
    };
    const hasExtras =
      extras.seatReservation || extras.checkedBaggage || extras.other;

    return {
      airline: (data.airlineName || "").trim(),
      fromAirport: (data.fromAirport || "").trim(),
      toAirport: (data.toAirport || "").trim(),
      departureDate: data.departureDate || null,
      arrivalDate: data.arrivalDate || null,
      travelClass: data.travelClass,
      flightNumber: data.flightNumber || null,
      stops: Number(data.stops) || 0,
      baseFare: Number(data.baseFare) || 0,
      currencyId: data.currencyId || defaults?.currencyId || "",
      totalCostEUR: Number(data.totalCostEUR) || 0,
      bookingUrl: data.bookingUrl || null,
      notes: data.notes || null,
      extras: hasExtras ? JSON.stringify(extras) : null,
    };
  }

  // -----------------------------------
  // Actions
  // -----------------------------------
  async function fetchByTrip(tripId: string) {
    const bucket = ensure(tripId);

    try {
      bucket.pending = true;
      bucket.error = null;

      const data = await $fetch<FlightOption[]>(`/api/trips/${tripId}/flights`);
      bucket.items = data;
    } catch (e: any) {
      console.error(e);
      bucket.error = e?.statusMessage || "Failed to load flights";
    } finally {
      bucket.pending = false;
    }
  }

  async function add(tripId: string, formPayload: any) {
    const body = mapFormToApi(formPayload);

    const created = await $fetch<FlightOption>(`/api/trips/${tripId}/flights`, {
      method: "POST",
      body,
    });

    ensure(tripId).items.unshift(created);
    toast.success("Flight added");

    return created;
  }

  async function update(tripId: string, flightId: string, body: any) {
    const updated = await $fetch<FlightOption>(
      `/api/trips/${tripId}/flights/${flightId}`,
      { method: "PUT", body },
    );

    const bucket = ensure(tripId);
    const index = bucket.items.findIndex((f) => f.id === flightId);

    if (index !== -1) {
      bucket.items[index] = { ...bucket.items[index], ...updated };
    }

    toast.success("Flight updated");
    return updated;
  }

  async function remove(tripId: string, flightId: string) {
    await $fetch(`/api/trips/${tripId}/flights/${flightId}`, {
      method: "DELETE",
    });

    const bucket = ensure(tripId);
    bucket.items = bucket.items.filter((f) => f.id !== flightId);

    toast.success("Flight deleted");
  }

  async function selectFinal(tripId: string, flightId: string) {
    await $fetch(`/api/trips/${tripId}/final-flight`, {
      method: "PUT",
      body: { flightId },
    });

    toast.success("Selected flight updated");
  }

  return {
    byTrip,
    ensure,
    fetchByTrip,
    add,
    update,
    remove,
    selectFinal,
  };
});
