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

  const ensure = (tripId: string): StopBucket => {
    if (!byTrip.value[tripId]) {
      byTrip.value[tripId] = {
        items: [],
        pending: false,
        error: null,
      };
    }
    return byTrip.value[tripId];
  };

  const fetchByTrip = async (tripId: string) => {
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
  };

  const add = async (tripId: string, payload: any) => {
    const created = await $fetch<TripStop>(`/api/trips/${tripId}/stops`, {
      method: "POST",
      body: payload,
    });
    const bucket = ensure(tripId);
    // Use spread to trigger reactivity by replacing the array reference
    const newItems = [...bucket.items, created];
    // Sort items by order, then startDate
    newItems.sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();
      if (dateA !== dateB) return dateA - dateB;
      return a.type.localeCompare(b.type); // HUB before STOP
    });
    bucket.items = newItems;
    return created;
  };

  const update = async (tripId: string, stopId: string, payload: any) => {
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
      newItems.sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order;
        const dateA = new Date(a.startDate).getTime();
        const dateB = new Date(b.startDate).getTime();
        if (dateA !== dateB) return dateA - dateB;
        return a.type.localeCompare(b.type); // HUB before STOP
      });
      bucket.items = newItems;
    }
    return updated;
  };

  const remove = async (tripId: string, stopId: string) => {
    await $fetch(`/api/trips/${tripId}/stops/${stopId}`, {
      method: "DELETE",
    });
    const bucket = ensure(tripId);
    bucket.items = bucket.items.filter((i) => i.id !== stopId);
  };

  const reorder = async (
    tripId: string,
    orders: { id: string; order: number }[],
  ) => {
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
  };

  const batchUpdate = async (
    tripId: string,
    stops: {
      id: string;
      order: number;
      startDate?: string;
      endDate?: string;
    }[],
  ) => {
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
  };

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
