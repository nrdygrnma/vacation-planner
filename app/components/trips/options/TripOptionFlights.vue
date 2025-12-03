<template>
  <section class="space-y-3">
    <header class="flex items-center justify-between gap-4">
      <div>
        <h2 class="text-sm font-semibold text-slate-800">Flights</h2>
        <p class="text-xs text-slate-500">Option: {{ option.name }}</p>
      </div>

      <button
        class="inline-flex items-center gap-1.5 rounded-md border border-sky-500 px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-50"
        type="button"
        @click="showCreate = true"
      >
        <span class="text-base leading-none">＋</span>
        <span>Add flight</span>
      </button>
    </header>

    <div v-if="optionFlights.length" class="space-y-2">
      <article
        v-for="flight in optionFlights"
        :key="flight.id"
        class="rounded-md border border-slate-200 bg-white p-3 text-xs flex flex-col gap-1"
      >
        <div class="flex items-center justify-between gap-3">
          <div class="font-medium text-slate-800">
            {{ flight.fromAirport.symbol ?? flight.fromAirport }} →
            {{ flight.toAirport.symbol ?? flight.toAirport }}
          </div>
          <div class="text-[11px] text-slate-500">
            {{ formatDate(flight.departureDate) }}
          </div>
        </div>
        <div
          class="flex items-center justify-between gap-3 text-[11px] text-slate-600"
        >
          <div>
            Airline:
            <span v-if="flight.airline?.name">
              {{ flight.airline.name }}
            </span>
            <span v-else>
              {{ flight.airline }}
            </span>
            <span v-if="flight.flightNumber"> · {{ flight.flightNumber }}</span>
          </div>
          <div>Class: {{ flight.travelClass }}</div>
          <div>{{ formatMoney(flight.totalCostEUR) }} €</div>
        </div>
      </article>
    </div>

    <p v-else class="text-xs text-slate-500">
      No flights assigned to this option yet.
    </p>

    <!-- Unassigned flights section -->
    <div
      v-if="unassignedFlights.length"
      class="mt-4 border-t border-slate-200 pt-3 space-y-2"
    >
      <div class="text-[11px] font-medium text-slate-600">
        Unassigned flights for this trip
      </div>

      <article
        v-for="flight in unassignedFlights"
        :key="flight.id"
        class="rounded-md border border-dashed border-slate-300 bg-slate-50 p-3 text-xs flex flex-col gap-1"
      >
        <div class="flex items-center justify-between gap-3">
          <div class="font-medium text-slate-800">
            {{ flight.fromAirport.symbol ?? flight.fromAirport }} →
            {{ flight.toAirport.symbol ?? flight.toAirport }}
          </div>
          <div class="text-[11px] text-slate-500">
            {{ formatDate(flight.departureDate) }}
          </div>
        </div>

        <div
          class="flex items-center justify-between gap-3 text-[11px] text-slate-600"
        >
          <div>
            Airline:
            <span v-if="flight.airline?.name">
              {{ flight.airline.name }}
            </span>
            <span v-else>
              {{ flight.airline }}
            </span>
            <span v-if="flight.flightNumber"> · {{ flight.flightNumber }}</span>
          </div>
          <div>{{ formatMoney(flight.totalCostEUR) }} €</div>
          <div class="flex items-center gap-2">
            <button
              class="rounded-md border border-sky-500 px-2 py-1 text-[11px] text-sky-700 hover:bg-sky-50"
              type="button"
              @click="assignFlightToOption(flight.id)"
            >
              Assign to this option
            </button>
          </div>
        </div>
      </article>
    </div>

    <!-- Create sheet -->
    <TripOptionFlightCreateSheet
      :open="showCreate"
      :option="option"
      :trip="trip"
      @close="showCreate = false"
      @saved="onFlightSaved"
    />
  </section>
</template>

<script lang="ts" setup>
import type { Trip, TripOption } from "@/types/tripTypes";
import TripOptionFlightCreateSheet from "@/components/trips/options/TripOptionFlightCreateSheet.vue";

const props = defineProps<{
  trip: Trip;
  option: TripOption;
}>();

const emit = defineEmits<{
  (e: "changed"): void;
}>();

const showCreate = ref(false);

const optionFlights = computed(() =>
  props.trip.flights.filter((f) => f.tripOptionId === props.option.id),
);
computed(() => props.trip.flights.filter((f) => !f.tripOptionId).length);
const unassignedFlights = computed(() =>
  props.trip.flights.filter((f) => !f.tripOptionId),
);

const assignFlightToOption = async (flightId: string) => {
  try {
    await $fetch(`/api/flights/${flightId}/option`, {
      method: "PATCH",
      body: {
        tripOptionId: props.option.id,
      },
    });
    emit("changed");
  } catch (err) {
    console.error("Failed to assign flight to option", err);
  }
};

const formatDate = (value?: string | null) => {
  if (!value) return "Date unknown";
  const d = new Date(value);
  return d.toLocaleDateString();
};

const formatMoney = (value: unknown): string => {
  if (value == null) return "—";

  const num =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : NaN;

  if (!Number.isFinite(num)) return "—";

  return num.toFixed(0);
};

const onFlightSaved = () => {
  emit("changed");
};
</script>
