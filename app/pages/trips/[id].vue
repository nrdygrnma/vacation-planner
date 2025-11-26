<template>
  <section v-if="trip" class="space-y-4">
    <button class="btn btn-soft btn-xs" @click="navigateTo('/')">← Back</button>

    <TripHeader :coverPosition="'center_20%'" :trip="trip" />

    <div class="flex items-start justify-between gap-4">
      <div class="space-y-1">
        <h1 class="text-3xl font-light text-primary">{{ trip.title }}</h1>
        <p class="text-sm opacity-80">
          {{ formatDate(trip.startDate) }} → {{ formatDate(trip.endDate) }} ·
          <span class="inline-flex items-center gap-1">
            <Icon class="size-3.5" name="lucide:users" /> {{ trip.people }}
          </span>
          <span class="ms-2"
            >· Currency: {{ trip.currency?.symbol || "¤" }}</span
          >
        </p>
      </div>

      <div class="inline-flex items-center gap-2">
        <TripEditModal :trip="trip" @saved="refresh()" />
        <TripDeleteModal :trip="trip" @deleted="onDeleted" />
      </div>
    </div>

    <!-- Accordions -->
    <div class="space-y-3">
      <!-- Flights accordion -->
      <details class="rounded-lg border bg-base-100" open>
        <summary
          class="cursor-pointer select-none px-4 py-3 text-sm font-medium flex items-center gap-2"
        >
          <Icon class="size-4" name="lucide:plane" />
          Flights
          <span v-if="trip.selectedFlight" class="badge badge-soft ms-2"
            >Selected</span
          >
        </summary>
        <div class="px-4 pb-4 pt-2 space-y-3">
          <!-- Selected flight summary (if any) -->
          <div v-if="trip.selectedFlight" class="text-sm opacity-90">
            <div class="font-medium">
              {{ trip.selectedFlight.airline?.name || "—" }}
              <span v-if="trip.selectedFlight.airline?.symbol">
                ({{ trip.selectedFlight.airline?.symbol }})
              </span>
            </div>
            <div class="text-xs opacity-80">
              {{
                trip.selectedFlight.fromAirport?.symbol ||
                trip.selectedFlight.fromAirport?.name
              }}
              →
              {{
                trip.selectedFlight.toAirport?.symbol ||
                trip.selectedFlight.toAirport?.name
              }}
              · {{ humanDuration(trip.selectedFlight.durationMin) }}
            </div>
          </div>

          <!-- Manage flights modal trigger/content -->
          <TripFlightsModal :trip="trip" />
        </div>
      </details>

      <!-- Car rental accordion (stub to start) -->
      <details class="rounded-lg border bg-base-100">
        <summary
          class="cursor-pointer select-none px-4 py-3 text-sm font-medium flex items-center gap-2"
        >
          <Icon class="size-4" name="lucide:car" />
          Car Rental
          <span v-if="trip.selectedCarRentalId" class="badge badge-soft ms-2"
            >Selected</span
          >
        </summary>
        <div class="px-4 pb-4 pt-2 space-y-3 text-sm">
          <p class="opacity-80">
            Car rental management coming next (add, edit, delete, select).
          </p>
          <!-- Later: <TripCarRentalsPanel :trip="trip" /> -->
        </div>
      </details>

      <!-- Trip stops accordion (stub to start) -->
      <details class="rounded-lg border bg-base-100">
        <summary
          class="cursor-pointer select-none px-4 py-3 text-sm font-medium flex items-center gap-2"
        >
          <Icon class="size-4" name="lucide:map" />
          Trip Stops
        </summary>
        <div class="px-4 pb-4 pt-2 space-y-3 text-sm">
          <p class="opacity-80">
            Plan your itinerary with stops and accommodations.
          </p>
          <!-- Later: <TripStopsPanel :trip="trip" /> -->
        </div>
      </details>
    </div>
  </section>

  <section v-else class="py-10">
    <div v-if="pending" class="opacity-70">Loading…</div>
    <div v-else class="text-error">Trip not found.</div>
  </section>
</template>

<script lang="ts" setup>
import TripEditModal from "@/components/trips/TripEditModal.vue";
import TripDeleteModal from "@/components/trips/TripDeleteModal.vue";
import TripFlightsModal from "@/components/flights/TripFlightsModal.vue";
import { useTrip } from "@/composables/useTrip";
import { useDateUtils } from "@/composables/useDateUtils";
import TripHeader from "~/components/trips/TripHeader.vue";

const route = useRoute();
const tripId = computed(() => String(route.params.id || ""));
const { trip, refresh, pending } = useTrip(tripId.value);

const onDeleted = () => navigateTo("/");

const { formatDate } = useDateUtils();
const humanDuration = (min?: number | null) => {
  if (min == null) return "—";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m}m`;
};

onMounted(() => {
  (window as any).HSOverlay?.autoInit?.();
});
</script>
