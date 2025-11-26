<template>
  <div
    :id="`acc-flights-${trip.id}`"
    class="accordion-item active border border-gray-200 rounded-md"
  >
    <button
      :aria-controls="`acc-flights-${trip.id}-collapse`"
      aria-expanded="true"
      class="accordion-toggle inline-flex items-center gap-x-4 text-start w-full"
      type="button"
    >
      <span
        class="icon-[lucide--plus] accordion-item-active:hidden text-base-content size-4.5 block shrink-0"
      ></span>
      <span
        class="icon-[lucide--minus] accordion-item-active:block text-base-content size-4.5 hidden shrink-0"
      ></span>
      <span class="inline-flex items-center gap-2 text-sm font-medium">
        <Icon class="size-4" name="lucide:plane" />
        Flights
        <span v-if="trip.selectedFlightId" class="badge badge-soft ms-2"
          >Selected</span
        >
      </span>
    </button>

    <div
      :id="`acc-flights-${trip.id}-collapse`"
      :aria-labelledby="`acc-flights-${trip.id}`"
      class="accordion-content w-full overflow-hidden transition-[height] duration-300"
      role="region"
    >
      <div class="px-5 pb-4 space-y-3">
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
            ·
            {{ humanDuration(trip.selectedFlight.durationMin) }}
          </div>
        </div>

        <TripFlightsModal :trip="trip" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import TripFlightsModal from "~/components/flights/modals/TripFlightsModal.vue";
import type { Trip } from "@/types/tripTypes";

defineProps<{ trip: Trip }>();

const humanDuration = (min?: number | null) => {
  if (min == null) return "—";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m}m`;
};
</script>
