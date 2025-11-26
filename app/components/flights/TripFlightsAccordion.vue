<template>
  <details class="rounded-lg border bg-base-100" open>
    <summary
      class="cursor-pointer select-none px-4 py-3 text-sm font-medium flex items-center gap-2"
    >
      <Icon class="size-4" name="lucide:plane" />
      Flights
      <span v-if="trip.selectedFlightId" class="badge badge-soft ms-2"
        >Selected</span
      >
    </summary>

    <div class="px-4 pb-4 pt-2 space-y-3">
      <!-- Selected flight summary (if any) -->
      <div v-if="trip.selectedFlight" class="text-sm opacity-90">
        <div class="font-medium">
          {{ trip.selectedFlight.airline?.name || "—" }}
          <span v-if="trip.selectedFlight.airline?.symbol"
            >({{ trip.selectedFlight.airline?.symbol }})</span
          >
        </div>
        <div class="text-xs opacity-80">
          {{
            trip.selectedFlight.fromAirport?.symbol ||
            trip.selectedFlight.fromAirport?.name
          }}
          →
          {{
            trip.selectedFlight.toAirport?.symbol ||
            trip.selectedFlight.toAirport?.name
          }}
          · {{ humanDuration(trip.selectedFlight.durationMin) }}
        </div>
      </div>

      <!-- Manage flights (reuses your modal) -->
      <TripFlightsModal :trip="trip" />
    </div>
  </details>
</template>

<script lang="ts" setup>
import TripFlightsModal from "@/components/flights/TripFlightsModal.vue";
import type { Trip } from "@/types/tripTypes";

const props = defineProps<{ trip: Trip }>();

const humanDuration = (min?: number | null) => {
  if (min == null) return "—";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m}m`;
};
</script>
