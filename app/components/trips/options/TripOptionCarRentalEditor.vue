<template>
  <div
    v-if="open"
    class="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4 z-50"
  >
    <div
      class="w-full max-w-lg bg-white rounded-lg shadow-xl flex flex-col max-h-[90vh]"
    >
      <!-- Header -->
      <header
        class="px-4 py-3 border-b border-slate-200 flex items-center justify-between"
      >
        <h2 class="text-sm font-semibold text-slate-800">
          {{ isEditing ? "Edit Car Rental" : "Add Car Rental" }}
        </h2>

        <button
          class="text-slate-500 hover:text-slate-700 text-xs"
          @click="closeEditor"
        >
          Close
        </button>
      </header>

      <!-- Body -->
      <div class="p-4 space-y-4 overflow-y-auto text-xs flex-1">
        <!-- Provider -->
        <div>
          <label class="block text-slate-700 mb-1">Provider</label>
          <input
            v-model="form.provider"
            class="w-full rounded border border-slate-300 px-2 py-1"
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
              class="w-full rounded border border-slate-300 px-2 py-1"
              type="date"
            />
          </div>

          <div class="flex-1">
            <label class="block text-slate-700 mb-1">Dropoff date</label>
            <input
              v-model="form.dropoffDate"
              class="w-full rounded border border-slate-300 px-2 py-1"
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
              class="w-full rounded border border-slate-300 px-2 py-1 uppercase"
              placeholder="Airport, city…"
              type="text"
            />
          </div>

          <div class="flex-1">
            <label class="block text-slate-700 mb-1">Dropoff location</label>
            <input
              v-model="form.dropoffLocation"
              class="w-full rounded border border-slate-300 px-2 py-1 uppercase"
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
              class="w-full rounded border border-slate-300 px-2 py-1"
              type="number"
            />
          </div>

          <div class="flex-1">
            <label class="block text-slate-700 mb-1">Fees</label>
            <input
              v-model.number="form.fees"
              class="w-full rounded border border-slate-300 px-2 py-1"
              type="number"
            />
          </div>

          <div class="flex-1">
            <label class="block text-slate-700 mb-1">Insurance per day</label>
            <input
              v-model.number="form.insurancePerDay"
              class="w-full rounded border border-slate-300 px-2 py-1"
              type="number"
            />
          </div>
        </div>

        <!-- Booking + Notes -->
        <div>
          <label class="block text-slate-700 mb-1">Booking URL</label>
          <input
            v-model="form.bookingUrl"
            class="w-full rounded border border-slate-300 px-2 py-1"
            placeholder="https://provider.com/booking"
            type="url"
          />
        </div>

        <div>
          <label class="block text-slate-700 mb-1">Notes</label>
          <textarea
            v-model="form.notes"
            class="w-full rounded border border-slate-300 px-2 py-1"
            placeholder="Extra insurance, deposit, etc."
            rows="2"
          ></textarea>
        </div>
      </div>

      <!-- Footer -->
      <footer class="p-4 border-t border-slate-200">
        <button
          class="w-full rounded-md bg-sky-600 text-white px-3 py-2 text-xs font-medium hover:bg-sky-700"
          @click="onSubmit"
        >
          {{ isEditing ? "Save changes" : "Add rental" }}
        </button>
      </footer>
    </div>
  </div>
</template>


<script lang="ts" setup>
import type { Trip, TripOption, CarRentalOption } from "@/types/tripTypes";

const props = defineProps<{
  open: boolean;
  trip: Trip;
  option: TripOption;
  rental?: CarRentalOption | null;
}>();

const emit = defineEmits(["close", "saved"]);

const isEditing = computed(() => !!props.rental);

const form = reactive({
  provider: props.rental?.provider ?? "",
  pickupDate: props.rental?.pickupDate?.slice(0, 10) ?? "",
  dropoffDate: props.rental?.dropoffDate?.slice(0, 10) ?? "",
  pickupLocation: props.rental?.pickupLocation ?? "",
  dropoffLocation: props.rental?.dropoffLocation ?? "",
  baseRate: props.rental?.baseRate ?? 0,
  fees: props.rental?.fees ?? null,
  insurancePerDay: props.rental?.insurancePerDay ?? 0,
  bookingUrl: props.rental?.bookingUrl ?? "",
  notes: props.rental?.notes ?? "",
});

function closeEditor() {
  emit("close");
}

async function onSubmit() {
  try {
    if (isEditing.value && props.rental) {
      await $fetch(`/api/trips/${props.trip.id}/rentals/${props.rental.id}`, {
        method: "PATCH",
        body: {
          ...form,
          currencyId: props.trip.currencyId,
          tripOptionId: props.option.id,
        },
      });
    } else {
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
    closeEditor();
  } catch (e) {
    console.error("Failed to save car rental", e);
  }
}
</script>
