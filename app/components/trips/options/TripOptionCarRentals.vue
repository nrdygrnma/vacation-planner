<template>
  <section class="space-y-3">
    <header class="flex items-center justify-between gap-4">
      <div>
        <h2 class="text-sm font-semibold text-slate-800">Car Rentals</h2>
        <p class="text-xs text-slate-500">Option: {{ option.name }}</p>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="inline-flex items-center gap-1.5 rounded-md border border-sky-500 px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-50"
          type="button"
          @click="openCreate"
        >
          <span class="text-base leading-none">＋</span>
          <span>Add rental</span>
        </button>
      </div>
    </header>

    <!-- Sorting -->
    <div class="flex items-center gap-2 mb-3 text-[11px] text-slate-600">
      <span class="uppercase tracking-wide text-[10px] text-slate-400"
        >Sort by:</span
      >

      <select
        v-model="sortMode"
        class="rounded border border-slate-300 px-2 py-1 text-[11px]"
      >
        <option value="price">Price</option>
        <option value="days">Duration</option>
        <option value="provider">Provider</option>
        <option value="pickup">Pickup date</option>
      </select>
      <div class="text-[10px] text-slate-400">Sorted by: {{ sortMode }}</div>
    </div>

    <!-- Assigned rentals -->
    <div v-if="optionRentals.length" class="space-y-2">
      <CarRentalCard
        v-for="rental in optionRentals"
        :key="rental.id"
        :rental="rental"
        @delete="deleteRental"
        @edit="onEditRental"
      />
    </div>

    <p v-else class="text-xs text-slate-500">
      No rentals assigned to this option yet.
    </p>

    <!-- Unassigned rentals -->
    <div
      v-if="unassignedRentals.length"
      class="mt-4 border-t border-slate-200 pt-3 space-y-2"
    >
      <div class="text-[11px] font-medium text-slate-600">
        Unassigned rentals for this trip
      </div>

      <CarRentalCard
        v-for="rental in unassignedRentals"
        :key="rental.id"
        :rental="rental"
      >
      </CarRentalCard>
    </div>

    <!-- Editor Sheet -->
    <TripOptionCarRentalEditor
      :open="editorOpen"
      :option="option"
      :rental="selectedRental"
      :trip="trip"
      @close="closeEditor"
      @saved="onSaved"
    />
  </section>
</template>

<script lang="ts" setup>
import type { Trip, TripOption, CarRentalOption } from "@/types/tripTypes";

import CarRentalCard from "@/components/trips/options/_atoms/CarRentalCard.vue";
import TripOptionCarRentalEditor from "@/components/trips/options/TripOptionCarRentalEditor.vue";
import { rentalDaysFromOption } from "@/utils/rentals";

const props = defineProps<{
  trip: Trip;
  option: TripOption;
}>();

const emit = defineEmits<{
  (e: "changed"): void;
}>();

/* ---- UI STATE ---- */
const sortMode = ref<"price" | "days" | "provider" | "pickup">("price");
const editorOpen = ref(false);
const selectedRental = ref<CarRentalOption | null>(null);

/* ---- SAFE DATE HELPER ---- */
const toDateSafe = (v: string | null | undefined): Date =>
  v ? new Date(v) : new Date("1970-01-01T00:00:00Z");

/* ---- SORTING ---- */
function sortRentals(list: CarRentalOption[]) {
  return [...list].sort((a, b) => {
    switch (sortMode.value) {
      case "price":
        return (a.totalCostEUR ?? 0) - (b.totalCostEUR ?? 0);

      case "days":
        return rentalDaysFromOption(a) - rentalDaysFromOption(b);

      case "provider":
        return a.provider.localeCompare(b.provider);

      case "pickup":
        return (
          toDateSafe(a.pickupDate).getTime() -
          toDateSafe(b.pickupDate).getTime()
        );

      default:
        return 0;
    }
  });
}

/* ---- COMPUTED LISTS ---- */
const optionRentals = computed(() =>
  sortRentals(
    props.trip.carRentals.filter((r) => r.tripOptionId === props.option.id),
  ),
);

const unassignedRentals = computed(() =>
  sortRentals(props.trip.carRentals.filter((r) => !r.tripOptionId)),
);

/* ---- ACTIONS ---- */
function openCreate() {
  selectedRental.value = null;
  editorOpen.value = true;
}

function onEditRental(rental: CarRentalOption) {
  selectedRental.value = rental;
  editorOpen.value = true;
}

function closeEditor() {
  editorOpen.value = false;
  selectedRental.value = null;
}

async function assignRental(rentalId: string) {
  try {
    await $fetch(`/api/trips/${props.trip.id}/rentals/${rentalId}/option`, {
      method: "PATCH",
      body: { tripOptionId: props.option.id },
    });
    emit("changed");
  } catch (err) {
    console.error("Failed to assign rental", err);
  }
}

async function deleteRental(rentalId: string) {
  if (!confirm("Delete this car rental?")) return;

  try {
    await $fetch(`/api/trips/${props.trip.id}/rentals/${rentalId}`, {
      method: "DELETE",
    });
    emit("changed");
  } catch (err) {
    console.error("Failed to delete car rental", err);
  }
}

function onSaved() {
  emit("changed");
}
</script>
