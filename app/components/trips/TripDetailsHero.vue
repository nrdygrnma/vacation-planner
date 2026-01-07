<template>
  <figure
    class="relative h-64 md:h-80 rounded-xl overflow-hidden bg-gray-100 shadow-inner"
  >
    <img
      v-if="trip.imageUrl"
      :class="['w-full h-full object-cover', `object-[${coverPosition}]`]"
      :src="trip.imageUrl"
      alt="Trip cover"
    />
    <div
      v-else
      class="w-full h-full bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center"
    >
      <UIcon class="size-16 text-primary-200" name="i-lucide-map" />
    </div>

    <!-- Gradient overlays for better text readability -->
    <div
      class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/30"
    />

    <div class="absolute inset-0 z-10 flex flex-col p-4 md:p-6">
      <slot />
    </div>
  </figure>
</template>

<script lang="ts" setup>
import type { Trip } from "@/types/tripTypes";

defineProps<{ trip: Trip; coverPosition: string }>();
</script>
