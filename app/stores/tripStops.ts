import { defineStore } from "pinia";
import { ref } from "vue";
import type { TripStop } from "@/types/tripTypes";

interface StopBucket {
  items: TripStop[];
  pending: boolean;
  error: string | null;
}

export const useTripStopsStore = defineStore("tripStops", () => {
  const byTrip = ref<Record<string, StopBucket>>({});

  function ensure(tripId: string): StopBucket {
    if (!byTrip.value[tripId]) {
      byTrip.value[tripId] = {
        items: [],
        pending: false,
        error: null,
      };
    }
    return byTrip.value[tripId];
  }

  async function fetchByTrip(tripId: string) {
    const bucket = ensure(tripId);
    try {
      bucket.pending = true;
      bucket.error = null;
      const data = await $fetch<TripStop[]>(`/api/trips/${tripId}/stops`);
      bucket.items = data;
    } catch (e: any) {
      console.error(e);
      bucket.error = e?.statusMessage || "Failed to load trip stops";
    } finally {
      bucket.pending = false;
    }
  }

  async function add(tripId: string, payload: any) {
    const created = await $fetch<TripStop>(`/api/trips/${tripId}/stops`, {
      method: "POST",
      body: payload,
    });
    const bucket = ensure(tripId);
    bucket.items.push(created);
    // Sort items by startDate after adding
    bucket.items.sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );
    return created;
  }

  async function update(tripId: string, stopId: string, payload: any) {
    const updated = await $fetch<TripStop>(
      `/api/trips/${tripId}/stops/${stopId}`,
      {
        method: "PUT",
        body: payload,
      },
    );
    const bucket = ensure(tripId);
    const index = bucket.items.findIndex((i) => i.id === stopId);
    if (index !== -1) {
      bucket.items[index] = { ...bucket.items[index], ...updated };
      bucket.items.sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
      );
    }
    return updated;
  }

  async function remove(tripId: string, stopId: string) {
    await $fetch(`/api/trips/${tripId}/stops/${stopId}`, {
      method: "DELETE",
    });
    const bucket = ensure(tripId);
    bucket.items = bucket.items.filter((i) => i.id !== stopId);
  }

  return {
    byTrip,
    fetchByTrip,
    add,
    update,
    remove,
  };
});
