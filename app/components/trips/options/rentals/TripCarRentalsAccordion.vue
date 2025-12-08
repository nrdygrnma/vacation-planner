<template>
  <div
    :id="`acc-cars-${trip.id}`"
    class="accordion-item border border-gray-200 rounded-md"
  >
    <button
      :aria-controls="`acc-cars-${trip.id}-collapse`"
      aria-expanded="false"
      class="accordion-toggle inline-flex items-center gap-x-4 text-start w-full"
      type="button"
    >
      <span
        class="icon-[lucide--plus] accordion-item-active:hidden text-base-content size-4.5 block shrink-0"
      ></span>
      <span
        class="icon-[lucide--minus] accordion-item-active:block text-base-content size-4.5 hidden shrink-0"
      ></span>
      <span class="inline-flex items-center gap-2 text-sm font-medium">
        <Icon class="size-4" name="lucide:car" />
        Car Rental
        <span v-if="trip.selectedCarRentalId" class="badge badge-soft ms-2"
          >Selected</span
        >
      </span>
    </button>

    <div
      :id="`acc-cars-${trip.id}-collapse`"
      :aria-labelledby="`acc-cars-${trip.id}`"
      class="accordion-content hidden w-full overflow-hidden transition-[height] duration-300"
      role="region"
    >
      <div class="px-5 pb-4 space-y-3 text-sm">
        <p class="opacity-80">
          Car rental management coming next (add, edit, delete, select).
        </p>
        <!-- Future: TripCarRentalsModal or panel -->
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Trip } from "~/types/tripTypes";

defineProps<{ trip: Trip }>();
</script>
