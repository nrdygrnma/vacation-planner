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
          <UFormField label="Company / Provider" name="company" required>
            <UInput v-model="state.company" placeholder="Hertz, Avis, etc." />
          </UFormField>

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
                placeholder="Airport, City, etc."
              />
            </UFormField>
            <div class="grid grid-cols-2 gap-2">
              <UFormField label="Date" name="pickupDate" required>
                <UInput v-model="state.pickupDate" type="date" />
              </UFormField>
              <UFormField label="Time" name="pickupTime" required>
                <UInput v-model="state.pickupTime" type="time" />
              </UFormField>
            </div>
          </div>

          <div class="space-y-4">
            <h5
              class="text-sm font-semibold uppercase tracking-wider text-gray-500"
            >
              Drop-off
            </h5>
            <UFormField label="Location" name="dropOffLocation" required>
              <UInput
                v-model="state.dropOffLocation"
                placeholder="Airport, City, etc."
              />
            </UFormField>
            <div class="grid grid-cols-2 gap-2">
              <UFormField label="Date" name="dropOffDate" required>
                <UInput v-model="state.dropOffDate" type="date" />
              </UFormField>
              <UFormField label="Time" name="dropOffTime" required>
                <UInput v-model="state.dropOffTime" type="time" />
              </UFormField>
            </div>
          </div>
        </div>

        <div
          class="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-100 pt-4"
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
            placeholder="Any specific details..."
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
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
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
  if (!dateStr) return null;
  const t = timeStr || "00:00";
  return new Date(`${dateStr}T${t}:00Z`).toISOString();
};

const state = reactive({
  company:
    props.initialValues?.company ||
    (props.initialValues as any)?.provider ||
    "",
  carTypeId: props.initialValues?.carTypeId || "",
  pickupLocation: props.initialValues?.pickupLocation || "",
  pickupDate: toDateInput(props.initialValues?.pickupDate),
  pickupTime: toTimeInput(props.initialValues?.pickupDate),
  dropOffLocation:
    props.initialValues?.dropOffLocation ||
    (props.initialValues as any)?.dropoffLocation ||
    "",
  dropOffDate: toDateInput(
    props.initialValues?.dropOffDate ||
      (props.initialValues as any)?.dropoffDate,
  ),
  dropOffTime: toTimeInput(
    props.initialValues?.dropOffDate ||
      (props.initialValues as any)?.dropoffDate,
  ),
  baseRate: props.initialValues?.baseRate || 0,
  fees: props.initialValues?.fees || 0,
  insurancePerDay: props.initialValues?.insurancePerDay || 0,
  currencyId: props.initialValues?.currencyId || "",
  notes: props.initialValues?.notes || "",
});

const { data: currencies } = useFetch<Currency[]>("/api/currencies");
const currencyOptions = computed(() =>
  (currencies.value || []).map((c) => ({
    label: `${c.symbol} — ${c.name}`,
    value: c.id,
  })),
);

// We need car types too. For now let's assume an endpoint or hardcode some for MVP if not available.
// Let's check schema again - CarType is a model.
const { data: carTypes } = useFetch<CarType[]>("/api/car-types");
const carTypeOptions = computed(() =>
  (carTypes.value || []).map((t) => ({
    label: t.name,
    value: t.id,
  })),
);

const schema = z
  .object({
    company: z.string().min(1, "Company is required"),
    carTypeId: z.string().min(1, "Car type is required"),
    pickupLocation: z.string().min(1, "Pickup location is required"),
    pickupDate: z.string().min(1, "Pickup date is required"),
    pickupTime: z.string().min(1, "Pickup time is required"),
    dropOffLocation: z.string().min(1, "Drop-off location is required"),
    dropOffDate: z.string().min(1, "Drop-off date is required"),
    dropOffTime: z.string().min(1, "Drop-off time is required"),
    baseRate: z.number().min(0),
    fees: z.number().min(0).optional(),
    insurancePerDay: z.number().min(0).optional(),
    currencyId: z.string().min(1, "Currency is required"),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      const start = toIsoFromDateTimeUtc(data.pickupDate, data.pickupTime);
      const end = toIsoFromDateTimeUtc(data.dropOffDate, data.dropOffTime);
      if (!start || !end) return true;
      return new Date(end) >= new Date(start);
    },
    {
      message: "Drop-off cannot be before pick-up",
      path: ["dropOffDate"],
    },
  );

const onSubmit = (data: any) => {
  const payload = {
    ...data,
    provider: data.company, // for backend compatibility if needed
    pickupDate: toIsoFromDateTimeUtc(data.pickupDate, data.pickupTime),
    dropOffDate: toIsoFromDateTimeUtc(data.dropOffDate, data.dropOffTime),
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
