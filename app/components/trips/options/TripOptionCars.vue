<template>
  <section class="space-y-3">
    <header class="flex items-center justify-between gap-4">
      <div>
        <h2 class="text-sm font-semibold text-slate-800">
          Car rentals
        </h2>
        <p class="text-xs text-slate-500">
          Option: {{ option.name }} (will be scoped per option later)
        </p>
      </div>

      <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-md border border-sky-500 px-3 py-1.5
               text-xs font-medium text-sky-700 hover:bg-sky-50"
      >
        <span class="text-base leading-none">＋</span>
        <span>Add car rental (legacy flow for now)</span>
      </button>
    </header>

    <div v-if="trip.carRentals.length" class="space-y-2">
      <article
          v-for="rental in trip.carRentals"
          :key="rental.id"
          class="rounded-md border border-slate-200 bg-white p-3 text-xs flex flex-col gap-1"
      >
        <div class="flex items-center justify-between gap-3">
          <div class="font-medium text-slate-800">
            {{ rental.provider }}
          </div>
          <div class="text-[11px] text-slate-500">
            {{ rental.pickupLocation }} → {{ rental.dropoffLocation }}
          </div>
        </div>
        <div class="flex items-center justify-between gap-3 text-[11px] text-slate-600">
          <div>
            {{ formatDate(rental.pickupDate) }} – {{ formatDate(rental.dropoffDate) }}
          </div>
          <div>
            {{ rental.totalCostEUR ? rental.totalCostEUR.toFixed(0) + ' €' : 'Cost unknown' }}
          </div>
        </div>
      </article>
    </div>

    <p v-else class="text-xs text-slate-500">
      No car rentals added yet for this trip.
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
