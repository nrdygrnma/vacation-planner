<template>
  <div class="min-w-[200px] max-w-[240px] overflow-hidden bg-white">
    <!-- Optional image if STOP has accommodation -->
    <div
      v-if="
        stop.type === 'STOP' &&
        stop.selectedAccommodation &&
        stop.selectedAccommodation.images?.[0]?.url
      "
      class="relative w-full h-24"
    >
      <img
        :src="stop.selectedAccommodation.images[0].url"
        class="absolute inset-0 w-full h-full object-cover"
      />
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
      ></div>
      <div class="absolute bottom-2 left-2 right-2 text-white">
        <h3 class="font-bold text-xs leading-tight line-clamp-1 drop-shadow-md">
          {{ stop.selectedAccommodation.name }}
        </h3>
      </div>
    </div>

    <div class="p-2.5">
      <!-- Header with index / icon -->
      <div class="flex items-center gap-2">
        <div
          :class="
            stop.type === 'HUB'
              ? 'bg-primary-600 text-white'
              : 'bg-primary-500 text-white'
          "
          class="shrink-0 size-5 rounded-sm flex items-center justify-center text-[9px] font-bold shadow-sm"
        >
          <span v-if="stop.type !== 'HUB'">{{ index + 1 }}</span>
          <span v-else v-html="hubIcon"></span>
        </div>

        <div class="min-w-0 flex-1">
          <h4 class="font-bold text-gray-900 text-xs truncate leading-none">
            {{ stop.name }}
          </h4>
          <div
            class="flex items-center gap-1 text-[9px] text-gray-500 font-medium mt-0.5"
          >
            <span class="-mt-0.5" v-html="calendarIcon"></span>
            <span>{{ formattedStartDate }} – {{ formattedEndDate }}</span>
          </div>
        </div>
      </div>

      <!-- Accommodation info -->
      <div
        v-if="stop.type === 'STOP' && stop.selectedAccommodation"
        class="mt-2 flex items-center gap-1.5 px-2 py-1 bg-primary-50 rounded text-primary-700"
      >
        <span v-html="bedIcon"></span>
        <span class="text-[10px] font-semibold truncate">{{
          stop.selectedAccommodation.name
        }}</span>
      </div>

      <div
        v-else-if="stop.type === 'STOP'"
        class="mt-2 px-2 py-1 bg-gray-50 rounded border border-gray-100 border-dashed text-center"
      >
        <p class="text-[9px] text-gray-400 font-medium italic">
          No stay selected
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { TripStop } from "~/types/tripTypes";
import { leafletIcon } from "~/utils/leafletIcon";

const props = defineProps<{
  stop: TripStop;
  index: number;
  totalStops: number;
}>();

const formattedStartDate = props.stop.startDate
  ? new Date(props.stop.startDate).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })
  : "N/A";

const formattedEndDate = props.stop.endDate
  ? new Date(props.stop.endDate).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })
  : "N/A";

const hubIcon =
  props.index === 0
    ? leafletIcon("lucide:plane-takeoff", 12, "white")
    : props.index === props.totalStops - 1
      ? leafletIcon("lucide:plane-landing", 12, "white")
      : leafletIcon("lucide:navigation", 12, "white");

const calendarIcon = leafletIcon("lucide:calendar", 10);
const bedIcon = leafletIcon("lucide:bed", 10);
</script>
