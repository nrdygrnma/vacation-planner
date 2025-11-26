<template>
  <div>
    <FlyonModalTrigger id="modalId" :buttonClasses="['btn-primary']">
      <Icon class="size-4" name="lucide:map-pin-plus" />
      Create flight
    </FlyonModalTrigger>

    <FlyonModal id="modalId" ref="modalRef" title="Create Flight">
      <FlightForm
        :key="formKey"
        :initialValues="prefill"
        @cancel="onCancel"
        @submit="submit"
      />
    </FlyonModal>
  </div>
</template>

<script lang="ts" setup>
import FlyonModal from "~/components/modals/FlyonModal.vue";
import FlyonModalTrigger from "~/components/modals/FlyonModalTrigger.vue";
import FlightForm from "~/components/flights/FlightForm.vue";
import { toast } from "vue-sonner";

const props = defineProps<{
  tripId: string;
  defaultCurrencyId?: string;
}>();

const emit = defineEmits(["saved"]);

const modalRef = ref();
const formKey = ref(0);
const resetForm = () => {
  formKey.value++;
};

const modalId = `flight-create-${props.tripId}`;

const prefill = computed(() => ({
  currencyId: props.defaultCurrencyId ?? "",
}));

const onCancel = () => {
  modalRef.value?.close?.();
  resetForm();
};

const computeDurationMin = (departure?: string, arrival?: string) => {
  if (!departure || !arrival) return null;
  const d = new Date(departure).getTime();
  const a = new Date(arrival).getTime();
  if (!Number.isFinite(d) || !Number.isFinite(a) || a < d) return null;
  return Math.max(0, Math.round((a - d) / 60000));
};

const mapFormToApi = (data: any) => {
  const extras = {
    seatReservation: Number(data.extrasSeatReservation) || 0,
    checkedBaggage: Number(data.extrasCheckedBaggage) || 0,
    other: Number(data.extrasOther) || 0,
  };
  const hasExtras =
    extras.seatReservation || extras.checkedBaggage || extras.other;

  return {
    airline: (data.airlineName || "").trim(),
    fromAirport: (data.fromAirport || "").trim(),
    toAirport: (data.toAirport || "").trim(),
    departureDate: data.departureDate || null,
    arrivalDate: data.arrivalDate || null,
    travelClass: data.travelClass,
    stops: Number(data.stopsCount) || 0,
    baseFare: Number(data.baseFare) || 0,
    currencyId: data.currencyId || props.defaultCurrencyId || "",
    totalCostEUR: Number(data.totalCostEUR) || 0,
    bookingUrl: data.bookingUrl || null,
    notes: data.notes || null,
    durationMin: computeDurationMin(data.departureDate, data.arrivalDate),
    extras: hasExtras ? JSON.stringify(extras) : null,
  };
};

const submit = async (data: any) => {
  try {
    const body = mapFormToApi(data);

    if (!props.tripId) {
      createError("Missing tripId for flight creation");
    }

    await $fetch(`/api/trips/${props.tripId}/flights`, {
      method: "POST",
      body,
    });

    modalRef.value?.close?.();
    resetForm();

    emit("saved");
    toast.success("Flight created");
  } catch (e) {
    console.error(e);
    toast.error("Failed to create flight");
  }
};
</script>
