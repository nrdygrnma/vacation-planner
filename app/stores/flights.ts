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
    const combine = (dateStr?: string | null, timeStr?: string | null) => {
      if (!dateStr) return null;
      const d = String(dateStr).trim();
      const t = (timeStr || "").trim();
      const iso = t ? `${d}T${t}:00` : `${d}T00:00:00`;
      return iso;
    };

    const extras = {
      seatReservation: Number(data.extrasSeatReservation) || 0,
      checkedBaggage: Number(data.extrasCheckedBaggage) || 0,
      other: Number(data.extrasOther) || 0,
    };
    const hasExtras =
      extras.seatReservation || extras.checkedBaggage || extras.other;

    const stopOverAirports: string[] | null = (data.stopOverAirportsText || "")
      .split(",")
      .map((s: string) => s.trim())
      .filter((s: string) => !!s);

    // Build segments when exactly 1 stop is specified and segment details exist
    let segments: any[] | null = null;
    if (Number(data.stops) === 1 && data.stop1Airport) {
      const s1d = combine(data.seg1DepartureDate, data.seg1DepartureTime);
      const s1a = combine(data.seg1ArrivalDate, data.seg1ArrivalTime);
      const s2d = combine(data.seg2DepartureDate, data.seg2DepartureTime);
      const s2a = combine(data.seg2ArrivalDate, data.seg2ArrivalTime);
      if (s1d && s1a && s2d && s2a) {
        segments = [
          {
            fromAirport: (data.fromAirport || "").trim(),
            toAirport: (data.stop1Airport || "").trim(),
            departureDate: s1d,
            arrivalDate: s1a,
          },
          {
            fromAirport: (data.stop1Airport || "").trim(),
            toAirport: (data.toAirport || "").trim(),
            departureDate: s2d,
            arrivalDate: s2a,
          },
        ];
      }
    }

    return {
      airline: (data.airlineName || "").trim(),
      fromAirport: (data.fromAirport || "").trim(),
      toAirport: (data.toAirport || "").trim(),
      departureDate: combine(data.departureDate, data.departureTime),
      arrivalDate: combine(data.arrivalDate, data.arrivalTime),
      travelClass: data.travelClass,
      flightNumber: data.flightNumber || null,
      stops: Number(data.stops) || 0,
      baseFare: Number(data.baseFare) || 0,
      currencyId: data.currencyId || defaults?.currencyId || "",
      totalCostEUR: Number(data.totalCostEUR) || 0,
      bookingUrl: data.bookingUrl || null,
      notes: data.notes || null,
      extras: hasExtras ? JSON.stringify(extras) : null,
      stopOverDurationMinutes:
        data.stopOverDurationMinutes != null && data.stopOverDurationMinutes !== ""
          ? Number(data.stopOverDurationMinutes)
          : null,
      stopOverAirports:
        (data.stop1Airport ? [String(data.stop1Airport).trim()] : undefined) ||
        (stopOverAirports && stopOverAirports.length ? stopOverAirports : null),
      segments: segments ?? null,
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
    // Support being called with raw API shape OR with form payload shape.
    const maybeForm =
      body && (body.airlineName !== undefined || body.departureTime !== undefined);
    const payload = maybeForm ? mapFormToApi(body) : body;

    const updated = await $fetch<FlightOption>(
      `/api/trips/${tripId}/flights/${flightId}`,
      { method: "PUT", body: payload },
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
