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
                {{ f.fromIata }} → {{ f.toIata }}
              </div>
              <div class="text-xs opacity-80">
                {{ formatDT(f.departAt) }} → {{ formatDT(f.arriveAt) }} ·
                {{ humanDuration(f.durationMin) }} · Stops: {{ f.stops }}
                <span v-if="f.price">
                  · {{ f.price }}
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
import FlyonModal from "@/components/modals/FlyonModal.vue";
import FlyonModalTrigger from "@/components/modals/FlyonModalTrigger.vue";
import FlightForm from "@/components/flights/FlightForm.vue";
import { useTripFlights } from "@/composables/useTripFlights";
import type { Currency, Trip } from "@/types/tripTypes";

const props = defineProps<{
  trip: Trip;
  currencies?: Currency[];
}>();

const modalId = `trip-flights-${props.trip.id}`;
const addId = `trip-flights-add-${props.trip.id}`;
const modalRef = ref();
const aeRef = ref();

const {
  flights,
  pending,
  refresh,
  addFlight,
  updateFlight,
  deleteFlight,
  selectFinalFlight,
} = useTripFlights(props.trip.id);

const aeMode = ref<"add" | "edit">("add");
const aeInitial = ref<any>(null);

function edit(f: any) {
  aeMode.value = "edit";
  aeInitial.value = {
    airline: f.airline,
    flightNo: f.flightNo,
    fromIata: f.fromIata,
    toIata: f.toIata,
    departAt: f.departAt?.slice(0, 16),
    arriveAt: f.arriveAt?.slice(0, 16),
    stops: f.stops,
    cabin: f.cabin,
    price: f.price,
    currencyId: f.currencyId,
    bookingUrl: f.bookingUrl,
    notes: f.notes,
    id: f.id,
  };
  aeRef.value?.open?.();
}

async function save(payload: any) {
  if (aeMode.value === "edit" && aeInitial.value?.id) {
    await updateFlight(aeInitial.value.id, payload);
  } else {
    await addFlight(payload);
  }
  aeRef.value?.close?.();
}

async function remove(f: any) {
  await deleteFlight(f.id);
}
async function select(f: any) {
  await selectFinalFlight(f.id);
}

function formatDT(iso?: string) {
  return iso ? new Date(iso).toLocaleString() : "—";
}
function humanDuration(min?: number | null) {
  if (!min && min !== 0) return "—";
  const h = Math.floor(min / 60),
    m = min % 60;
  return `${h}h ${m}m`;
}
function currencyCode(id?: string | null) {
  return props.currencies?.find((c) => c.id === id)?.code || "";
}
</script>
