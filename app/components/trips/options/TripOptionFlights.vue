<template>
  <section class="space-y-3">
    <header class="flex items-center justify-between gap-4">
      <div>
        <h2 class="text-sm font-semibold text-slate-800">
          Flights for {{ trip.title }}
        </h2>
        <p class="text-xs text-slate-500">
          Option: {{ option.name }} (wiring to option-specific flights comes later)
        </p>
      </div>

      <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-md border border-sky-500 px-3 py-1.5
               text-xs font-medium text-sky-700 hover:bg-sky-50"
      >
        <span class="text-base leading-none">＋</span>
        <span>Add flight (legacy flow for now)</span>
      </button>
    </header>

    <div v-if="trip.flights.length" class="space-y-2">
      <article
          v-for="flight in trip.flights"
          :key="flight.id"
          class="rounded-md border border-slate-200 bg-white p-3 text-xs flex flex-col gap-1"
      >
        <div class="flex items-center justify-between gap-3">
          <div class="font-medium text-slate-800">
            {{ flight.fromAirport }} → {{ flight.toAirport }}
          </div>
          <div class="text-[11px] text-slate-500">
            {{ formatDate(flight.departureDate) }}
          </div>
        </div>
        <div class="flex items-center justify-between gap-3 text-[11px] text-slate-600">
          <div>
            Airline: {{ flight.airline }}
            <span v-if="flight.flightNumber">· {{ flight.flightNumber }}</span>
          </div>
          <div>
            Class: {{ flight.travelClass }}
          </div>
          <div>
            {{ flight.totalCostEUR.toFixed(0) }} €
          </div>
        </div>
      </article>
    </div>

    <p v-else class="text-xs text-slate-500">
      No flights added yet for this trip. This section will later show only the
      flights that belong to this option.
    </p>
  </section>
</template>

<script setup lang="ts">
import type { Trip, TripOption } from "@/types/tripTypes";

const props = defineProps<{
  trip: Trip;
  option: TripOption;
}>();

const formatDate = (value?: string | null) => {
  if (!value) return "Date unknown";
  const d = new Date(value);
  return d.toLocaleDateString();
};
</script>
