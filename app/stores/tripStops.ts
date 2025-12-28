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
    // Use spread to trigger reactivity by replacing the array reference
    const newItems = [...bucket.items, created];
    // Sort items by order, then startDate
    newItems.sort(
      (a, b) =>
        a.order - b.order ||
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );
    bucket.items = newItems;
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
      const newItems = [...bucket.items];
      newItems[index] = { ...newItems[index], ...updated };
      newItems.sort(
        (a, b) =>
          a.order - b.order ||
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
      );
      bucket.items = newItems;
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

  async function reorder(
    tripId: string,
    orders: { id: string; order: number }[],
  ) {
    const response = await $fetch<{ success: boolean; stops: TripStop[] }>(
      `/api/trips/${tripId}/stops/reorder`,
      {
        method: "PUT",
        body: { orders },
      },
    );

    // Local update
    const bucket = ensure(tripId);
    bucket.items = response.stops;
  }

  async function batchUpdate(
    tripId: string,
    stops: {
      id: string;
      order: number;
      startDate?: string;
      endDate?: string;
    }[],
  ) {
    const response = await $fetch<{ success: boolean; stops: TripStop[] }>(
      `/api/trips/${tripId}/stops/batch`,
      {
        method: "PUT",
        body: { stops },
      },
    );

    // Use the full updated data from the backend to ensure all relations (images, etc) are correct
    const bucket = ensure(tripId);
    bucket.items = response.stops;
  }

  return {
    byTrip,
    fetchByTrip,
    add,
    update,
    remove,
    reorder,
    batchUpdate,
  };
});
