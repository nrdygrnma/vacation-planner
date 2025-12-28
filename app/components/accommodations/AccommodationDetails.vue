<script lang="ts" setup>
import type { AccommodationOption } from "~/types/tripTypes";

defineProps<{
  accommodation: AccommodationOption;
  dateRange: string;
}>();

const formatCurrency = (
  amount: number | string | null | undefined,
  acc: AccommodationOption,
) => {
  const value = Number(amount) || 0;
  if (acc.currency?.symbol) {
    return `${acc.currency.symbol}${value.toFixed(2)}`;
  }
  return `€${value.toFixed(2)}`;
};
</script>

<template>
  <div
    class="overflow-hidden rounded-lg bg-white shadow-xl ring-1 ring-gray-200 w-72"
  >
    <!-- Image Carousel -->
    <div v-if="accommodation.images?.length" class="border-b border-gray-100">
      <AccommodationsImageCarousel :images="accommodation.images" />
    </div>
    <div
      v-else
      class="w-full h-40 bg-gray-100 flex items-center justify-center border-b border-gray-100"
    >
      <UIcon class="size-10 text-gray-300" name="i-lucide-bed" />
    </div>

    <div class="p-4 space-y-4 text-sm">
      <div>
        <span
          class="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-0.5"
          >Accommodation</span
        >
        <p class="font-semibold text-gray-900 leading-tight">
          {{ accommodation.name }}
        </p>
        <p class="text-[11px] text-gray-500 font-medium">
          {{ accommodation.roomType || "Standard" }} ·
          {{ accommodation.provider || "Direct" }}
        </p>
      </div>

      <div class="grid grid-cols-2 gap-4 border-t pt-3">
        <div>
          <span
            class="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-0.5"
            >Dates</span
          >
          <p class="text-[11px] text-gray-700 font-medium">
            {{ dateRange }}
          </p>
        </div>
        <div>
          <span
            class="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-0.5"
            >Rate</span
          >
          <p class="text-[11px] text-gray-700 font-medium">
            {{ formatCurrency(accommodation.nightlyRate, accommodation) }} /
            night
          </p>
        </div>
      </div>

      <!-- Booking Link -->
      <div v-if="accommodation.url" class="border-t pt-3">
        <UButton
          :to="accommodation.url"
          block
          class="text-[11px]"
          color="primary"
          icon="i-lucide-external-link"
          size="xs"
          target="_blank"
        >
          View Booking Website
        </UButton>
      </div>

      <div
        v-if="accommodation.notes"
        class="bg-gray-50 p-2.5 rounded-md border border-gray-100"
      >
        <span
          class="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-1"
          >Notes</span
        >
        <p
          class="text-[11px] leading-relaxed text-gray-600 italic whitespace-pre-wrap"
        >
          "{{ accommodation.notes }}"
        </p>
      </div>
    </div>
  </div>
</template>
