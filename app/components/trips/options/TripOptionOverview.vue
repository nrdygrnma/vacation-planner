<template>
  <section class="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
    <header class="flex items-center justify-between gap-4">
      <div>
        <h2 class="text-sm font-semibold text-slate-800">
          {{ option.name }}
        </h2>
        <p class="text-xs text-slate-500">
          Scenario for trip: {{ trip.title }}
        </p>
      </div>
      <div class="text-right text-xs text-slate-500">
        <div>{{ optionDateSummary }}</div>
        <div v-if="option.people">
          {{ option.people }} traveller<span v-if="option.people > 1">s</span>
        </div>
      </div>
    </header>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
      <div class="rounded-md border border-slate-100 bg-slate-50 p-3">
        <div class="text-slate-500">Flights (trip total)</div>
        <div class="mt-1 text-lg font-semibold text-slate-800">
          {{ trip.flights.length }}
        </div>
        <div class="mt-0.5 text-[11px] text-slate-500">
          Option-specific wiring comes later
        </div>
      </div>

      <div class="rounded-md border border-slate-100 bg-slate-50 p-3">
        <div class="text-slate-500">Car rentals (trip total)</div>
        <div class="mt-1 text-lg font-semibold text-slate-800">
          {{ trip.carRentals.length }}
        </div>
        <div class="mt-0.5 text-[11px] text-slate-500">
          Will be scoped per option soon
        </div>
      </div>

      <div class="rounded-md border border-slate-100 bg-slate-50 p-3">
        <div class="text-slate-500">Stops</div>
        <div class="mt-1 text-lg font-semibold text-slate-800">
          {{ trip.tripStops.length }}
        </div>
        <div class="mt-0.5 text-[11px] text-slate-500">
          Base route, reused across options
        </div>
      </div>

      <div class="rounded-md border border-slate-100 bg-slate-50 p-3">
        <div class="text-slate-500">Preferred?</div>
        <div class="mt-1 text-lg font-semibold">
          <span v-if="option.isPreferred" class="text-emerald-600">
            ★ Yes
          </span>
          <span v-else class="text-slate-500">
            Not yet
          </span>
        </div>
        <div class="mt-0.5 text-[11px] text-slate-500">
          We’ll add a toggle here later
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Trip, TripOption } from "@/types/tripTypes";

const props = defineProps<{
  trip: Trip;
  option: TripOption;
}>();

const optionDateSummary = computed(() => {
  if (!props.option.startDate || !props.option.endDate) {
    return "Dates not set yet";
  }
  const start = new Date(props.option.startDate);
  const end = new Date(props.option.endDate);
  const nights =
      Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 0;
  return `${start.toLocaleDateString()} – ${end.toLocaleDateString()} • ${nights} nights`;
});
</script>
