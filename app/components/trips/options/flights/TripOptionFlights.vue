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
        @click="showEditor = true"
      >
        <span class="text-base leading-none">＋</span>
        <span>Add flight</span>
      </button>
    </header>

    <div class="flex items-center gap-2 text-[11px] text-slate-600">
      <span class="uppercase tracking-wide text-[10px] text-slate-400"
        >Sort by:</span
      >

      <select
        v-model="sortMode"
        class="border border-slate-300 rounded px-2 py-1 text-[11px] bg-white"
      >
        <option value="price">Price</option>
        <option value="duration">Duration</option>
        <option value="stops">Stops</option>
        <option value="airline">Airline</option>
        <option value="date">Departure</option>
      </select>
      <div class="text-[10px] text-slate-400">Sorted by: {{ sortMode }}</div>
    </div>

    <div v-if="optionFlights.length" class="space-y-2">
      <article
        v-for="flight in optionFlights"
        :key="flight.id"
        class="rounded-md border border-slate-200 bg-white p-4 text-xs flex flex-col gap-1"
      >
        <!-- Top route + airline block -->
        <div class="flex items-start justify-between">
          <div class="flex flex-col">
            <div class="text-sm font-semibold text-slate-900">
              {{ flight.fromAirport.symbol ?? flight.fromAirport }} →
              {{ flight.toAirport.symbol ?? flight.toAirport }}
            </div>

            <div class="mt-0.5 flex items-center gap-2">
              <span class="text-[11px] text-slate-500">
                {{ formatDate(flight.departureDate) }}
              </span>

              <span
                class="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] uppercase tracking-wide text-slate-600"
              >
                {{ flight.airline?.name ?? flight.airline }}
              </span>

              <span
                v-if="flight.flightNumber"
                class="text-[10px] text-slate-400"
              >
                #{{ flight.flightNumber }}
              </span>
            </div>
          </div>
          <div class="gap-2 flex items-center">
            <button
              class="rounded-md border border-slate-300 px-2 py-1 text-[11px] hover:bg-slate-50"
              type="button"
              @click="onEditFlight(flight)"
            >
              Edit
            </button>

            <button
              class="rounded-md border border-red-500 px-2 py-1 text-[11px] text-red-600 hover:bg-red-50"
              type="button"
              @click="deleteFlight(flight.id)"
            >
              Delete
            </button>
          </div>
        </div>

        <!-- Duration & stops -->
        <div class="mt-1 flex items-center gap-3 text-[11px] text-slate-600">
          <div>
            Duration:
            <span class="font-medium">{{
              formatDuration(flight.durationMin)
            }}</span>
          </div>

          <div v-if="flight.stops > 0">
            Stops: <span class="font-medium">{{ flight.stops }}</span>
          </div>
          <div v-else>Direct flight</div>
        </div>

        <!-- Price + class -->
        <div class="flex items-center justify-between mt-2">
          <div class="text-[10px] text-slate-500 uppercase tracking-wide">
            {{ flight.travelClass }}
          </div>

          <div class="text-sm font-semibold text-slate-800">
            {{ formatMoney(flight.totalCostEUR) }} €
          </div>
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

            <button
              class="rounded-md border border-red-500 px-2 py-1 text-[11px] text-red-600 hover:bg-red-50"
              type="button"
              @click="deleteFlight(flight.id)"
            >
              Delete
            </button>
          </div>
        </div>
      </article>
    </div>

    <TripOptionFlightEditor
      :flight="selectedFlight"
      :open="showEditor"
      :option="option"
      :trip="trip"
      @close="
        () => {
          showEditor = false;
          selectedFlight = null;
        }
      "
      @saved="onFlightSaved"
    />
  </section>
</template>

<script lang="ts" setup>
import type { FlightOption, Trip, TripOption } from "~/types/tripTypes";
import TripOptionFlightEditor from "~/components/trips/options/flights/TripOptionFlightEditor.vue";

const props = defineProps<{
  trip: Trip;
  option: TripOption;
}>();

const emit = defineEmits<{
  (e: "changed"): void;
}>();

const showEditor = ref(false);
const selectedFlight = ref(null as FlightOption | null);
const sortMode = ref<"price" | "duration" | "stops" | "airline" | "date">(
  "price",
);

const optionFlights = computed(() => {
  const list = props.trip.flights.filter(
    (f) => f.tripOptionId === props.option.id,
  );

  return sortFlights(list, sortMode.value);
});

computed(() => props.trip.flights.filter((f) => !f.tripOptionId).length);

const unassignedFlights = computed(() => {
  const list = props.trip.flights.filter((f) => !f.tripOptionId);
  return sortFlights(list, sortMode.value);
});

const assignFlightToOption = async (flightId: string) => {
  try {
    await $fetch(`/api/trips/${props.trip.id}/flights/${flightId}/option`, {
      method: "PATCH",
      body: { tripOptionId: props.option.id },
    });
    emit("changed");
  } catch (err) {
    console.error("Failed to assign flight to option", err);
  }
};

const deleteFlight = async (flightId: string) => {
  if (!confirm("Delete this flight?")) return;

  try {
    await $fetch(`/api/trips/${props.trip.id}/flights/${flightId}`, {
      method: "DELETE",
    });

    emit("changed");
  } catch (err) {
    console.error("Failed to delete flight", err);
  }
};

const onEditFlight = (flight: FlightOption) => {
  selectedFlight.value = flight;
  showEditor.value = true;
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

const formatDuration = (min?: number | null) => {
  if (!min) return "—";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m}m`;
};

const sortFlights = (flights: FlightOption[], mode: string) => {
  const copy = [...flights];

  switch (mode) {
    case "price":
      return copy.sort((a, b) => (a.totalCostEUR ?? 0) - (b.totalCostEUR ?? 0));

    case "duration":
      return copy.sort((a, b) => (a.durationMin ?? 0) - (b.durationMin ?? 0));

    case "stops":
      return copy.sort((a, b) => (a.stops ?? 0) - (b.stops ?? 0));

    case "airline":
      return copy.sort((a, b) =>
        (a.airline?.name ?? a.airline ?? "").localeCompare(
          b.airline?.name ?? b.airline ?? "",
        ),
      );

    case "date":
      return copy.sort(
        (a, b) =>
          +new Date(a.departureDate ?? 0) - +new Date(b.departureDate ?? 0),
      );

    default:
      return copy;
  }
};

const onFlightSaved = () => {
  emit("changed");
};
</script>
