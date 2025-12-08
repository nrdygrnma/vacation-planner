<template>
  <section class="space-y-6">
    <TripsToolbar v-model="search" @created="refresh" />

    <!-- Loading state (optional, uses Nuxt UI skeletons) -->
    <div
      v-if="pending"
      class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <USkeleton v-for="i in 4" :key="i" class="h-40 rounded-xl" />
    </div>

    <TripGrid
      v-else-if="filtered.length"
      :trips="filtered"
      @changed="refresh"
      @open="onCardOpen"
    />

    <TripsEmptyState v-else :total="items?.length || 0" />
  </section>
</template>

<script lang="ts" setup>
import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import TripsToolbar from "@/components/trips/TripsToolbar.vue";
import TripGrid from "@/components/trips/TripGrid.vue";
import TripsEmptyState from "@/components/trips/TripsEmptyState.vue";
import { useTripsStore } from "@/stores/trips";
import type { Trip } from "@/types/tripTypes";

const tripsStore = useTripsStore();
const { items, filtered, search, pending } = storeToRefs(tripsStore);

const onCardOpen = (trip: Trip) => {
  navigateTo(`/trips/${trip.id}`);
};

const refresh = () => tripsStore.fetchTrips();

onMounted(() => {
  if (!items.value?.length) {
    tripsStore.fetchTrips();
  }
});
</script>
