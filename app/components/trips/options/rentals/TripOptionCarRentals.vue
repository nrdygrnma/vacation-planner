<template>
  <section class="space-y-3">
    <header class="flex items-center justify-between gap-4">
      <div>
        <h2 class="text-sm font-semibold text-slate-800">Car Rentals</h2>
        <p class="text-xs text-slate-500">Option: {{ option.name }}</p>
      </div>

      <div class="flex items-center gap-2">
        <!-- Use unique id and reset state before opening -->
        <FlyonModalTrigger :id="modalId" @click="openCreate">
          <span class="text-base leading-none">＋</span>
          <span>Add rental</span>
        </FlyonModalTrigger>
      </div>
    </header>

    <!-- sorting UI omitted for brevity -->

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

    <FlyonModal
      :id="modalId"
      ref="rentalModal"
      :keyboard="false"
      backdrop="static"
      title="Car Rental"
    >
      <TripOptionCarRentalEditor
        :option="option"
        :rental="selectedRental"
        :trip="trip"
        @saved="onSaved"
      />
    </FlyonModal>
  </section>
</template>

<script lang="ts" setup>
import type { CarRentalOption, Trip, TripOption } from "~/types/tripTypes";
import { rentalDaysFromOption } from "~/utils/rentals";
import FlyonModal from "~/components/common/flyon/FlyonModal.vue";
import FlyonModalTrigger from "~/components/common/flyon/FlyonModalTrigger.vue";
import CarRentalCard from "~/components/trips/options/_atoms/CarRentalCard.vue";
import TripOptionCarRentalEditor from "~/components/trips/options/rentals/TripOptionCarRentalEditor.vue";

const props = defineProps<{ trip: Trip; option: TripOption }>();
const emit = defineEmits<{ (e: "changed"): void }>();

const modalId = computed(() => `car-rental-modal-${props.option.id}`);

const rentalModal = ref<any>(null);
const sortMode = ref<"price" | "days" | "provider" | "pickup">("price");
const selectedRental = ref<CarRentalOption | null>(null);

const optionRentals = computed(() =>
  sortRentals(
    props.trip.carRentals.filter((r) => r.tripOptionId === props.option.id),
  ),
);

function sortRentals(list: CarRentalOption[]) {
  // … existing sort switch
  return [...list].sort((a, b) => {
    // same implementation you already have
    switch (sortMode.value) {
      case "price":
        return (a.totalCostEUR ?? 0) - (b.totalCostEUR ?? 0);
      case "days":
        return rentalDaysFromOption(a) - rentalDaysFromOption(b);
      case "provider":
        return a.provider.localeCompare(b.provider);
      case "pickup":
        return (
          new Date(a.pickupDate || 0).getTime() -
          new Date(b.pickupDate || 0).getTime()
        );
      default:
        return 0;
    }
  });
}

const openCreate = () => {
  selectedRental.value = null;
  rentalModal.value?.open();
};

const onEditRental = (rental: CarRentalOption) => {
  selectedRental.value = rental;
  rentalModal.value?.open();
};

const onSaved = () => {
  emit("changed");
  rentalModal.value?.close();
  window.HSOverlay.close("#car-rental-modal");
};

const deleteRental = async (rentalId: string) => {
  if (!confirm("Delete this car rental?")) return;
  try {
    await $fetch(`/api/trips/${props.trip.id}/rentals/${rentalId}`, {
      method: "DELETE",
    });
    emit("changed");
  } catch (err) {
    console.error("Failed to delete car rental", err);
  }
};
</script>
