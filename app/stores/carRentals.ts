import { defineStore } from "pinia";
import { ref } from "vue";
import type { CarRentalOption } from "@/types/tripTypes";

interface CarRentalBucket {
  items: CarRentalOption[];
  pending: boolean;
  error: string | null;
}

export const useCarRentalsStore = defineStore("carRentals", () => {
  const byTrip = ref<Record<string, CarRentalBucket>>({});

  const ensure = (tripId: string): CarRentalBucket => {
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
      const data = await $fetch<CarRentalOption[]>(
        `/api/trips/${tripId}/car-rentals`,
      );
      bucket.items = data;
    } catch (e: any) {
      console.error(e);
      bucket.error = e?.statusMessage || "Failed to load car rentals";
    } finally {
      bucket.pending = false;
    }
  };

  const add = async (tripId: string, payload: any) => {
    const created = await $fetch<CarRentalOption>(
      `/api/trips/${tripId}/car-rentals`,
      {
        method: "POST",
        body: payload,
      },
    );
    ensure(tripId).items.unshift(created);
    return created;
  };

  const update = async (tripId: string, rentalId: string, payload: any) => {
    const updated = await $fetch<CarRentalOption>(
      `/api/trips/${tripId}/car-rentals/${rentalId}`,
      {
        method: "PUT",
        body: payload,
      },
    );
    const bucket = ensure(tripId);
    const index = bucket.items.findIndex((i) => i.id === rentalId);
    if (index !== -1) {
      bucket.items[index] = { ...bucket.items[index], ...updated };
    }
    return updated;
  };

  const remove = async (tripId: string, rentalId: string) => {
    await $fetch(`/api/trips/${tripId}/car-rentals/${rentalId}`, {
      method: "DELETE",
    });
    const bucket = ensure(tripId);
    bucket.items = bucket.items.filter((i) => i.id !== rentalId);
  };

  const selectFinal = async (tripId: string, rentalId: string | null) => {
    await $fetch(`/api/trips/${tripId}/final-car-rental`, {
      method: "PUT",
      body: { carRentalId: rentalId },
    });
  };

  return {
    byTrip,
    fetchByTrip,
    add,
    update,
    remove,
    selectFinal,
  };
});
