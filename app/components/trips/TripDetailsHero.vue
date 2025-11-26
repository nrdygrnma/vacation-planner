<template>
  <figure
    v-if="trip.imageUrl"
    class="relative h-54 rounded-md overflow-hidden bg-base-200"
  >
    <img
      :class="['w-full h-full object-cover', `object-[${coverPosition}]`]"
      :src="trip.imageUrl"
      alt="Trip cover"
    />
    <div
      class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"
    />
  </figure>
</template>

<script lang="ts" setup>
import type { Trip } from "@/types/tripTypes";

defineProps<{ trip: Trip; coverPosition: string }>();
</script>
