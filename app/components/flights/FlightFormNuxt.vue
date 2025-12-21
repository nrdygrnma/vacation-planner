<template>
  <CrudForm
    ref="crudFormRef"
    :cancel-label="cancelLabel"
    :initial-state="state"
    :schema="schema"
    :submit-label="submitLabel"
    @cancel="$emit('cancel')"
    @submit="onSubmit"
  >
    <template #default="{ state }">
      <div class="space-y-4 w-full">
        <div class="flex gap-4 w-full">
          <UFormField
            class="w-full"
            label="Airline"
            name="airlineName"
            required
          >
            <UInput
              v-model="state.airlineName"
              class="w-full"
              placeholder="Airline name"
            />
          </UFormField>
          <UFormField class="w-full" label="Flight number" name="flightNumber">
            <UInput
              v-model="state.flightNumber"
              class="w-full"
              placeholder="e.g. BA123"
            />
          </UFormField>
        </div>

        <div class="flex gap-4 w-full">
          <UFormField
            class="w-full"
            label="From (IATA/code)"
            name="fromSymbol"
            required
          >
            <UInput
              v-model="state.fromSymbol"
              class="w-full"
              placeholder="e.g. LHR"
            />
          </UFormField>
          <UFormField
            class="w-full"
            label="To (IATA/code)"
            name="toSymbol"
            required
          >
            <UInput
              v-model="state.toSymbol"
              class="w-full"
              placeholder="e.g. JFK"
            />
          </UFormField>
        </div>

        <div class="flex gap-4 w-full">
          <UFormField
            class="w-full"
            label="Departure date"
            name="departureDate"
            required
          >
            <UInput v-model="state.departureDate" class="w-full" type="date" />
          </UFormField>
          <UFormField
            class="w-full"
            label="Departure time (UTC)"
            name="departureTime"
            required
          >
            <UInput
              v-model="state.departureTime"
              class="w-full"
              placeholder="HH:mm"
              type="time"
            />
          </UFormField>
        </div>

        <div class="flex gap-4 w-full">
          <UFormField
            class="w-full"
            label="Arrival date"
            name="arrivalDate"
            required
          >
            <UInput v-model="state.arrivalDate" class="w-full" type="date" />
          </UFormField>
          <UFormField
            class="w-full"
            label="Arrival time (UTC)"
            name="arrivalTime"
            required
          >
            <UInput
              v-model="state.arrivalTime"
              class="w-full"
              placeholder="HH:mm"
              type="time"
            />
          </UFormField>
        </div>

        <div class="flex gap-4 w-full">
          <UFormField class="w-full" label="Class" name="travelClass">
            <USelectMenu
              v-model="state.travelClass"
              :items="classOptions"
              class="w-full"
            />
          </UFormField>
          <UFormField class="w-full" label="Stops" name="stops">
            <UInput
              v-model.number="state.stops"
              class="w-full"
              min="0"
              type="number"
            />
          </UFormField>
        </div>

        <div class="flex gap-4 w-full">
          <UFormField class="w-full" label="Base fare" name="baseFare">
            <UInput
              v-model.number="state.baseFare"
              class="w-full"
              min="0"
              step="0.01"
              type="number"
            />
          </UFormField>
          <UFormField class="w-full" label="Currency" name="currencyId">
            <USelectMenu
              v-model="state.currencyId"
              :items="currencyOptions"
              class="w-full"
              option-attribute="label"
              placeholder="Choose currency"
              value-key="value"
            />
          </UFormField>
        </div>

        <UFormField label="Booking URL" name="bookingUrl">
          <UInput
            v-model="state.bookingUrl"
            class="w-full"
            placeholder="https://..."
            type="url"
          />
        </UFormField>

        <UFormField label="Notes" name="notes">
          <UTextarea
            v-model="state.notes"
            :rows="3"
            placeholder="Optional notes"
          />
        </UFormField>

        <UFormField label="Extras (JSON)" name="extras">
          <UTextarea
            v-model="state.extras"
            :rows="4"
            placeholder='{"baggage": "included"}'
          />
        </UFormField>
      </div>
    </template>
  </CrudForm>
</template>

<script lang="ts" setup>
import CrudForm from "~/components/base/CrudForm.vue";
import type { Currency } from "@/types/tripTypes";
import { z } from "zod";

const props = withDefaults(
  defineProps<{
    initialValues?: Partial<{
      airline: { name?: string; symbol?: string } | null;
      fromAirport: { name?: string; symbol?: string } | null;
      toAirport: { name?: string; symbol?: string } | null;
      departureDate: string | null;
      arrivalDate: string | null;
      travelClass: string | null;
      stops: number | null;
      baseFare: number | null;
      currencyId: string | null;
      bookingUrl: string | null;
      notes: string | null;
      extras: any;
    }>;
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
  return m ? m[1] : "";
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

const safeJsonStringify = (obj: any): string => {
  try {
    return obj == null ? "" : JSON.stringify(obj, null, 2);
  } catch {
    return "";
  }
};

const state = reactive({
  airlineName: props.initialValues?.airline?.name ?? "",
  flightNumber: props.initialValues?.airline?.symbol ?? "",
  fromSymbol:
    props.initialValues?.fromAirport?.symbol ??
    props.initialValues?.fromAirport?.name ??
    "",
  toSymbol:
    props.initialValues?.toAirport?.symbol ??
    props.initialValues?.toAirport?.name ??
    "",
  departureDate: toDateInput(props.initialValues?.departureDate ?? ""),
  departureTime: toTimeInput(props.initialValues?.departureDate ?? ""),
  arrivalDate: toDateInput(props.initialValues?.arrivalDate ?? ""),
  arrivalTime: toTimeInput(props.initialValues?.arrivalDate ?? ""),
  travelClass: props.initialValues?.travelClass ?? "economy",
  stops: props.initialValues?.stops ?? 0,
  baseFare: props.initialValues?.baseFare ?? 0,
  currencyId: props.initialValues?.currencyId ?? "",
  bookingUrl: props.initialValues?.bookingUrl ?? "",
  notes: props.initialValues?.notes ?? "",
  extras: safeJsonStringify(props.initialValues?.extras),
});

const { data: currencies } = useFetch<Currency[]>("/api/currencies", {
  server: false,
});
const currencyOptions = computed(() =>
  (currencies.value || []).map((c) => ({
    label: `${c.symbol} — ${c.name}`,
    value: c.id,
  })),
);

const classOptions = [
  { label: "Economy", value: "economy" },
  { label: "Premium Economy", value: "premium_economy" },
  { label: "Business", value: "business" },
  { label: "First", value: "first" },
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
    travelClass: z.string().trim().min(1),
    stops: z.coerce.number().min(0),
    baseFare: z.coerce.number().min(0).optional().default(0),
    currencyId: z.string().trim().optional().or(z.literal("")),
    bookingUrl: z.string().url().optional().or(z.literal("")),
    notes: z.string().optional().or(z.literal("")),
    extras: z.string().optional().or(z.literal("")),
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
  let parsedExtras: any = undefined;
  try {
    parsedExtras = data.extras ? JSON.parse(data.extras) : undefined;
  } catch {
    // Keep as string if invalid JSON; backend may reject
    parsedExtras = data.extras;
  }

  const payload = {
    airline: { name: data.airlineName || "", symbol: data.flightNumber || "" },
    fromAirport: { name: "", symbol: data.fromSymbol || "" },
    toAirport: { name: "", symbol: data.toSymbol || "" },
    departureDate: departureIso,
    arrivalDate: arrivalIso,
    travelClass: data.travelClass || "economy",
    stops: Number(data.stops) || 0,
    baseFare: Number(data.baseFare) || 0,
    currencyId: data.currencyId || undefined,
    bookingUrl: data.bookingUrl || "",
    notes: data.notes || "",
    extras: parsedExtras,
  };
  emit("submit", payload);
};

const crudFormRef = ref<InstanceType<typeof CrudForm> | null>(null);
defineExpose({
  submit: () => crudFormRef.value?.submit?.(),
});
</script>
