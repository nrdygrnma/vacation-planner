<template>
  <div
    v-if="open"
    class="fixed inset-0 z-40 flex items-center justify-center bg-black/40"
  >
    <div class="w-full max-w-lg rounded-lg bg-white shadow-lg p-4 space-y-4">
      <!-- Header -->
      <header class="flex items-center justify-between gap-4">
        <div>
          <h2 class="text-sm font-semibold text-slate-800">
            Add flight for {{ option.name }}
          </h2>
          <p class="text-xs text-slate-500">Trip: {{ trip.title }}</p>
        </div>
        <button
          class="text-xs text-slate-500 hover:text-slate-800"
          type="button"
          @click="emit('close')"
        >
          ✕
        </button>
      </header>

      <!-- Form -->
      <form class="space-y-3" @submit.prevent="onSubmit">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[11px] font-medium text-slate-600 mb-1">
              Airline
            </label>
            <input
              v-model="form.airline"
              class="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs"
              required
              type="text"
            />
          </div>

          <div>
            <label class="block text-[11px] font-medium text-slate-600 mb-1">
              Flight number
            </label>
            <input
              v-model="form.flightNumber"
              class="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs"
              required
              type="text"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[11px] font-medium text-slate-600 mb-1">
              From (airport code)
            </label>
            <input
              v-model="form.fromAirport"
              class="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs"
              placeholder="VIE"
              required
              type="text"
            />
          </div>

          <div>
            <label class="block text-[11px] font-medium text-slate-600 mb-1">
              To (airport code)
            </label>
            <input
              v-model="form.toAirport"
              class="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs"
              placeholder="SJO"
              required
              type="text"
            />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-[11px] font-medium text-slate-600 mb-1">
              Departure
            </label>
            <input
              v-model="form.departureDate"
              class="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs"
              required
              type="datetime-local"
            />
          </div>

          <div>
            <label class="block text-[11px] font-medium text-slate-600 mb-1">
              Arrival
            </label>
            <input
              v-model="form.arrivalDate"
              class="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs"
              required
              type="datetime-local"
            />
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div>
            <label class="block text-[11px] font-medium text-slate-600 mb-1">
              Class
            </label>
            <select
              v-model="form.travelClass"
              class="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs"
              required
            >
              <option value="economy">Economy</option>
              <option value="premium_economy">Premium economy</option>
              <option value="business">Business</option>
            </select>
          </div>

          <div>
            <label class="block text-[11px] font-medium text-slate-600 mb-1">
              Stops
            </label>
            <input
              v-model.number="form.stops"
              class="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs"
              min="0"
              required
              type="number"
            />
          </div>

          <div>
            <label class="block text-[11px] font-medium text-slate-600 mb-1">
              Base fare (EUR)
            </label>
            <input
              v-model.number="form.baseFare"
              class="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs"
              min="0"
              required
              step="0.01"
              type="number"
            />
          </div>
        </div>

        <div>
          <label class="block text-[11px] font-medium text-slate-600 mb-1">
            Notes (optional)
          </label>
          <textarea
            v-model="form.notes"
            class="w-full rounded-md border border-slate-300 px-2 py-1.5 text-xs"
            placeholder="Why this flight is interesting (airline, layovers, etc.)"
            rows="2"
          ></textarea>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-2 pt-2">
          <button
            class="rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
            type="button"
            @click="emit('close')"
          >
            Cancel
          </button>
          <button
            :disabled="isSaving"
            class="rounded-md bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-700 disabled:opacity-60"
            type="submit"
          >
            {{ isSaving ? "Saving…" : "Save flight" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Trip, TripOption } from "@/types/tripTypes";

const props = defineProps<{
  trip: Trip;
  option: TripOption;
  open: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "saved"): void;
}>();

const isSaving = ref(false);

const form = reactive({
  airline: "",
  flightNumber: "",
  fromAirport: "",
  toAirport: "",
  departureDate: "",
  arrivalDate: "",
  travelClass: "economy" as "economy" | "premium_economy" | "business",
  stops: 0,
  baseFare: 0,
  notes: "",
});

const onSubmit = async () => {
  if (isSaving.value) return;
  isSaving.value = true;

  try {
    await $fetch(`/api/trips/${props.trip.id}/flights`, {
      method: "POST",
      body: {
        airline: form.airline,
        flightNumber: form.flightNumber,
        fromAirport: form.fromAirport,
        toAirport: form.toAirport,
        departureDate: form.departureDate,
        arrivalDate: form.arrivalDate,
        travelClass: form.travelClass,
        stops: form.stops,
        baseFare: form.baseFare,
        currencyId: props.trip.currencyId,
        // For now, assume baseFare is already EUR
        totalCostEUR: form.baseFare,
        notes: form.notes || null,
        // No segments yet from this simple form
        stopOverAirports: null,
        stopOverDurationMinutes: null,
        segments: null,
        tripOptionId: props.option.id,
      },
    });

    emit("saved");
    emit("close");
  } catch (err) {
    console.error("Failed to save flight", err);
    // you can add a toast later if you like
  } finally {
    isSaving.value = false;
  }
};
</script>
