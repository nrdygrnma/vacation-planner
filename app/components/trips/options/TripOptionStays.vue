<template>
  <section class="space-y-3">
    <header>
      <h2 class="text-sm font-semibold text-slate-800">
        Stays & stops
      </h2>
      <p class="text-xs text-slate-500">
        Base route stops are shared across options. Option-specific stays will come later.
      </p>
    </header>

    <div v-if="trip.tripStops.length" class="space-y-2">
      <article
          v-for="stop in trip.tripStops"
          :key="stop.id"
          class="rounded-md border border-slate-200 bg-white p-3 text-xs flex flex-col gap-1"
      >
        <div class="flex items-center justify-between gap-3">
          <div class="font-medium text-slate-800">
            {{ stop.name }}
          </div>
          <div class="text-[11px] text-slate-500">
            {{ formatDate(stop.startDate) }} – {{ formatDate(stop.endDate) }}
          </div>
        </div>

        <div class="text-[11px] text-slate-600">
          {{ stop.accommodations.length }} accommodation option<span v-if="stop.accommodations.length !== 1">s</span>
          at this stop (currently trip-level).
        </div>
      </article>
    </div>

    <p v-else class="text-xs text-slate-500">
      No stops defined yet. You can still plan flights and cars for this option.
    </p>
  </section>
</template>

<script setup lang="ts">
import type { Trip, TripOption } from "@/types/tripTypes";

const props = defineProps<{
  trip: Trip;
  option: TripOption;
}>();

const formatDate = (value: string) => {
  const d = new Date(value);
  return d.toLocaleDateString();
};
</script>
