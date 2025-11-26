<template>
  <form class="space-y-4" novalidate @submit.prevent="onSubmit">
    <!-- Airline -->
    <div class="flex gap-2 w-full">
      <div class="w-2/3">
        <label class="label-text">Airline</label>
        <input
          v-model="form.airlineName"
          :aria-describedby="
            errors.airlineName ? 'error-airlineName' : undefined
          "
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

      <div class="w-1/3">
        <label class="label-text">Flight #</label>
        <input
          v-model="form.flightNumber"
          :aria-describedby="
            errors.flightNumber ? 'error-flightNumber' : undefined
          "
          :aria-invalid="!!errors.flightNumber"
          :class="['input w-full', errors.flightNumber && 'input-error']"
          required
          type="text"
          @blur="validateField('flightNumber')"
        />
        <p
          v-if="errors.flightNumber"
          id="error-flightNumber"
          class="mt-1 text-xs text-error"
        >
          {{ errors.flightNumber }}
        </p>
      </div>
    </div>

    <!-- Route -->
    <div class="flex gap-2">
      <div>
        <label class="label-text">From Airport</label>
        <input
          v-model="form.fromAirport"
          :aria-describedby="
            errors.fromAirport ? 'error-fromAirport' : undefined
          "
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
      <div>
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
    </div>

    <!-- Times -->
    <div class="flex gap-2">
      <div class="w-1/2">
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
      <div class="w-1/2">
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
    <div class="flex gap-2">
      <div class="w-1/2">
        <label class="label-text">Travel Class</label>
        <select
          v-model="form.travelClass"
          :aria-describedby="
            errors.travelClass ? 'error-travelClass' : undefined
          "
          :aria-invalid="!!errors.travelClass"
          :class="['select w-full', errors.travelClass && 'select-error']"
          required
          @blur="validateField('travelClass')"
          @change="validateField('travelClass')"
        >
          <option disabled value="economy">Choose Travel Class</option>
          <option value="Economy">Economy</option>
          <option value="Premium Economy">Premium Economy</option>
          <option value="Business">Business</option>
        </select>

        <p
          v-if="errors.travelClass"
          id="error-travelClass"
          class="mt-1 text-xs text-error"
        >
          {{ errors.travelClass }}
        </p>
      </div>

      <div class="w-1/2">
        <label class="label-text">Stops</label>
        <input
          v-model="form.stops"
          :aria-describedby="errors.stops ? 'error-stops' : ''"
          :aria-invalid="!!errors.stops"
          :class="['input w-full', errors.stops && 'input-error']"
          min="0"
          required
          step="1"
          type="number"
          @blur="validateField('stops')"
        />
        <p v-if="errors.stops" id="error-stops" class="mt-1 text-xs text-error">
          {{ errors.stops }}
        </p>
      </div>
    </div>

    <!-- Pricing -->
    <div class="flex gap-2">
      <div class="w-1/2">
        <label class="label-text">Base Fare</label>
        <input
          v-model="form.baseFare"
          :aria-describedby="errors.baseFare ? 'error-baseFare' : ''"
          :aria-invalid="!!errors.baseFare"
          :class="['input w-full', errors.baseFare && 'input-error']"
          required
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
      <div class="w-1/2">
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
    <fieldset class="flex gap-2">
      <div class="w-1/3">
        <label class="label-text">Seat Reservation</label>
        <input
          v-model="form.extrasSeatReservation"
          class="input w-full"
          placeholder="0.00"
          type="number"
        />
      </div>
      <div class="w-1/3">
        <label class="label-text">Checked Baggage</label>
        <input
          v-model="form.extrasCheckedBaggage"
          class="input w-full"
          placeholder="0.00"
          type="number"
        />
      </div>
      <div class="w-1/3">
        <label class="label-text">Other</label>
        <input
          v-model="form.extrasOther"
          class="input w-full"
          placeholder="0.00"
          type="number"
        />
      </div>
    </fieldset>

    <!-- Links & notes -->
    <div class="w-full">
      <label class="label-text">Booking URL</label>
      <input
        v-model="form.bookingUrl"
        class="input w-full"
        placeholder="https://www.booking-url.com"
        type="text"
      />
    </div>
    <div class="w-full">
      <label class="label-text">Notes</label>
      <textarea
        v-model.trim="form.notes"
        class="textarea textarea-sm"
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
    flightNumber: string;
    departureDate: string;
    arrivalDate: string;
    travelClass: FlightOption["travelClass"];
    stops: FlightOption["stops"];
    baseFare: FlightOption["baseFare"];
    currencyId: string;
    bookingUrl: string;
    notes: string;
    extras: {
      seatReservation: number;
      checkedBaggage: number;
      other: number;
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
  flightNumber: props.initialValues?.flightNumber ?? "",
  travelClass: props.initialValues?.travelClass ?? "economy",
  stops: props.initialValues?.stops ?? 0,
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
  | "flightNumber"
  | "travelClass"
  | "stops"
  | "baseFare"
  | "currencyId";

const errors = reactive<Record<Field, string | "">>({
  airlineName: "",
  fromAirport: "",
  toAirport: "",
  departureDate: "",
  arrivalDate: "",
  flightNumber: "",
  travelClass: "",
  stops: "",
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
    case "flightNumber":
      errors.flightNumber = form.flightNumber?.trim()
        ? ""
        : "Flight number is required.";
      break;
    case "stops":
      errors.stops = form.stops >= 0 ? "" : "Stops count must be non-negative.";
      break;
    case "travelClass":
      errors.travelClass = form.travelClass ? "" : "Travel class is required.";
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
  validateField("flightNumber");
  validateField("travelClass");
  validateField("stops");
  validateField("baseFare");
  validateField("currencyId");
  return (
    !errors.airlineName &&
    !errors.fromAirport &&
    !errors.toAirport &&
    !errors.departureDate &&
    !errors.arrivalDate &&
    !errors.flightNumber &&
    !errors.travelClass &&
    !errors.stops &&
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
    form.flightNumber = "";
    form.travelClass = "economy";
    form.stops = 0;
    form.baseFare = 0;
    form.extrasSeatReservation = 0;
    form.extrasCheckedBaggage = 0;
    form.extrasOther = 0;
    form.currencyId = "";
    form.bookingUrl = "";
    form.notes = "";
  }
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
