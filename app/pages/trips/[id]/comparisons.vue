<template>
  <div class="container mx-auto p-4 space-y-6">
    <div class="flex items-center gap-2">
      <UButton
        color="neutral"
        icon="i-lucide-arrow-left"
        size="xs"
        variant="ghost"
        @click="navigateTo(`/trips/${tripId}`)"
      />
      <h1 class="text-2xl font-bold">Trip Comparisons</h1>
    </div>

    <div v-if="pending" class="text-center py-10">
      <UIcon
        class="size-8 animate-spin text-primary"
        name="i-lucide-loader-2"
      />
      <p class="mt-2 text-gray-500">Loading trip data...</p>
    </div>

    <ComparisonsSection v-else-if="trip" :trip="trip" @refresh="refreshTrip" />
  </div>
</template>

<script lang="ts" setup>
import { useTrip } from "@/composables/useTrip";
import ComparisonsSection from "~/components/sections/ComparisonsSection.vue";

const route = useRoute();
const tripId = route.params.id as string;
const { trip, pending, refresh: refreshTrip } = useTrip(tripId);
</script>
