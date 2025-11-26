<template>
  <details class="rounded-lg border bg-base-100">
    <summary
      class="cursor-pointer select-none px-4 py-3 text-sm font-medium flex items-center gap-2"
    >
      <Icon class="size-4" name="lucide:map" />
      Trip Stops
    </summary>

    <div class="px-4 pb-4 pt-2 space-y-3 text-sm">
      <p class="opacity-80">
        Plan your itinerary with stops and accommodations.
      </p>
      <!-- Later: TripStopsPanel with nested accommodations -->
    </div>
  </details>
</template>

<script lang="ts" setup>
import type { Trip } from "@/types/tripTypes";

defineProps<{ trip: Trip }>();
</script>
