<template>
  <CrudForm
    ref="crudFormRef"
    :cancel-label="cancelLabel"
    :schema="schema"
    :state="state"
    :submit-label="submitLabel"
    @cancel="$emit('cancel')"
    @submit="onSubmit"
  >
    <template #default="{ state }">
      <div class="space-y-6 w-full">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 border-b pb-4">
          <UFormField label="Airline" name="airlineName" required>
            <AirlineSelect
              v-model="state.airlineName"
              @change="(a) => (state.flightNumber = a.code)"
            />
          </UFormField>

          <div class="grid grid-cols-2 gap-4 w-full">
            <UFormField label="Flight Number" name="flightNumber">
              <UInput
                v-model="state.flightNumber"
                class="w-full"
                maxlength="5"
                placeholder="BA123"
              />
            </UFormField>
            <div class="flex items-center pt-6">
              <UCheckbox v-model="state.isRoundTrip" label="Round Trip" />
            </div>
          </div>

          <UFormField label="Travel Class" name="travelClass">
            <USelectMenu
              v-model="state.travelClass"
              :items="classOptions"
              class="w-full"
              value-key="value"
            />
          </UFormField>

          <UFormField class="w-full" label="Currency" name="currencyId">
            <USelectMenu
              v-model="state.currencyId"
              :items="currencyOptions"
              class="w-full"
              option-attribute="label"
              value-key="value"
            />
          </UFormField>
        </div>

        <!-- Segments -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h5 class="text-sm font-semibold uppercase tracking-wider">
              Outbound Segments
            </h5>
            <UButton
              color="neutral"
              icon="i-lucide-plus"
              size="xs"
              variant="ghost"
              @click="addSegment(false)"
            >
              Add leg
            </UButton>
          </div>

          <FlightSegmentForm
            v-for="(seg, idx) in state.outboundSegments"
            :key="idx"
            v-model="state.outboundSegments[idx]"
            :name-prefix="`outboundSegments.${idx}`"
            :removable="state.outboundSegments.length > 1"
            :timezone-options="timezoneOptions"
            @remove="removeSegment(idx, false)"
          />

          <template v-if="state.isRoundTrip">
            <div
              class="flex items-center justify-between pt-4 border-t border-gray-500"
            >
              <h5 class="text-sm font-semibold uppercase tracking-wider">
                Return Segments
              </h5>
              <UButton
                color="neutral"
                icon="i-lucide-plus"
                size="xs"
                variant="ghost"
                @click="addSegment(true)"
              >
                Add leg
              </UButton>
            </div>

            <FlightSegmentForm
              v-for="(seg, idx) in state.returnSegments"
              :key="idx"
              v-model="state.returnSegments[idx]"
              :name-prefix="`returnSegments.${idx}`"
              :removable="true"
              :timezone-options="timezoneOptions"
              @remove="removeSegment(idx, true)"
            />
          </template>
        </div>

        <!-- Pricing & Extras -->
        <div
          class="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-gray-500 pt-4"
        >
          <UFormField label="Base Fare" name="baseFare">
            <UInput
              v-model.number="state.baseFare"
              min="0"
              step="0.01"
              type="number"
            />
          </UFormField>
          <UFormField label="Seat" name="seatReservation">
            <UInput
              v-model.number="state.seatReservation"
              min="0"
              type="number"
            />
          </UFormField>
          <UFormField label="Baggage" name="checkedBaggage">
            <UInput
              v-model.number="state.checkedBaggage"
              min="0"
              type="number"
            />
          </UFormField>
          <UFormField label="Other" name="otherExtras">
            <UInput v-model.number="state.otherExtras" min="0" type="number" />
          </UFormField>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <UFormField class="w-full" label="Booking URL" name="bookingUrl">
            <UInput
              v-model="state.bookingUrl"
              class="w-full"
              placeholder="https://..."
              type="url"
            />
          </UFormField>

          <UFormField
            class="w-full"
            label="Airline Logo URL"
            name="airlineLogoUrl"
          >
            <UInput
              v-model="state.airlineLogoUrl"
              class="w-full"
              placeholder="https://..."
              type="url"
            />
          </UFormField>

          <UFormField class="w-full" label="Notes" name="notes">
            <UTextarea v-model="state.notes" :rows="1" class="w-full" />
          </UFormField>
        </div>
      </div>
    </template>
  </CrudForm>
</template>

<script lang="ts" setup>
import CrudForm from "~/components/base/CrudForm.vue";
import AirlineSelect from "~/components/flights/AirlineSelect.vue";
import type { FormSegment } from "~/components/flights/FlightSegmentForm.vue";
import FlightSegmentForm from "~/components/flights/FlightSegmentForm.vue";
import type { Currency, FlightOption } from "@/types/tripTypes";
import { z } from "zod";

const props = withDefaults(
  defineProps<{
    initialValues?: Partial<FlightOption>;
    submitLabel?: string;
    cancelLabel?: string;
  }>(),
  {
    submitLabel: "Save",
    cancelLabel: "Cancel",
  },
);

const emit = defineEmits<{
  (e: "submit", data: any): void;
  (e: "cancel"): void;
}>();

const toDateInput = (value: unknown): string => {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value))
    return value;
  const d = new Date(value as any);
  if (isNaN(d.getTime())) return "";
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const toTimeInput = (value: unknown): string => {
  if (!value || typeof value !== "string") return "";
  const m = value.match(/T(\d{2}:\d{2})/);
  return m && m[1] ? m[1] : "";
};

const toIsoFromDateTimeUtc = (
  dateStr?: string,
  timeStr?: string,
): string | null => {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  const t =
    timeStr && /^\d{2}:\d{2}$/.test(timeStr) ? `${timeStr}:00` : "00:00:00";
  return new Date(`${dateStr}T${t}Z`).toISOString();
};

interface FormSegmentInternal extends FormSegment {}

const initialOutbound: FormSegmentInternal[] = [];
const initialReturn: FormSegmentInternal[] = [];

if (
  props.initialValues?.segments &&
  Array.isArray(props.initialValues.segments)
) {
  props.initialValues.segments.forEach((s: any) => {
    const seg: FormSegmentInternal = {
      fromAirport: s.fromAirport,
      fromAirportTimezone: s.fromAirportTimezone || "UTC",
      toAirport: s.toAirport,
      toAirportTimezone: s.toAirportTimezone || "UTC",
      departureDate: toDateInput(s.departureDate),
      departureTime: toTimeInput(s.departureDate),
      arrivalDate: toDateInput(s.arrivalDate),
      arrivalTime: toTimeInput(s.arrivalDate),
      isReturn: !!s.isReturn,
    };
    if (seg.isReturn) initialReturn.push(seg);
    else initialOutbound.push(seg);
  });
}

if (initialOutbound.length === 0) {
  initialOutbound.push({
    fromAirport: "",
    fromAirportTimezone: "UTC",
    toAirport: "",
    toAirportTimezone: "UTC",
    departureDate: "",
    departureTime: "",
    arrivalDate: "",
    arrivalTime: "",
    isReturn: false,
  });
}

const state = reactive({
  airlineName:
    (props.initialValues as any)?.airlineName ??
    (typeof props.initialValues?.airline === "string"
      ? props.initialValues.airline
      : props.initialValues?.airline?.name) ??
    "",
  flightNumber:
    props.initialValues?.flightNumber ??
    (typeof props.initialValues?.airline === "object"
      ? (props.initialValues?.airline as any)?.symbol
      : "") ??
    "",
  fromSymbol:
    (props.initialValues as any)?.fromSymbol ??
    (typeof props.initialValues?.fromAirport === "string"
      ? props.initialValues.fromAirport
      : props.initialValues?.fromAirport?.symbol ||
        props.initialValues?.fromAirport?.name) ??
    "",
  toSymbol:
    (props.initialValues as any)?.toSymbol ??
    (typeof props.initialValues?.toAirport === "string"
      ? props.initialValues.toAirport
      : props.initialValues?.toAirport?.symbol ||
        props.initialValues?.toAirport?.name) ??
    "",
  departureDate: toDateInput(props.initialValues?.departureDate ?? ""),
  departureTime: toTimeInput(props.initialValues?.departureDate ?? ""),
  arrivalDate: toDateInput(props.initialValues?.arrivalDate ?? ""),
  arrivalTime: toTimeInput(props.initialValues?.arrivalDate ?? ""),
  returnDepartureDate: toDateInput(
    props.initialValues?.returnDepartureDate ?? "",
  ),
  returnDepartureTime: toTimeInput(
    props.initialValues?.returnDepartureDate ?? "",
  ),
  returnArrivalDate: toDateInput(props.initialValues?.returnArrivalDate ?? ""),
  returnArrivalTime: toTimeInput(props.initialValues?.returnArrivalDate ?? ""),
  isRoundTrip: props.initialValues?.isRoundTrip ?? false,
  travelClass: props.initialValues?.travelClass ?? "economy",
  stops: props.initialValues?.stops ?? 0,
  baseFare: props.initialValues?.baseFare ?? 0,
  currencyId: props.initialValues?.currencyId ?? "",
  bookingUrl: props.initialValues?.bookingUrl ?? "",
  airlineLogoUrl: props.initialValues?.airlineLogoUrl ?? "",
  notes: props.initialValues?.notes ?? "",
  seatReservation:
    (props.initialValues as any)?.seatReservation ??
    props.initialValues?.extras?.seatReservation ??
    0,
  checkedBaggage:
    (props.initialValues as any)?.checkedBaggage ??
    props.initialValues?.extras?.checkedBaggage ??
    0,
  otherExtras:
    (props.initialValues as any)?.otherExtras ??
    props.initialValues?.extras?.other ??
    0,
  outboundSegments: initialOutbound,
  returnSegments: initialReturn,
});

const addSegment = (isReturn: boolean) => {
  const list = isReturn ? state.returnSegments : state.outboundSegments;
  list.push({
    fromAirport: "",
    fromAirportTimezone: "UTC",
    toAirport: "",
    toAirportTimezone: "UTC",
    departureDate: "",
    departureTime: "",
    arrivalDate: "",
    arrivalTime: "",
    isReturn,
  });
};

const removeSegment = (idx: number, isReturn: boolean) => {
  const list = isReturn ? state.returnSegments : state.outboundSegments;
  list.splice(idx, 1);
};

watch(
  [
    () => state.outboundSegments,
    () => state.returnSegments,
    () => state.isRoundTrip,
  ],
  () => {
    if (state.outboundSegments.length > 0) {
      const first = state.outboundSegments[0];
      const last = state.outboundSegments[state.outboundSegments.length - 1];
      if (first && last) {
        state.fromSymbol = first.fromAirport;
        state.toSymbol = last.toAirport;
        state.departureDate = first.departureDate;
        state.departureTime = first.departureTime;
        state.arrivalDate = last.arrivalDate;
        state.arrivalTime = last.arrivalTime;
        state.stops = state.outboundSegments.length - 1;
      }
    }
    if (state.isRoundTrip && state.returnSegments.length > 0) {
      const first = state.returnSegments[0];
      const last = state.returnSegments[state.returnSegments.length - 1];
      if (first && last) {
        state.returnDepartureDate = first.departureDate;
        state.returnDepartureTime = first.departureTime;
        state.returnArrivalDate = last.arrivalDate;
        state.returnArrivalTime = last.arrivalTime;
      }
    } else if (state.isRoundTrip && state.returnSegments.length === 0) {
      addSegment(true);
    }
  },
  { deep: true, immediate: true },
);

const { data: currencies } = useFetch<Currency[]>("/api/currencies", {
  server: false,
});
const currencyOptions = computed(() =>
  (currencies.value || []).map((c) => ({
    label: `${c.symbol} — ${c.name}`,
    value: c.id,
  })),
);

const timezoneOptions = Intl.supportedValuesOf("timeZone").map((tz) => ({
  label: tz,
  value: tz,
}));

const classOptions = [
  { label: "Economy", value: "economy" },
  { label: "Premium Economy", value: "premium_economy" },
  { label: "Business", value: "business" },
];

const schema = z
  .object({
    airlineName: z.string().trim().min(1, "Airline is required."),
    flightNumber: z.string().trim().optional().or(z.literal("")),
    fromSymbol: z.string().trim().min(1, "From is required."),
    toSymbol: z.string().trim().min(1, "To is required."),
    departureDate: z.string().min(1, "Departure date is required."),
    departureTime: z.string().min(1, "Departure time is required."),
    arrivalDate: z.string().min(1, "Arrival date is required."),
    arrivalTime: z.string().min(1, "Arrival time is required."),
    returnArrivalDate: z.string().optional().or(z.literal("")),
    returnArrivalTime: z.string().optional().or(z.literal("")),
    isRoundTrip: z.boolean().default(false),
    travelClass: z.string().trim().min(1),
    stops: z.coerce.number().min(0),
    baseFare: z.coerce.number().min(0).optional().default(0),
    currencyId: z.string().trim().optional().or(z.literal("")),
    bookingUrl: z.url().optional().or(z.literal("")),
    airlineLogoUrl: z.string().url().optional().or(z.literal("")),
    notes: z.string().optional().or(z.literal("")),
    seatReservation: z.coerce.number().min(0).optional().default(0),
    checkedBaggage: z.coerce.number().min(0).optional().default(0),
    otherExtras: z.coerce.number().min(0).optional().default(0),
    returnDepartureDate: z.string().optional().or(z.literal("")),
    returnDepartureTime: z.string().optional().or(z.literal("")),
    outboundSegments: z
      .array(
        z.object({
          fromAirport: z.string().min(1, "Required"),
          toAirport: z.string().min(1, "Required"),
          departureDate: z.string().min(1, "Required"),
          departureTime: z.string().min(1, "Required"),
          arrivalDate: z.string().min(1, "Required"),
          arrivalTime: z.string().min(1, "Required"),
        }),
      )
      .min(1),
    returnSegments: z.array(
      z.object({
        fromAirport: z.string().min(1, "Required"),
        toAirport: z.string().min(1, "Required"),
        departureDate: z.string().min(1, "Required"),
        departureTime: z.string().min(1, "Required"),
        arrivalDate: z.string().min(1, "Required"),
        arrivalTime: z.string().min(1, "Required"),
      }),
    ),
  })
  .refine(
    (data) => {
      const dep = toIsoFromDateTimeUtc(data.departureDate, data.departureTime);
      const arr = toIsoFromDateTimeUtc(data.arrivalDate, data.arrivalTime);
      if (!dep || !arr) return true; // field-level will catch specifics
      return new Date(arr) >= new Date(dep);
    },
    { message: "Arrival cannot be before departure.", path: ["arrivalTime"] },
  );

const onSubmit = (data: any) => {
  // Normalize payload to match flights store expectations
  const departureIso = toIsoFromDateTimeUtc(
    data.departureDate,
    data.departureTime,
  );
  const arrivalIso = toIsoFromDateTimeUtc(data.arrivalDate, data.arrivalTime);
  const returnDepartureIso = toIsoFromDateTimeUtc(
    data.returnDepartureDate,
    data.returnDepartureTime,
  );
  const returnArrivalIso = toIsoFromDateTimeUtc(
    data.returnArrivalDate,
    data.returnArrivalTime,
  );

  const segments = [
    ...state.outboundSegments.map((s) => ({
      fromAirport: s.fromAirport,
      fromAirportTimezone: s.fromAirportTimezone,
      toAirport: s.toAirport,
      toAirportTimezone: s.toAirportTimezone,
      departureDate: toIsoFromDateTimeUtc(s.departureDate, s.departureTime),
      arrivalDate: toIsoFromDateTimeUtc(s.arrivalDate, s.arrivalTime),
      isReturn: false,
    })),
    ...(data.isRoundTrip
      ? state.returnSegments.map((s) => ({
          fromAirport: s.fromAirport,
          fromAirportTimezone: s.fromAirportTimezone,
          toAirport: s.toAirport,
          toAirportTimezone: s.toAirportTimezone,
          departureDate: toIsoFromDateTimeUtc(s.departureDate, s.departureTime),
          arrivalDate: toIsoFromDateTimeUtc(s.arrivalDate, s.arrivalTime),
          isReturn: true,
        }))
      : []),
  ];

  const payload = {
    airlineName: data.airlineName || "",
    flightNumber: data.flightNumber || "",
    airline: { name: data.airlineName || "", symbol: data.flightNumber || "" },
    fromAirport: { name: "", symbol: data.fromSymbol || "" },
    toAirport: { name: "", symbol: data.toSymbol || "" },
    departureDate: departureIso,
    arrivalDate: arrivalIso,
    returnDepartureDate: data.isRoundTrip ? returnDepartureIso : null,
    returnArrivalDate: data.isRoundTrip ? returnArrivalIso : null,
    isRoundTrip: !!data.isRoundTrip,
    travelClass: data.travelClass || "economy",
    stops: Number(data.stops) || 0,
    baseFare: Number(data.baseFare) || 0,
    currencyId: data.currencyId || undefined,
    bookingUrl: data.bookingUrl || "",
    airlineLogoUrl: data.airlineLogoUrl || "",
    notes: data.notes || "",
    extras: {
      seatReservation: Number(data.seatReservation) || 0,
      checkedBaggage: Number(data.checkedBaggage) || 0,
      other: Number(data.otherExtras) || 0,
    },
    segments,
  };
  emit("submit", payload);
};

const crudFormRef = ref<InstanceType<typeof CrudForm> | null>(null);
defineExpose({
  submit: () => crudFormRef.value?.submit?.(),
});
</script>
