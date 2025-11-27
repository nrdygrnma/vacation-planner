<template>
  <form class="space-y-4" novalidate @submit.prevent="onSubmit">
    <!-- Airline -->
    <div class="flex gap-2 w-full">
      <div class="w-2/3">
        <label class="label-text">Airline</label>

        <div
          class="relative max-w-full"
          data-combo-box='{
      "apiUrl": "/api/airlines",
      "apiQuery": "limit=50",
      "apiSearchQuery": "search",
      "outputEmptyTemplate": "<div class=\"dropdown-item\">No airlines found...</div>",
      "outputItemTemplate": "<div class=\"dropdown-item combo-box-selected:dropdown-active\" data-combo-box-output-item><div class=\"flex justify-between items-center w-full\"><div data-combo-box-output-item-field=\"name\" data-combo-box-search-text data-combo-box-value></div><span class=\"icon-[tabler--check] text-primary combo-box-selected:block hidden size-4 shrink-0\"></span></div></div>"
    }'
        >
          <div class="relative">
            <input
              v-model="form.airlineName"
              :aria-describedby="
                errors.airlineName ? 'error-airlineName' : undefined
              "
              :aria-invalid="!!errors.airlineName"
              aria-expanded="false"
              aria-label="Airline"
              class="input w-full"
              data-combo-box-input=""
              required
              role="combobox"
              type="text"
              @blur="validateField('airlineName')"
              @change="validateField('airlineName')"
            />
            <span
              class="icon-[tabler--caret-up-down] absolute end-3 top-1/2 size-4 -translate-y-1/2 text-base-content"
              data-combo-box-toggle=""
            ></span>
          </div>

          <div
            class="bg-base-100 rounded-box shadow-base-300/20 absolute z-50 max-h-44 w-full space-y-0.5 overflow-y-auto p-2 shadow-lg"
            data-combo-box-output=""
            style="display: none"
          ></div>
        </div>

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

    <hr class="my-2 border-base-200" />

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

    <hr class="my-2 border-base-200" />

    <!-- Times -->
    <div class="flex flex-col gap-3">
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
            :required="!hasSegmentInput"
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
          <label class="label-text">Departure Time</label>
          <input
            v-model="form.departureTime"
            class="input w-full"
            placeholder="HH:MM"
            step="60"
            type="time"
          />
        </div>
      </div>

      <div class="flex gap-2">
        <div class="w-1/2">
          <label class="label-text">Arrival Date</label>
          <input
            v-model="form.arrivalDate"
            :aria-describedby="
              errors.arrivalDate ? 'error-arrivalDate' : undefined
            "
            :aria-invalid="!!errors.arrivalDate"
            :class="['input w-full', errors.arrivalDate && 'input-error']"
            :required="!hasSegmentInput"
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
        <div class="w-1/2">
          <label class="label-text">Arrival Time</label>
          <input
            v-model="form.arrivalTime"
            class="input w-full"
            placeholder="HH:MM"
            step="60"
            type="time"
          />
        </div>
      </div>
    </div>


    <!-- Travel & Stops -->
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

    <!-- Stopover section for 1 stop -->
    <div v-if="Number(form.stops) === 1">
      <hr class="my-2 border-base-200" />
      <h5 class="text-sm font-medium mb-2">Stopover details</h5>
      <div class="flex gap-2 mb-2">
        <div class="w-1/2">
          <label class="label-text">Stopover Airport</label>
          <input v-model="form.stop1Airport" class="input w-full" type="text" />
        </div>
        <div class="w-1/2 text-xs opacity-70 flex items-end">
          <div>
            Leg 1: {{ form.fromAirport || '—' }} → {{ form.stop1Airport || '—' }}
            · Leg 2: {{ form.stop1Airport || '—' }} → {{ form.toAirport || '—' }}
          </div>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <div>
          <label class="label-text">Leg 1 Departure Date</label>
          <input v-model="form.seg1DepartureDate" class="input w-full" type="date" />
        </div>
        <div>
          <label class="label-text">Leg 1 Departure Time</label>
          <input v-model="form.seg1DepartureTime" class="input w-full" type="time" step="60" />
        </div>
        <div>
          <label class="label-text">Leg 1 Arrival Date</label>
          <input v-model="form.seg1ArrivalDate" class="input w-full" type="date" />
        </div>
        <div>
          <label class="label-text">Leg 1 Arrival Time</label>
          <input v-model="form.seg1ArrivalTime" class="input w-full" type="time" step="60" />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2 mt-2">
        <div>
          <label class="label-text">Leg 2 Departure Date</label>
          <input v-model="form.seg2DepartureDate" class="input w-full" type="date" />
        </div>
        <div>
          <label class="label-text">Leg 2 Departure Time</label>
          <input v-model="form.seg2DepartureTime" class="input w-full" type="time" step="60" />
        </div>
        <div>
          <label class="label-text">Leg 2 Arrival Date</label>
          <input v-model="form.seg2ArrivalDate" class="input w-full" type="date" />
        </div>
        <div>
          <label class="label-text">Leg 2 Arrival Time</label>
          <input v-model="form.seg2ArrivalTime" class="input w-full" type="time" step="60" />
        </div>
      </div>
    </div>

    <hr class="my-2 border-base-200" />

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

    <hr class="my-2 border-base-200" />

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

    <hr class="my-2 border-base-200" />

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

    <hr class="my-2 border-base-200" />

    <!-- Stopovers (quick summary fields) -->
    <fieldset class="flex gap-2">
      <div class="w-1/3">
        <label class="label-text">Stopover Duration (min)</label>
        <input
          v-model="form.stopOverDurationMinutes"
          class="input w-full"
          min="0"
          placeholder="e.g. 90"
          type="number"
        />
      </div>
      <div class="w-2/3">
        <label class="label-text">Stopover Airports (comma separated)</label>
        <input
          v-model="form.stopOverAirportsText"
          class="input w-full"
          placeholder="FRA, DXB"
          type="text"
        />
      </div>
    </fieldset>

    <hr class="my-2 border-base-200" />

    <!-- Duration preview -->
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
import type { Currency } from "@/types/tripTypes";

const props = defineProps<{
  initialValues?: Partial<{
    airline: { name: string; symbol: string };
    fromAirport: { name: string; symbol: string };
    toAirport: { name: string; symbol: string };
    flightNumber: string;
    departureDate: string;
    arrivalDate: string;
    travelClass: string;
    stops: number;
    baseFare: number;
    currencyId: string;
    bookingUrl: string;
    notes: string;
    extras: {
      seatReservation: number;
      checkedBaggage: number;
      other: number;
    };
    stopOverDurationMinutes?: number;
    stopOverAirports?: string[] | string;
    segments?: Array<{
      fromAirport: string;
      toAirport: string;
      departureDate: string;
      arrivalDate: string;
    }>;
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

// Airlines
const { data: airlinesAll } = useFetch<{ code: string; name: string }[]>(
  "/api/airlines",
  { server: false },
);
const airlineFilter = ref("");
const filteredAirlines = computed(() => {
  const q = airlineFilter.value.trim().toLowerCase();
  const list = airlinesAll.value || [];
  if (!q) return list;
  return list.filter(
    (a) => a.name.toLowerCase().includes(q) || a.code.toLowerCase().includes(q),
  );
});
const airlinePresent = computed(() => {
  const name = (form.airlineName || "").trim().toLowerCase();
  return (airlinesAll.value || []).some(
    (a) => a.name.trim().toLowerCase() === name,
  );
});

const form = reactive({
  airlineName: props.initialValues?.airline?.name ?? "",
  fromAirport: props.initialValues?.fromAirport?.name ?? "",
  toAirport: props.initialValues?.toAirport?.name ?? "",
  departureDate: props.initialValues?.departureDate?.slice(0, 10) ?? "",
  arrivalDate: props.initialValues?.arrivalDate?.slice(0, 10) ?? "",
  departureTime: props.initialValues?.departureDate
    ? new Date(props.initialValues.departureDate).toISOString().slice(11, 16)
    : "",
  arrivalTime: props.initialValues?.arrivalDate
    ? new Date(props.initialValues.arrivalDate).toISOString().slice(11, 16)
    : "",
  flightNumber: props.initialValues?.flightNumber ?? "",
  travelClass: (props.initialValues as any)?.travelClass ?? "economy",
  stops: (props.initialValues as any)?.stops ?? 0,
  baseFare: (props.initialValues as any)?.baseFare ?? 0,
  currencyId: (props.initialValues as any)?.currencyId ?? "",
  bookingUrl: (props.initialValues as any)?.bookingUrl ?? "",
  notes: (props.initialValues as any)?.notes ?? "",
  extrasSeatReservation: props.initialValues?.extras?.seatReservation ?? 0,
  extrasCheckedBaggage: props.initialValues?.extras?.checkedBaggage ?? 0,
  extrasOther: props.initialValues?.extras?.other ?? 0,
  stopOverDurationMinutes:
    (props.initialValues as any)?.stopOverDurationMinutes ?? "",
  stopOverAirportsText: Array.isArray(
    (props.initialValues as any)?.stopOverAirports,
  )
    ? ((props.initialValues as any)?.stopOverAirports as string[]).join(", ")
    : typeof (props.initialValues as any)?.stopOverAirports === "string"
      ? String((props.initialValues as any)?.stopOverAirports)
      : "",
  // Segment helper fields (for 1 stop flow)
  stop1Airport: (props.initialValues as any)?.segments?.[0]?.toAirport || "",
  seg1DepartureDate:
    (props.initialValues as any)?.segments?.[0]?.departureDate?.slice(0, 10) ||
    "",
  seg1DepartureTime:
    (props.initialValues as any)?.segments?.[0]?.departureDate
      ? new Date(
          (props.initialValues as any)?.segments?.[0]?.departureDate,
        )
          .toISOString()
          .slice(11, 16)
      : "",
  seg1ArrivalDate:
    (props.initialValues as any)?.segments?.[0]?.arrivalDate?.slice(0, 10) ||
    "",
  seg1ArrivalTime:
    (props.initialValues as any)?.segments?.[0]?.arrivalDate
      ? new Date((props.initialValues as any)?.segments?.[0]?.arrivalDate)
          .toISOString()
          .slice(11, 16)
      : "",
  seg2DepartureDate:
    (props.initialValues as any)?.segments?.[1]?.departureDate?.slice(0, 10) ||
    "",
  seg2DepartureTime:
    (props.initialValues as any)?.segments?.[1]?.departureDate
      ? new Date(
          (props.initialValues as any)?.segments?.[1]?.departureDate,
        )
          .toISOString()
          .slice(11, 16)
      : "",
  seg2ArrivalDate:
    (props.initialValues as any)?.segments?.[1]?.arrivalDate?.slice(0, 10) ||
    "",
  seg2ArrivalTime:
    (props.initialValues as any)?.segments?.[1]?.arrivalDate
      ? new Date((props.initialValues as any)?.segments?.[1]?.arrivalDate)
          .toISOString()
          .slice(11, 16)
      : "",
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

const hasSegmentInput = computed(() => {
  return (
    Number(form.stops) === 1 &&
    form.stop1Airport &&
    form.seg1DepartureDate &&
    form.seg1DepartureTime &&
    form.seg1ArrivalDate &&
    form.seg1ArrivalTime &&
    form.seg2DepartureDate &&
    form.seg2DepartureTime &&
    form.seg2ArrivalDate &&
    form.seg2ArrivalTime
  );
});

const validateAll = () => {
  validateField("airlineName");
  validateField("fromAirport");
  validateField("toAirport");
  if (!hasSegmentInput.value) {
    validateField("departureDate");
    validateField("arrivalDate");
  } else {
    errors.departureDate = "";
    errors.arrivalDate = "";
  }
  validateField("flightNumber");
  validateField("travelClass");
  validateField("stops");
  validateField("baseFare");
  validateField("currencyId");
  return (
    !errors.airlineName &&
    !errors.fromAirport &&
    !errors.toAirport &&
    (!errors.departureDate || hasSegmentInput.value) &&
    (!errors.arrivalDate || hasSegmentInput.value) &&
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
    form.departureTime = "";
    form.arrivalDate = "";
    form.arrivalTime = "";
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
    form.stopOverDurationMinutes = "" as any;
    form.stopOverAirportsText = "" as any;
    form.stop1Airport = "" as any;
    form.seg1DepartureDate = "" as any;
    form.seg1DepartureTime = "" as any;
    form.seg1ArrivalDate = "" as any;
    form.seg1ArrivalTime = "" as any;
    form.seg2DepartureDate = "" as any;
    form.seg2DepartureTime = "" as any;
    form.seg2ArrivalDate = "" as any;
    form.seg2ArrivalTime = "" as any;
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
