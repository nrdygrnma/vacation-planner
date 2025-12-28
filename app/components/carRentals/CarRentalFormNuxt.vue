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
      <div class="space-y-4 w-full">
        <div class="grid grid-cols-1 md:grid-cols-1 gap-4">
          <UFormField label="Company / Provider" name="provider" required>
            <UInput
              v-model="state.provider"
              class="w-full"
              placeholder="Hertz, Avis, etc."
            />
          </UFormField>
        </div>
        <div
          class="grid grid-cols-2 md:grid-cols-2 gap-4 pb-4 border-b border-gray-300"
        >
          <UFormField label="Car Type" name="carTypeId" required>
            <USelectMenu
              v-model="state.carTypeId"
              :items="carTypeOptions"
              class="w-full"
              placeholder="Select car type..."
              value-key="value"
            />
          </UFormField>

          <UFormField label="Currency" name="currencyId" required>
            <USelectMenu
              v-model="state.currencyId"
              :items="currencyOptions"
              class="w-full"
              option-attribute="label"
              value-key="value"
            />
          </UFormField>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-4">
            <h5
              class="text-sm font-semibold uppercase tracking-wider text-gray-500"
            >
              Pick-up
            </h5>
            <UFormField label="Location" name="pickupLocation" required>
              <UInput
                v-model="state.pickupLocation"
                class="w-full"
                placeholder="Airport, City, etc."
              />
            </UFormField>
            <div class="grid grid-cols-2 gap-2">
              <UFormField label="Date" name="pickupDate" required>
                <UInput v-model="state.pickupDate" class="w-full" type="date" />
              </UFormField>
              <UFormField label="Time" name="pickupTime" required>
                <UInput v-model="state.pickupTime" class="w-full" type="time" />
              </UFormField>
            </div>
          </div>

          <div class="space-y-4">
            <h5
              class="text-sm font-semibold uppercase tracking-wider text-gray-500"
            >
              Drop-off
            </h5>
            <UFormField label="Location" name="dropoffLocation" required>
              <UInput
                v-model="state.dropoffLocation"
                class="w-full"
                placeholder="Airport, City, etc."
              />
            </UFormField>
            <div class="grid grid-cols-2 gap-2">
              <UFormField label="Date" name="dropoffDate" required>
                <UInput
                  v-model="state.dropoffDate"
                  class="w-full"
                  type="date"
                />
              </UFormField>
              <UFormField label="Time" name="dropoffTime" required>
                <UInput
                  v-model="state.dropoffTime"
                  class="w-full"
                  type="time"
                />
              </UFormField>
            </div>
          </div>
        </div>

        <div
          class="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-300 pt-4"
        >
          <UFormField label="Base Rate" name="baseRate">
            <UInput
              v-model.number="state.baseRate"
              min="0"
              step="0.01"
              type="number"
            />
          </UFormField>
          <UFormField label="Total Fees" name="fees">
            <UInput
              v-model.number="state.fees"
              min="0"
              step="0.01"
              type="number"
            />
          </UFormField>
          <UFormField label="Insurance / Day" name="insurancePerDay">
            <UInput
              v-model.number="state.insurancePerDay"
              min="0"
              step="0.01"
              type="number"
            />
          </UFormField>
        </div>

        <UFormField label="Notes" name="notes">
          <UTextarea
            v-model="state.notes"
            :rows="2"
            class="w-full"
            placeholder="Any specific details..."
            @keydown.enter.stop
          />
        </UFormField>

        <UFormField label="Preview Image URL" name="imageUrl">
          <UInput
            v-model="state.imageUrl"
            class="w-full"
            placeholder="https://example.com/car.jpg"
            type="url"
          />
        </UFormField>

        <UFormField label="Booking URL" name="url">
          <UInput
            v-model="state.url"
            class="w-full"
            placeholder="https://..."
            type="url"
          />
        </UFormField>
      </div>
    </template>
  </CrudForm>
</template>

<script lang="ts" setup>
import CrudForm from "~/components/base/CrudForm.vue";
import type { CarRentalOption, CarType, Currency } from "@/types/tripTypes";
import { z } from "zod";

const props = withDefaults(
  defineProps<{
    initialValues?: Partial<CarRentalOption>;
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
  const d = new Date(value as any);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T").at(0) ?? "";
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
  if (!dateStr) return null;
  const t = timeStr || "00:00";
  return new Date(`${dateStr}T${t}:00Z`).toISOString();
};

const state = reactive({
  provider:
    props.initialValues?.provider ||
    (props.initialValues as any)?.provider ||
    "",
  carTypeId: props.initialValues?.carTypeId || "",
  pickupLocation: props.initialValues?.pickupLocation || "",
  pickupDate: toDateInput(props.initialValues?.pickupDate),
  pickupTime: toTimeInput(props.initialValues?.pickupDate),
  dropoffLocation: props.initialValues?.dropoffLocation || "",
  dropoffDate: toDateInput(props.initialValues?.dropoffDate),
  dropoffTime: toTimeInput(props.initialValues?.dropoffDate),
  baseRate: Number(props.initialValues?.baseRate || 0),
  fees: Number(props.initialValues?.fees || 0),
  insurancePerDay: Number(props.initialValues?.insurancePerDay || 0),
  currencyId: props.initialValues?.currencyId || "",
  notes: props.initialValues?.notes || "",
  url: props.initialValues?.url || "",
  imageUrl: props.initialValues?.imageUrl || "",
});

watch(
  () => props.initialValues,
  (newVal) => {
    if (!newVal) return;
    state.provider = newVal.provider || "";
    state.carTypeId = newVal.carTypeId || "";
    state.pickupLocation = newVal.pickupLocation || "";
    state.pickupDate = toDateInput(newVal.pickupDate);
    state.pickupTime = toTimeInput(newVal.pickupDate);
    state.dropoffLocation = newVal.dropoffLocation || "";
    state.dropoffDate = toDateInput(newVal.dropoffDate);
    state.dropoffTime = toTimeInput(newVal.dropoffDate);
    state.baseRate = Number(newVal.baseRate || 0);
    state.fees = Number(newVal.fees || 0);
    state.insurancePerDay = Number(newVal.insurancePerDay || 0);
    state.currencyId = newVal.currencyId || "";
    state.notes = newVal.notes || "";
    state.url = newVal.url || "";
    state.imageUrl = newVal.imageUrl || "";
  },
  { immediate: true, deep: true },
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

// We need car types too. For now let's assume an endpoint or hardcode some for MVP if not available.
// Let's check schema again - CarType is a model.
const { data: carTypes } = useFetch<CarType[]>("/api/car-types", {
  server: false,
});
const carTypeOptions = computed(() =>
  (carTypes.value || []).map((t) => ({
    label: t.name,
    value: t.id,
  })),
);

const schema = z
  .object({
    provider: z.string().min(1, "Provider is required"),
    carTypeId: z.string().min(1, "Car type is required"),
    pickupLocation: z.string().min(1, "Pickup location is required"),
    pickupDate: z.string().min(1, "Pickup date is required"),
    pickupTime: z.string().min(1, "Pickup time is required"),
    dropoffLocation: z.string().min(1, "Drop-off location is required"),
    dropoffDate: z.string().min(1, "Drop-off date is required"),
    dropoffTime: z.string().min(1, "Drop-off time is required"),
    baseRate: z.coerce.number().min(0),
    fees: z.coerce.number().min(0).optional(),
    insurancePerDay: z.coerce.number().min(0).optional(),
    currencyId: z.string().min(1, "Currency is required"),
    notes: z.string().optional(),
    url: z.string().url("Invalid URL").optional().or(z.literal("")),
    imageUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  })
  .refine(
    (data) => {
      const start = toIsoFromDateTimeUtc(data.pickupDate, data.pickupTime);
      const end = toIsoFromDateTimeUtc(data.dropoffDate, data.dropoffTime);
      if (!start || !end) return true;
      return new Date(end) >= new Date(start);
    },
    {
      message: "Drop-off cannot be before pick-up",
      path: ["dropoffDate"],
    },
  );

const onSubmit = (data: any) => {
  const payload = {
    ...data,
    pickupDate: toIsoFromDateTimeUtc(data.pickupDate, data.pickupTime),
    dropoffDate: toIsoFromDateTimeUtc(data.dropoffDate, data.dropoffTime),
    // Ensure numbers
    baseRate: Number(data.baseRate),
    fees: Number(data.fees),
    insurancePerDay: Number(data.insurancePerDay),
  };
  emit("submit", payload);
};

const crudFormRef = ref();
defineExpose({
  submit: () => crudFormRef.value?.submit?.(),
});
</script>
