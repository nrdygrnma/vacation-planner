<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-base font-medium flex items-center gap-2">
        <UIcon class="size-4" name="i-lucide-plane" /> Flights
      </h3>
      <UButton color="primary" size="sm" @click="openAdd">
        <UIcon class="size-4" name="i-lucide-plus" />
        <span class="ms-1" data-testid="add-flight-btn">Add flight</span>
      </UButton>
    </div>

    <div v-if="pending && !flights.length" class="text-sm text-muted">
      Loading…
    </div>
    <div
      v-else-if="!flights.length && !pending"
      class="text-sm italic text-muted"
    >
      No flights yet. Add one.
    </div>
    <div v-else class="grid gap-2 sm:grid-cols-1 lg:grid-cols-2 relative">
      <!-- Loading overlay for refresh -->
      <div
        v-if="pending"
        class="absolute inset-0 bg-white/50 z-20 flex items-center justify-center rounded-lg"
      >
        <UIcon
          class="size-6 animate-spin text-primary-500"
          name="i-lucide-loader-2"
        />
      </div>
      <FlightCard
        v-for="f in flights"
        :key="f.id"
        :flight="f"
        :selected="trip.selectedFlightId === f.id"
        @delete="onDelete(f)"
        @edit="onEdit(f)"
        @select="onSelect(f)"
      />
    </div>

    <CrudModal
      v-model:open="aeOpen"
      :description="
        aeMode === 'add'
          ? 'Create a new flight for this trip'
          : 'Update flight details'
      "
      :submit-label="submitLabel"
      :title="modalTitle"
      :ui="{ width: 'sm:max-w-4xl' }"
      @cancel="aeOpen = false"
      @submit="onModalSubmit"
    >
      <div data-testid="crud-modal-body">
        <FlightFormNuxt
          :key="aeMode + (aeInitial?.id || '')"
          ref="formRef"
          :initial-values="aeInitial"
          :submit-label="submitLabel"
          @cancel="aeOpen = false"
          @submit="save"
        />
      </div>
    </CrudModal>

    <ConfirmDeleteModal
      v-model:open="isDeleteOpen"
      :loading="deleting"
      :title="'Delete flight?'"
      cancel-label="Cancel"
      confirm-label="Delete"
      description="This action cannot be undone."
      @cancel="isDeleteOpen = false"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script lang="ts" setup>
import FlightCard from "~/components/flights/FlightCard.vue";
import FlightFormNuxt from "~/components/flights/FlightFormNuxt.vue";
import CrudModal from "~/components/base/CrudModal.vue";
import ConfirmDeleteModal from "~/components/base/ConfirmDeleteModal.vue";
import { useFlightsStore } from "~/stores/flights";
import type { FlightOption, Trip } from "~/types/tripTypes";
import { toast } from "vue-sonner";

const props = defineProps<{
  trip: Trip;
}>();

const emit = defineEmits<{
  (e: "refresh"): void;
}>();

const flightsStore = useFlightsStore();

const flights = computed<FlightOption[]>(
  () => flightsStore.byTrip[props.trip.id]?.items ?? [],
);
const pending = computed<boolean>(
  () => flightsStore.byTrip[props.trip.id]?.pending ?? false,
);

onMounted(() => {
  flightsStore.fetchByTrip(props.trip.id);
});

// Add/Edit State
const aeOpen = ref(false);
const aeMode = ref<"add" | "edit">("add");
const aeInitial = ref<any>(null);
const formRef = ref<InstanceType<typeof FlightFormNuxt> | null>(null);

const modalTitle = computed(() =>
  aeMode.value === "add" ? "Add Flight" : "Edit Flight",
);
const submitLabel = computed(() =>
  aeMode.value === "add" ? "Add flight" : "Save changes",
);

const openAdd = () => {
  aeMode.value = "add";
  aeInitial.value = null;
  aeOpen.value = true;
};

const onEdit = (f: FlightOption) => {
  aeMode.value = "edit";

  let extras: any = undefined;
  try {
    if (typeof f.extras === "string") extras = JSON.parse(f.extras);
    else if (f.extras && typeof f.extras === "object") extras = f.extras;
  } catch {}

  aeInitial.value = {
    airline: f.airline,
    flightNumber: f.flightNumber,
    fromAirport: f.fromAirport,
    toAirport: f.toAirport,
    departureDate: f.departureDate,
    arrivalDate: f.arrivalDate,
    returnDepartureDate: f.returnDepartureDate,
    returnArrivalDate: f.returnArrivalDate,
    isRoundTrip: f.isRoundTrip,
    segments: f.segments,
    travelClass: f.travelClass || "economy",
    stops: f.stops ?? 0,
    baseFare: Number(f.baseFare) || 0,
    currencyId: f.currencyId,
    bookingUrl: f.bookingUrl ?? "",
    notes: f.notes ?? "",
    extras,
    id: f.id,
  };
  aeOpen.value = true;
};

const onModalSubmit = () => {
  formRef.value?.submit?.();
};

const save = async (payload: any) => {
  try {
    if (aeMode.value === "edit" && aeInitial.value?.id) {
      await flightsStore.update(props.trip.id, aeInitial.value.id, payload);
      toast.success("Flight updated");
    } else {
      await flightsStore.add(props.trip.id, payload);
      toast.success("Flight added");
    }
    aeOpen.value = false;
  } catch (e) {
    console.error(e);
    toast.error("Failed to save flight");
  }
};

// Delete State
const isDeleteOpen = ref(false);
const deleting = ref(false);
const flightToDelete = ref<FlightOption | null>(null);

const onDelete = (f: FlightOption) => {
  flightToDelete.value = f;
  isDeleteOpen.value = true;
};

const confirmDelete = async () => {
  if (!flightToDelete.value) return;
  try {
    deleting.value = true;
    await flightsStore.remove(props.trip.id, flightToDelete.value.id);
    toast.success("Flight removed");
    isDeleteOpen.value = false;
  } catch (e) {
    console.error(e);
    toast.error("Failed to remove flight");
  } finally {
    deleting.value = false;
    flightToDelete.value = null;
  }
};

const onSelect = async (f: FlightOption) => {
  try {
    await flightsStore.selectFinal(props.trip.id, f.id);
    toast.success("Flight selected for trip");
    emit("refresh");
  } catch (e) {
    console.error(e);
    toast.error("Failed to select flight");
  }
};
</script>
