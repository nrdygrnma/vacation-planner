<template>
  <div>
    <FlyonModalTrigger :id="modalId" :buttonClasses="['btn-secondary']">
      <Icon class="size-4" name="lucide:plane" />
      Flights
    </FlyonModalTrigger>

    <FlyonModal :id="modalId" ref="modalRef" title="Trip Flights">
      <div class="space-y-3">
        <div class="flex justify-between items-center">
          <h4 class="font-medium">Saved options</h4>
          <FlyonModalTrigger
            :id="addId"
            :buttonClasses="['btn-primary', 'btn-sm']"
          >
            <Icon class="size-4" name="lucide:plus" /> Add flight
          </FlyonModalTrigger>
        </div>

        <div v-if="pending" class="text-sm opacity-70">Loading...</div>
        <div v-else-if="!flights.length" class="text-sm opacity-70">
          No flights yet. Add one.
        </div>

        <div v-else class="grid gap-2">
          <div
            v-for="f in flights"
            :key="f.id"
            class="card card-compact border p-3 flex items-center justify-between"
          >
            <div class="text-sm">
              <div class="font-medium">
                {{ f.airline || "—" }} {{ f.flightNumber || "" }} ·
                {{ f.fromAirport }} → {{ f.toAirport }}
              </div>
              <div class="text-xs opacity-80">
                {{ formatDT(f.departureDate) }} →
                {{ formatDT(f.arrivalDate) }} ·
                {{ humanDuration(f.durationMin) }} · Stops: {{ f.stops }}
                <span v-if="f.totalCostEUR">
                  · {{ f.totalCostEUR }}
                  <small v-if="f.currencyId"
                    >({{ currencyCode(f.currencyId) }})</small
                  ></span
                >
              </div>
            </div>
            <div class="flex items-center gap-1">
              <button class="btn btn-soft btn-sm" @click="edit(f)">Edit</button>
              <button class="btn btn-soft btn-error btn-sm" @click="remove(f)">
                Delete
              </button>
              <button class="btn btn-primary btn-sm" @click="select(f)">
                Select
              </button>
            </div>
          </div>
        </div>
      </div>

      <template #footer="{ close }">
        <button class="btn btn-ghost btn-sm" @click="close">Close</button>
      </template>
    </FlyonModal>

    <FlyonModal
      :id="addId"
      ref="aeRef"
      :title="aeMode === 'add' ? 'Add Flight' : 'Edit Flight'"
      size="xl"
    >
      <FlightForm
        :currencies="currencies"
        :initialValues="aeInitial"
        @cancel="aeRef?.close"
        @submit="save"
      />
    </FlyonModal>
  </div>
</template>

<script lang="ts" setup>
import FlyonModal from "~/components/base/modals/FlyonModal.vue";
import FlyonModalTrigger from "~/components/base/modals/FlyonModalTrigger.vue";
import FlightForm from "~/components/flights/FlightForm.vue";
import { useFlightsStore } from "~/stores/flights";
import type { Currency, FlightOption, Trip } from "~/types/tripTypes";

const props = defineProps<{
  trip: Trip;
  currencies?: Currency[];
}>();

const flightsStore = useFlightsStore();

const { byTrip } = storeToRefs(flightsStore);

const bucket = computed(
  () =>
    byTrip.value[props.trip.id] ?? {
      items: [] as FlightOption[],
      pending: false,
    },
);

const flights = computed<FlightOption[]>(
  () => (flightsStore.byTrip[props.trip.id]?.items ?? []) as FlightOption[],
);
const pending = computed<boolean>(
  () => flightsStore.byTrip[props.trip.id]?.pending ?? false,
);

const modalId = `trip-flights-${props.trip.id}`;
const addId = `trip-flights-add-${props.trip.id}`;
const modalRef = ref();
const aeRef = ref();

const aeMode = ref<"add" | "edit">("add");
const aeInitial = ref<any>(null);

const edit = (f: any) => {
  aeMode.value = "edit";

  // Parse extras if it’s stored as a JSON string
  let extras: any = undefined;
  try {
    if (typeof f.extras === "string") extras = JSON.parse(f.extras);
    else if (f.extras && typeof f.extras === "object") extras = f.extras;
  } catch {}

  aeInitial.value = {
    // FlightForm expects nested objects for airline/airports in initialValues
    airline: { name: f.airline ?? "", symbol: f.flightNumber ?? "" },
    fromAirport: { name: "", symbol: f.fromAirport ?? "" },
    toAirport: { name: "", symbol: f.toAirport ?? "" },

    // Provide full ISO strings so FlightForm can derive both date and time
    departureDate: f.departureDate,
    arrivalDate: f.arrivalDate,

    travelClass: f.travelClass || "economy",
    stops: f.stops ?? 0,
    baseFare: Number(f.baseFare) || 0,
    currencyId: f.currencyId,
    bookingUrl: f.bookingUrl ?? "",
    notes: f.notes ?? "",
    extras, // object or undefined

    // Optional helpers the form can show but won’t strictly need to edit
    totalCostEUR: Number(f.totalCostEUR) || 0,
    durationMin: f.durationMin ?? undefined,

    // Pass through stopover info if present so the form can show it
    stopOverDurationMinutes: (f as any).stopOverDurationMinutes ?? undefined,
    stopOverAirports: (f as any).stopOverAirports ?? undefined,
    segments: (f as any).segments ?? undefined,

    // Keep id so save() knows whether it’s an edit
    id: f.id,
  };

  aeRef.value?.open?.();
};

const save = async (payload: any) => {
  if (aeMode.value === "edit" && aeInitial.value?.id) {
    await flightsStore.update(props.trip.id, aeInitial.value.id, payload);
  } else {
    await flightsStore.add(props.trip.id, payload);
  }
  aeRef.value?.close?.();
};

const remove = async (f: any) => {
  await flightsStore.remove(props.trip.id, f.id);
};
const select = async (f: any) => {
  await flightsStore.selectFinal(props.trip.id, f.id);
};

const formatDT = (iso?: string) => {
  return iso ? new Date(iso).toLocaleString() : "—";
};
const humanDuration = (min?: number | null) => {
  if (!min && min !== 0) return "—";
  const h = Math.floor(min / 60),
    m = min % 60;
  return `${h}h ${m}m`;
};
const currencyCode = (id?: string | null) => {
  return props.currencies?.find((c) => c.id === id)?.symbol || "";
};

onMounted(() => flightsStore.fetchByTrip(props.trip.id));
</script>
