<template>
  <form class="space-y-4" novalidate @submit.prevent="onSubmit">
    <!-- Airline -->
    <div class="grid grid-cols-2 gap-2">
      <label class="label-text">Airline</label>
      <input
        v-model="form.airlineName"
        :aria-describedby="errors.airlineName ? 'error-airlineName' : undefined"
        :aria-invalid="!!errors.airlineName"
        :class="['input w-full', errors.airlineName && 'input-error']"
        required
        type="text"
        @blur="validateField('airlineName')"
      />
      <p
        v-if="errors.airlineName"
        id="error-airlineName"
        class="mt-1 text-xs text-error"
      >
        {{ errors.airlineName }}
      </p>
    </div>

    <!-- Route -->
    <div class="grid grid-cols-2 gap-2">
      <label class="label-text">From Airport</label>
      <input
        v-model="form.fromAirport"
        :aria-describedby="errors.fromAirport ? 'error-fromAirport' : undefined"
        :aria-invalid="!!errors.fromAirport"
        :class="['input w-full', errors.fromAirport && 'input-error']"
        required
        type="text"
        @blur="validateField('fromAirport')"
      />
      <p
        v-if="errors.fromAirport"
        id="error-fromAirport"
        class="mt-1 text-xs text-error"
      >
        {{ errors.fromAirport }}
      </p>
    </div>

    <div class="grid grid-cols-2 gap-2">
      <label class="label-text">To Airport</label>
      <input
        v-model="form.toAirport"
        :aria-describedby="errors.toAirport ? 'error-toAirport' : undefined"
        :aria-invalid="!!errors.toAirport"
        :class="['input w-full', errors.toAirport && 'input-error']"
        required
        type="text"
        @blur="validateField('toAirport')"
      />
      <p
        v-if="errors.toAirport"
        id="error-toAirport"
        class="mt-1 text-xs text-error"
      >
        {{ errors.toAirport }}
      </p>
    </div>

    <!-- Times -->
    <div class="grid grid-cols-2 gap-2">
      <div>
        <label class="label-text">Departure Date</label>
        <input
          v-model="form.departureDate"
          :aria-describedby="
            errors.departureDate ? 'error-departureDate' : undefined
          "
          :aria-invalid="!!errors.departureDate"
          :class="['input w-full', errors.departureDate && 'input-error']"
          required
          type="date"
          @blur="validateField('departureDate')"
        />
        <p
          v-if="errors.departureDate"
          id="error-departureDate"
          class="mt-1 text-xs text-error"
        >
          {{ errors.departureDate }}
        </p>
      </div>
      <div>
        <label class="label-text">Arrival Date</label>
        <input
          v-model="form.arrivalDate"
          :aria-describedby="
            errors.arrivalDate ? 'error-arrivalDate' : undefined
          "
          :aria-invalid="!!errors.arrivalDate"
          :class="['input w-full', errors.arrivalDate && 'input-error']"
          required
          type="date"
          @blur="validateField('arrivalDate')"
        />
        <p
          v-if="errors.arrivalDate"
          id="error-arrivalDate"
          class="mt-1 text-xs text-error"
        >
          {{ errors.arrivalDate }}
        </p>
      </div>
    </div>

    <!-- Travel meta -->
    <div class="grid grid-cols-2 gap-2">
      <div>
        <label class="label-text">Travel Class</label>
        <select v-model="form.travelClass" class="select select-sm" required>
          <option disabled value="">Travel class</option>
          <option value="economy">Economy</option>
          <option value="premium_economy">Premium Economy</option>
          <option value="business">Business</option>
        </select>
      </div>

      <div>
        <label class="label-text">Stops</label>
        <input
          v-model="form.stopsCount"
          :aria-describedby="errors.stopsCount ? 'error-stopsCount' : ''"
          :aria-invalid="!!errors.stopsCount"
          :class="['input w-full', errors.stopsCount && 'input-error']"
          min="0"
          required
          step="1"
          type="number"
          @blur="validateField('stopsCount')"
        />
        <p
          v-if="errors.stopsCount"
          id="error-stopsCount"
          class="mt-1 text-xs text-error"
        >
          {{ errors.stopsCount }}
        </p>
      </div>
    </div>

    <!-- Pricing -->
    <div class="grid grid-cols-2 gap-2">
      <div>
        <label class="label-text">Base Fare</label>
        <input
          v-model="form.baseFare"
          :aria-describedby="errors.baseFare ? 'error-baseFare' : ''"
          :aria-invalid="!!errors.baseFare"
          :class="['input w-full', errors.baseFare && 'input-error']"
          min="0"
          required
          step="0.01"
          type="number"
          @blur="validateField('baseFare')"
        />
        <p
          v-if="errors.baseFare"
          id="error-baseFare"
          class="mt-1 text-xs text-error"
        >
          {{ errors.baseFare }}
        </p>
      </div>
      <div>
        <label class="label-text">Currency</label>
        <select
          v-model="form.currencyId"
          :aria-describedby="errors.currencyId ? 'error-currency' : undefined"
          :aria-invalid="!!errors.currencyId"
          :class="['select w-full', errors.currencyId && 'select-error']"
          required
          @blur="validateField('currencyId')"
          @change="validateField('currencyId')"
        >
          <option disabled value="">Choose currency</option>
          <option v-for="c in currencies" :key="c.id" :value="c.id">
            {{ c.symbol }} — {{ c.name }}
          </option>
        </select>
        <p
          v-if="errors.currencyId"
          id="error-currency"
          class="mt-1 text-xs text-error"
        >
          {{ errors.currencyId }}
        </p>
      </div>
    </div>

    <!-- Extras -->
    <fieldset class="grid grid-cols-3 gap-2">
      <div class="w-1/2">
        <label class="label-text">Seat Reservation</label>
        <input
          v-model.number="form.extrasSeatReservation"
          class="input w-full"
          type="number"
        />
      </div>
      <div class="w-1/3">
        <label class="label-text">Checked Baggage</label>
        <input
          v-model.number="form.extrasCheckedBaggage"
          class="input w-full"
          type="number"
        />
      </div>
      <div class="w-1/2">
        <label class="label-text">Other</label>
        <input
          v-model.number="form.extrasOther"
          class="input w-full"
          type="number"
        />
      </div>
    </fieldset>

    <!-- Links & notes -->
    <div class="w-full">
      <label class="label-text">Booking URL</label>
      <input v-model="form.bookingUrl" class="input w-full" type="text" />
    </div>
    <div class="w-full">
      <label class="label-text">Notes</label>
      <textarea
        v-model.trim="form.notes"
        class="textarea textarea-sm"
        placeholder="Notes"
        rows="2"
      ></textarea>
    </div>

    <!-- Optional normalized total in EUR -->
    <div class="grid grid-cols-2 gap-2">
      <input
        :value="humanDuration(computedDurationMin)"
        class="input input-sm"
        disabled
      />
    </div>

    <div class="flex justify-end gap-2 pt-2">
      <button
        class="btn btn-ghost btn-sm"
        type="button"
        @click="$emit('cancel')"
      >
        Cancel
      </button>
      <button class="btn btn-primary btn-sm" type="submit">Save</button>
    </div>
  </form>
</template>

<script lang="ts" setup>
import type { Currency, FlightOption } from "@/types/tripTypes";

const props = defineProps<{
  initialValues?: Partial<{
    airline: { name: string; symbol: string };
    fromAirport: { name: string; symbol: string };
    toAirport: { name: string; symbol: string };
    departureDate: string;
    arrivalDate: string;
    travelClass: FlightOption["travelClass"];
    stopsCount: FlightOption["stopsCount"];
    baseFare: FlightOption["baseFare"];
    currencyId: string;
    bookingUrl: string;
    notes: string;
    extras: {
      seatReservation: FlightOption["extras"];
      checkedBaggage: FlightOption["extras"];
      other: FlightOption["extras"];
    };
  }>;
  resetOnSubmit?: boolean;
}>();

const emit = defineEmits<{
  (e: "submit", data: any): void;
  (e: "cancel"): void;
}>();

const { data: currencies } = useFetch<Currency[]>("/api/currencies", {
  server: false,
});

const form = reactive({
  airlineName: props.initialValues?.airline?.name ?? "",
  fromAirport: props.initialValues?.fromAirport?.name ?? "",
  toAirport: props.initialValues?.toAirport?.name ?? "",
  departureDate: props.initialValues?.departureDate ?? "",
  arrivalDate: props.initialValues?.arrivalDate ?? "",
  travelClass: props.initialValues?.travelClass ?? "economy",
  stopsCount: props.initialValues?.stopsCount ?? 0,
  baseFare: props.initialValues?.baseFare ?? 0,
  currencyId: props.initialValues?.currencyId ?? "",
  bookingUrl: props.initialValues?.bookingUrl ?? "",
  notes: props.initialValues?.notes ?? "",
  extrasSeatReservation: props.initialValues?.extras?.seatReservation ?? 0,
  extrasCheckedBaggage: props.initialValues?.extras?.checkedBaggage ?? 0,
  extrasOther: props.initialValues?.extras?.other ?? 0,
});

type Field =
  | "airlineName"
  | "fromAirport"
  | "toAirport"
  | "departureDate"
  | "arrivalDate"
  | "stopsCount"
  | "baseFare"
  | "currencyId";

const errors = reactive<Record<Field, string | "">>({
  airlineName: "",
  fromAirport: "",
  toAirport: "",
  departureDate: "",
  arrivalDate: "",
  stopsCount: "",
  baseFare: "",
  currencyId: "",
});

const validateField = (field: Field) => {
  switch (field) {
    case "airlineName":
      errors.airlineName = form.airlineName?.trim()
        ? ""
        : "Airline name is required.";
      break;
    case "fromAirport":
      errors.fromAirport = form.fromAirport?.trim()
        ? ""
        : "From airport is required.";
      break;
    case "toAirport":
      errors.toAirport = form.toAirport?.trim()
        ? ""
        : "To airport is required.";
      break;
    case "departureDate":
      errors.departureDate = form.departureDate
        ? ""
        : "Departure date is required.";
      break;
    case "arrivalDate":
      errors.arrivalDate = form.arrivalDate ? "" : "Arrival date is required.";
      break;
    case "stopsCount":
      errors.stopsCount =
        form.stopsCount >= 0 ? "" : "Stops count must be non-negative.";
      break;
    case "baseFare":
      errors.baseFare =
        form.baseFare >= 0 ? "" : "Base fare must be non-negative.";
      break;
    case "currencyId":
      errors.currencyId = form.currencyId ? "" : "Currency is required.";
      break;
  }
};

const validateAll = () => {
  validateField("airlineName");
  validateField("fromAirport");
  validateField("toAirport");
  validateField("departureDate");
  validateField("arrivalDate");
  validateField("stopsCount");
  validateField("baseFare");
  validateField("currencyId");
  return (
    !errors.airlineName &&
    !errors.fromAirport &&
    !errors.toAirport &&
    !errors.departureDate &&
    !errors.arrivalDate &&
    !errors.stopsCount &&
    !errors.baseFare &&
    !errors.currencyId
  );
};

const onSubmit = () => {
  if (!validateAll()) return;

  emit("submit", { ...form });
  if (props.resetOnSubmit) {
    form.airlineName = "";
    form.fromAirport = "";
    form.toAirport = "";
    form.departureDate = "";
    form.arrivalDate = "";
    form.travelClass = "economy";
    form.stopsCount = 0;
    form.baseFare = 0;
    form.extrasSeatReservation = 0;
    form.extrasCheckedBaggage = 0;
    form.extrasOther = 0;
    form.currencyId = "";
    form.bookingUrl = "";
    form.notes = "";
  }
};

const onCancel = () => {
  emit("cancel");
};

const computedDurationMin = computed(() => {
  const a = form.arrivalDate ? new Date(form.arrivalDate).getTime() : NaN;
  const d = form.departureDate ? new Date(form.departureDate).getTime() : NaN;
  if (Number.isNaN(a) || Number.isNaN(d) || a < d) return null;
  return Math.round((a - d) / 60000);
});

const humanDuration = (min: number | null) => {
  if (min == null) return "";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m}m`;
};
</script>
