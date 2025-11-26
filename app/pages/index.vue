<template>
  <section class="space-y-6">
    <TripsToolbar v-model="search" @created="refresh()" />

    <TripGrid
      v-if="filtered.length"
      :trips="filtered"
      @changed="refresh()"
      @open="onCardOpen"
    />

    <TripsEmptyState v-else :total="items?.length || 0" />
  </section>
</template>

<script lang="ts" setup>
import TripsToolbar from "@/components/trips/TripsToolbar.vue";
import TripGrid from "@/components/trips/TripGrid.vue";
import TripsEmptyState from "@/components/trips/TripsEmptyState.vue";
import { storeToRefs } from "pinia";
import { useTripsStore } from "@/stores/trips";
import type { Trip } from "@/types/tripTypes";

const tripsStore = useTripsStore();
const { items, filtered, search, pending } = storeToRefs(tripsStore);

const onCardOpen = (trip: Trip) => {
  navigateTo(`/trips/${trip.id}`);
};

watch(
  () => filtered.value.length,
  async () => {
    await nextTick();
    (window as any).HSOverlay?.autoInit?.();

    document.querySelectorAll(".overlay").forEach((el) => {
      try {
        const raw = (window as any).HSOverlay?.getInstance(el, true);
        const inst = raw?.element || raw?.overlay || raw;
        inst?.updateToggles?.();
      } catch {}
    });
  },
);

const refresh = () => tripsStore.fetchTrips();

onMounted(() => {
  if (!items.value?.length) tripsStore.fetchTrips();
});
</script>
