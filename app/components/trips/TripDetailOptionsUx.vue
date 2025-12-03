<template>
  <section v-if="trip" class="space-y-4">
    <!-- Trip header -->
    <header class="flex items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-semibold text-slate-800">
          {{ trip.title }}
        </h1>
        <p class="text-xs text-slate-500">Trip ID: {{ trip.id }}</p>
      </div>

      <div class="text-right text-xs text-slate-500">
        <div v-if="trip.startDate && trip.endDate">
          {{ formattedTripRange }}
        </div>
        <div v-else>Dates not set yet</div>
      </div>
    </header>

    <!-- Options bar -->
    <div class="flex items-center justify-between gap-4">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="option in tripOptions"
          :key="option.id"
          :class="
            option.id === selectedOptionId
              ? 'border-sky-500 bg-sky-50 text-sky-800'
              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
          "
          class="px-3 py-1.5 rounded-full border text-xs font-medium transition whitespace-nowrap flex items-center gap-2"
          type="button"
          @click="selectedOptionId = option.id"
        >
          <span>{{ option.name }}</span>
          <span
            v-if="option.isPreferred"
            class="text-[10px] uppercase tracking-wide"
          >
            ★ Preferred
          </span>
        </button>

        <span v-if="!tripOptions.length" class="text-xs text-slate-500">
          No options yet. Create your first scenario.
        </span>
      </div>

      <button
        class="inline-flex items-center gap-1.5 rounded-md border border-sky-500 px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-50"
        type="button"
        @click="onCreateOption"
      >
        <span class="text-base leading-none">＋</span>
        <span>New option</span>
      </button>
    </div>

    <!-- Selected option panel -->
    <!-- Tabs -->
    <nav class="border-b border-slate-200 mt-4">
      <ul class="flex flex-wrap gap-2">
        <li v-for="tab in tabs" :key="tab.id">
          <button
            :class="
              tab.id === activeTab
                ? 'border-sky-500 text-sky-700'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-200'
            "
            class="px-3 py-2 text-xs font-medium border-b-2 -mb-px transition"
            type="button"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </li>
      </ul>
    </nav>

    <!-- Tab content -->
    <div class="pt-4">
      <div v-if="currentOption" class="space-y-4">
        <!-- Overview -->
        <TripOptionOverview
          v-if="activeTab === 'overview'"
          :option="currentOption"
          :trip="trip"
        />

        <!-- Flights -->
        <TripOptionFlights
          v-else-if="activeTab === 'flights'"
          :option="currentOption"
          :trip="trip"
          @changed="onChanged"
        />

        <!-- Car rentals -->
        <TripOptionCars
          v-else-if="activeTab === 'cars'"
          :option="currentOption"
          :trip="trip"
        />

        <!-- Stays / stops -->
        <TripOptionStays
          v-else-if="activeTab === 'stays'"
          :option="currentOption"
          :trip="trip"
        />
      </div>

      <div v-else class="text-xs text-slate-500">
        Select an option or create a new one to start planning.
      </div>
    </div>
  </section>
</template>

<script lang="ts" setup>
import type { Trip, TripOption } from "@/types/tripTypes";
import TripOptionOverview from "@/components/trips/options/TripOptionOverview.vue";
import TripOptionFlights from "@/components/trips/options/TripOptionFlights.vue";
import TripOptionCars from "@/components/trips/options/TripOptionCars.vue";
import TripOptionStays from "@/components/trips/options/TripOptionStays.vue";

type TabId = (typeof tabs)[number]["id"];

const route = useRoute();

const activeTab = ref<TabId>("overview");
const selectedOptionId = ref<string | null>(null);

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "flights", label: "Flights" },
  { id: "cars", label: "Car rentals" },
  { id: "stays", label: "Stays & stops" },
] as const;

const tripId = computed(() => String(route.params.id || ""));

const { trip, refresh } = useTrip(tripId.value);

const tripOptions = computed<TripOption[]>(() => {
  return (trip.value?.tripOptions ?? []) as TripOption[];
});

const currentOption = computed((): TripOption | null => {
  const options = tripOptions.value;

  if (!options.length) {
    return null;
  }

  const existing = options.find((o) => o.id === selectedOptionId.value);
  if (existing) return existing;

  const preferred = options.find((o) => o.isPreferred);
  if (preferred) {
    selectedOptionId.value = preferred.id;
    return preferred;
  }

  const first = options[0];
  if (!first) {
    return null;
  }

  selectedOptionId.value = first.id;
  return first;
});

const formattedTripRange = computed(() => {
  if (!trip.value?.startDate || !trip.value?.endDate) return "";
  const start = new Date(trip.value.startDate);
  const end = new Date(trip.value.endDate);
  return `${start.toLocaleDateString()} – ${end.toLocaleDateString()}`;
});

const optionDateSummary = (option: TripOption) => {
  if (!option.startDate || !option.endDate) return "Dates not set yet";
  const start = new Date(option.startDate);
  const end = new Date(option.endDate);
  const nights =
    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 0;
  return `${start.toLocaleDateString()} – ${end.toLocaleDateString()} • ${nights} nights`;
};

const onCreateOption = async () => {
  if (!tripId.value) return;

  await $fetch(`/api/trips/${tripId.value}/options`, {
    method: "POST",
  });

  await refresh();
};

const onChanged = async () => {
  await refresh();
};
</script>
