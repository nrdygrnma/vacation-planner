<template>
  <section class="space-y-3">
    <header class="flex items-center justify-between gap-4">
      <div>
        <h2 class="text-sm font-semibold text-slate-800">Car Rentals</h2>
        <p class="text-xs text-slate-500">Option: {{ option.name }}</p>
      </div>

      <div class="flex items-center gap-2">
        <select
          v-model="sortMode"
          class="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700"
        >
          <option value="price">Price</option>
          <option value="provider">Provider</option>
          <option value="pickup">Pickup date</option>
          <option value="duration">Duration</option>
        </select>

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
        <template #actions>
          <button
            class="rounded-md border border-sky-500 px-2 py-1 text-[11px] text-sky-700 hover:bg-sky-50"
            @click="assignRental(rental.id)"
          >
            Assign
          </button>

          <button
            class="rounded-md border border-red-500 px-2 py-1 text-[11px] text-red-600 hover:bg-red-50"
            @click="deleteRental(rental.id)"
          >
            Delete
          </button>
        </template>
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

const props = defineProps<{
  trip: Trip;
  option: TripOption;
}>();

const emit = defineEmits<{
  (e: "changed"): void;
}>();

const sortMode = ref<"price" | "provider" | "pickup" | "duration">("price");

/* STATE */
const editorOpen = ref(false);
const selectedRental = ref<CarRentalOption | null>(null);

/* COMPUTED LISTS */
const optionRentals = computed(() =>
  sortRentals(
    props.trip.carRentals.filter((r) => r.tripOptionId === props.option.id),
  ),
);

const unassignedRentals = computed(() =>
  sortRentals(props.trip.carRentals.filter((r) => !r.tripOptionId)),
);

/* ACTIONS */
function openCreate() {
  selectedRental.value = null;
  editorOpen.value = true;
}

function onEditRental(rental: CarRentalOption) {
  selectedRental.value = rental;
  editorOpen.value = true;
}

function sortRentals(list: CarRentalOption[]) {
  return [...list].sort((a, b) => {
    switch (sortMode.value) {
      case "price":
        return (a.totalCostEUR ?? 0) - (b.totalCostEUR ?? 0);

      case "provider":
        return a.provider.localeCompare(b.provider);

      case "pickup":
        return (
          toDateSafe(a.pickupDate).getTime() -
          toDateSafe(b.pickupDate).getTime()
        );

      case "duration": {
        const startA = toDateSafe(a.pickupDate).getTime();
        const endA = toDateSafe(a.dropoffDate).getTime();
        const startB = toDateSafe(b.pickupDate).getTime();
        const endB = toDateSafe(b.dropoffDate).getTime();
        return endA - startA - (endB - startB);
      }

      default:
        return 0;
    }
  });
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

function toDateSafe(v: string | null | undefined): Date {
  return v ? new Date(v) : new Date("1970-01-01T00:00:00Z");
}
</script>
