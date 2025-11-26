<template>
  <details class="rounded-lg border bg-base-100">
    <summary
      class="cursor-pointer select-none px-4 py-3 text-sm font-medium flex items-center gap-2"
    >
      <Icon class="size-4" name="lucide:car" />
      Car Rental
      <span v-if="trip.selectedCarRentalId" class="badge badge-soft ms-2"
        >Selected</span
      >
    </summary>

    <div class="px-4 pb-4 pt-2 space-y-3 text-sm">
      <p class="opacity-80">
        Car rental management coming next (add, edit, delete, select).
      </p>
      <!-- Later: a TripCarRentalsModal or panel -->
    </div>
  </details>
</template>

<script lang="ts" setup>
import type { Trip } from "@/types/tripTypes";

defineProps<{ trip: Trip }>();
</script>
