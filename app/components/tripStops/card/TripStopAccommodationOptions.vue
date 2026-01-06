<template>
  <div v-if="isExpanded" class="mt-3 border-t pt-3 space-y-3">
    <div class="flex items-center justify-between px-1">
      <h4 class="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
        Stays for {{ stop.name }}
      </h4>
      <UButton
        color="primary"
        icon="i-lucide-plus"
        label="New"
        size="xs"
        @click="$emit('add')"
      />
    </div>

    <div class="space-y-2">
      <div
        v-if="!stop.accommodations?.length"
        class="text-center py-6 bg-gray-50/50 rounded-lg border border-dashed border-gray-200 text-gray-400 italic text-xs"
      >
        No options added yet.
      </div>
      <div v-else class="space-y-2">
        <TripStopAccommodationOptionItem
          v-for="acc in stop.accommodations"
          :key="acc.id"
          :acc="acc"
          :date-range="dateRange"
          :is-selected="stop.selectedAccommodationId === acc.id"
          :nights="nights"
          :trip-currency="tripCurrency"
          @delete="$emit('delete', $event)"
          @edit="$emit('edit', $event)"
          @select="$emit('select', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { AccommodationOption, Currency, TripStop } from "~/types/tripTypes";
import TripStopAccommodationOptionItem from "./TripStopAccommodationOptionItem.vue";

defineProps<{
  stop: TripStop;
  isExpanded: boolean;
  dateRange: string;
  nights: number;
  tripCurrency?: Currency;
}>();

defineEmits<{
  (e: "add"): void;
  (e: "select", id: string | null): void;
  (e: "edit", acc: AccommodationOption): void;
  (e: "delete", id: string): void;
}>();
</script>
