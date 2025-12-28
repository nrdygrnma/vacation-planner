import { defineStore } from "pinia";
import { ref } from "vue";
import type { AccommodationOption } from "@/types/tripTypes";

export const useAccommodationsStore = defineStore("accommodations", () => {
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function add(tripId: string, stopId: string, payload: any) {
    loading.value = true;
    error.value = null;
    try {
      const data = await $fetch<AccommodationOption>(
        `/api/trips/${tripId}/stops/${stopId}/accommodations`,
        {
          method: "POST",
          body: payload,
        },
      );
      return data;
    } catch (e: any) {
      error.value = e.statusMessage || "Failed to add accommodation";
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function update(
    tripId: string,
    stopId: string,
    accommodationId: string,
    payload: any,
  ) {
    loading.value = true;
    error.value = null;
    try {
      const data = await $fetch<AccommodationOption>(
        `/api/trips/${tripId}/stops/${stopId}/accommodations/${accommodationId}`,
        {
          method: "PUT",
          body: payload,
        },
      );
      return data;
    } catch (e: any) {
      error.value = e.statusMessage || "Failed to update accommodation";
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function remove(
    tripId: string,
    stopId: string,
    accommodationId: string,
  ) {
    loading.value = true;
    error.value = null;
    try {
      await $fetch(
        `/api/trips/${tripId}/stops/${stopId}/accommodations/${accommodationId}`,
        {
          method: "DELETE",
        },
      );
    } catch (e: any) {
      error.value = e.statusMessage || "Failed to delete accommodation";
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function selectFinal(
    tripId: string,
    stopId: string,
    accommodationId: string | null,
  ) {
    loading.value = true;
    error.value = null;
    try {
      // Assuming the stop update endpoint handles selecting an accommodation
      await $fetch(`/api/trips/${tripId}/stops/${stopId}`, {
        method: "PUT",
        body: { selectedAccommodationId: accommodationId },
      });
    } catch (e: any) {
      error.value = e.statusMessage || "Failed to select accommodation";
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    error,
    add,
    update,
    remove,
    selectFinal,
  };
});
