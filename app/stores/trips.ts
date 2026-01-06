import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type { Trip } from "@/types/tripTypes";

export const useTripsStore = defineStore("trips", () => {
  // ------------------------
  // State
  // ------------------------
  const items = ref<Trip[]>([]);
  const pending = ref(false);
  const error = ref<string | null>(null);
  const search = ref("");

  // ------------------------
  // Getters
  // ------------------------
  const filtered = computed(() => {
    const q = search.value.trim().toLowerCase();
    if (!q) return items.value;
    return items.value.filter((t) => t.title.toLowerCase().includes(q));
  });

  // ------------------------
  // Actions
  // ------------------------
  async function fetchTrips() {
    try {
      pending.value = true;
      error.value = null;
      items.value = await $fetch<Trip[]>("/api/trips");
    } catch (e: any) {
      console.error(e);
      error.value = e?.statusMessage || "Failed to load trips";
    } finally {
      pending.value = false;
    }
  }

  async function createTrip(body: Partial<Trip>) {
    const created = await $fetch<Trip>("/api/trips", {
      method: "POST",
      body,
    });
    items.value.unshift(created);
    return created;
  }

  async function updateTrip(id: string, body: Partial<Trip>) {
    const updated = await $fetch<Trip>(`/api/trips/${id}`, {
      method: "PUT",
      body,
    });

    const idx = items.value.findIndex((t) => t.id === id);
    if (idx !== -1) {
      items.value[idx] = { ...items.value[idx], ...updated };
    }

    return updated;
  }

  async function deleteTrip(id: string) {
    await $fetch(`/api/trips/${id}`, {
      method: "DELETE",
    });

    items.value = items.value.filter((t) => t.id !== id);
  }

  return {
    items,
    pending,
    error,
    search,
    filtered,
    fetchTrips,
    createTrip,
    updateTrip,
    deleteTrip,
  };
});
