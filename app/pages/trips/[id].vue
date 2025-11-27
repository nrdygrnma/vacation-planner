<template>
  <section v-if="trip" class="space-y-4">
    <TripDetailsHero :coverPosition="'center_20%'" :trip="trip" />

    <div class="flex items-start justify-between gap-4">
      <TripDetailsHeader :trip="trip" @back="navigateTo('/')" />
      <div class="inline-flex items-center gap-2">
        <TripEditModal :trip="trip" @saved="refresh()" />
        <TripDeleteModal :trip="trip" @deleted="onDeleted" />
      </div>
    </div>

    <div class="accordion divide-neutral/20 divide-y space-y-2">
      <TripFlightsAccordion :trip="trip" />
      <TripCarRentalsAccordion :trip="trip" />
      <TripStopsAccordion :trip="trip" />
    </div>
  </section>

  <section v-else class="py-10">
    <div v-if="pending" class="opacity-70">Loading…</div>
    <div v-else class="text-error">Trip not found.</div>
  </section>
</template>

<script lang="ts" setup>
import TripEditModal from "~/components/trips/modals/TripEditModal.vue";
import TripDeleteModal from "~/components/trips/modals/TripDeleteModal.vue";
import TripDetailsHero from "~/components/trips/TripDetailsHero.vue";
import TripDetailsHeader from "~/components/trips/TripDetailsHeader.vue";
import TripCarRentalsAccordion from "~/components/carRentals/TripCarRentalsAccordion.vue";
import TripFlightsAccordion from "~/components/flights/TripFlightsAccordion.vue";
import { useTrip } from "@/composables/useTrip";
import { nextTick, watch } from "vue";

const route = useRoute();
const tripId = computed(() => String(route.params.id || ""));
const { trip, refresh, pending } = useTrip(tripId.value);

const onDeleted = () => navigateTo("/");

// Ensure Flyon/HSOverlay overlays are initialized after content is rendered.
const initOverlays = async () => {
  await nextTick();
  // Double-tick in case children (modals/triggers) render after trip data is set.
  await nextTick();
  (window as any).HSOverlay?.autoInit?.();
  // Some versions require a slight delay after DOM paint.
  setTimeout(() => (window as any).HSOverlay?.autoInit?.(), 0);
};

onMounted(() => {
  initOverlays();
});

// Re-init when trip data arrives or changes so the Edit/Delete buttons work immediately.
watch(
  () => trip?.value?.id,
  () => initOverlays(),
  { immediate: false }
);
</script>
