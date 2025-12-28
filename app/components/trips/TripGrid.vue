<template>
  <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    <TripCard
      v-for="trip in trips"
      :key="trip.id"
      :trip="trip"
      @changed="$emit('changed')"
      @delete="$emit('delete', $event)"
      @edit="$emit('edit', $event)"
      @open="$emit('open', $event)"
    />
  </div>
</template>

<script lang="ts" setup>
import TripCard from "./TripCard.vue";
import type { Trip } from "@/types/tripTypes";

defineProps<{ trips: Trip[] }>();

defineEmits<{
  (e: "open", trip: Trip): void;
  (e: "changed"): void;
  (e: "delete", trip: Trip): void;
  (e: "edit", trip: Trip): void;
}>();
</script>
