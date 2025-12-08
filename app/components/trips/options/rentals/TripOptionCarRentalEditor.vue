<template>
  <div class="p-4 space-y-4 text-xs">
    <!-- Provider -->
    <div>
      <label class="block text-slate-700 mb-1">Provider</label>
      <input
        v-model="form.provider"
        class="input input-sm input-bordered w-full"
        placeholder="Hertz, Europcar…"
        type="text"
      />
    </div>

    <!-- Dates -->
    <div class="flex gap-2">
      <div class="flex-1">
        <label class="block text-slate-700 mb-1">Pickup date</label>
        <input
          v-model="form.pickupDate"
          class="input input-sm input-bordered w-full"
          type="date"
        />
      </div>

      <div class="flex-1">
        <label class="block text-slate-700 mb-1">Dropoff date</label>
        <input
          v-model="form.dropoffDate"
          class="input input-sm input-bordered w-full"
          type="date"
        />
      </div>
    </div>

    <!-- Locations -->
    <div class="flex gap-2">
      <div class="flex-1">
        <label class="block text-slate-700 mb-1">Pickup location</label>
        <input
          v-model="form.pickupLocation"
          class="input input-sm input-bordered w-full uppercase"
          placeholder="Airport, city…"
          type="text"
        />
      </div>

      <div class="flex-1">
        <label class="block text-slate-700 mb-1">Dropoff location</label>
        <input
          v-model="form.dropoffLocation"
          class="input input-sm input-bordered w-full uppercase"
          placeholder="Airport, city…"
          type="text"
        />
      </div>
    </div>

    <!-- Costs -->
    <div class="flex gap-2">
      <div class="flex-1">
        <label class="block text-slate-700 mb-1">Base rate (€)</label>
        <input
          v-model.number="form.baseRate"
          class="input input-sm input-bordered w-full"
          type="number"
        />
      </div>

      <div class="flex-1">
        <label class="block text-slate-700 mb-1">Fees</label>
        <input
          v-model.number="form.fees"
          class="input input-sm input-bordered w-full"
          placeholder="optional"
          type="number"
        />
      </div>

      <div class="flex-1">
        <label class="block text-slate-700 mb-1">Insurance / day</label>
        <input
          v-model.number="form.insurancePerDay"
          class="input input-sm input-bordered w-full"
          type="number"
        />
      </div>
    </div>

    <!-- Booking URL -->
    <div>
      <label class="block text-slate-700 mb-1">Booking URL</label>
      <input
        v-model="form.bookingUrl"
        class="input input-sm input-bordered w-full"
        placeholder="https://example.com/reservation"
        type="url"
      />
    </div>

    <!-- Notes -->
    <div>
      <label class="block text-slate-700 mb-1">Notes</label>
      <textarea
        v-model="form.notes"
        class="textarea textarea-sm textarea-bordered w-full"
        placeholder="Extra insurance, deposit info, etc."
        rows="2"
      ></textarea>
    </div>

    <div class="flex justify-end gap-2 mt-4">
      <button class="btn btn-sm btn-ghost" data-overlay="#car-rental-modal">
        Cancel
      </button>

      <button class="btn btn-sm btn-primary" @click="submit">Save</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { CarRentalOption, Trip, TripOption } from "@/types/tripTypes";

const props = defineProps<{
  trip: Trip;
  option: TripOption;
  rental?: CarRentalOption | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "saved"): void;
}>();

type RentalForm = {
  provider: string;
  pickupDate: string;
  dropoffDate: string;
  pickupLocation: string;
  dropoffLocation: string;
  baseRate: number;
  fees: number | null;
  insurancePerDay: number;
  bookingUrl: string;
  notes: string;
};

// ----------------------------------------------------------------------------
// FORM STATE
// ----------------------------------------------------------------------------

const form = reactive<RentalForm>({
  provider: "",
  pickupDate: "",
  dropoffDate: "",
  pickupLocation: "",
  dropoffLocation: "",
  baseRate: 0,
  fees: null,
  insurancePerDay: 0,
  bookingUrl: "",
  notes: "",
});

// ----------------------------------------------------------------------------
// APPLY RENTAL TO FORM
// ----------------------------------------------------------------------------

function applyRentalToForm(rental?: CarRentalOption | null) {
  if (!rental) {
    // Reset form for "Create"
    Object.assign(form, {
      provider: "",
      pickupDate: "",
      dropoffDate: "",
      pickupLocation: "",
      dropoffLocation: "",
      baseRate: 0,
      fees: null,
      insurancePerDay: 0,
      bookingUrl: "",
      notes: "",
    });
    return;
  }

  Object.assign(form, {
    provider: rental.provider ?? "",
    pickupDate: rental.pickupDate?.slice(0, 10) ?? "",
    dropoffDate: rental.dropoffDate?.slice(0, 10) ?? "",
    pickupLocation: rental.pickupLocation ?? "",
    dropoffLocation: rental.dropoffLocation ?? "",
    baseRate: rental.baseRate ?? 0,
    fees: rental.fees ?? null,
    insurancePerDay: rental.insurancePerDay ?? 0,
    bookingUrl: rental.bookingUrl ?? "",
    notes: rental.notes ?? "",
  });
}

watch(
  () => props.rental,
  (rental) => applyRentalToForm(rental),
  { immediate: true },
);

// ----------------------------------------------------------------------------
// SUBMIT
// ----------------------------------------------------------------------------

async function submit() {
  try {
    if (props.rental) {
      // UPDATE
      await $fetch(`/api/trips/${props.trip.id}/rentals/${props.rental.id}`, {
        method: "PATCH",
        body: {
          ...form,
          currencyId: props.trip.currencyId,
          tripOptionId: props.option.id,
        },
      });
    } else {
      // CREATE
      await $fetch(`/api/trips/${props.trip.id}/rentals`, {
        method: "POST",
        body: {
          ...form,
          currencyId: props.trip.currencyId,
          tripOptionId: props.option.id,
        },
      });
    }

    emit("saved");
  } catch (err) {
    console.error("Failed to save car rental", err);
  }
}
</script>
