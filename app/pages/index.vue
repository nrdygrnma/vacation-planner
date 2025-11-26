<template>
  <section class="space-y-6">
    <TripsToolbar v-model="search" @created="refresh()" />

    <TripGrid
      v-if="filteredTrips.length"
      :trips="filteredTrips"
      @changed="refresh()"
      @open="onCardOpen"
    />

    <TripsEmptyState v-else :total="trips?.length || 0" />
  </section>
</template>

<script lang="ts" setup>
import TripsToolbar from "@/components/trips/TripsToolbar.vue";
import TripGrid from "@/components/trips/TripGrid.vue";
import TripsEmptyState from "@/components/trips/TripsEmptyState.vue";
import { useTrips } from "@/composables/useTrips";
import type { Trip } from "@/types/tripTypes";

const { trips, filteredTrips, search, refresh } = useTrips();

const onCardOpen = (trip: Trip) => {
  navigateTo(`/trips/${trip.id}`);
};

watch(
  () => filteredTrips.value.length,
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
</script>
