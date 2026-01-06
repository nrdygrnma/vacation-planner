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
        <div class="flex gap-4 w-full">
          <UFormField class="w-full" label="Title" name="title" required>
            <UInput
              v-model="state.title"
              class="w-full"
              placeholder="Summer in Italy"
              type="text"
            />
          </UFormField>

          <UFormField
            class="w-full"
            label="Cover image URL (optional)"
            name="imageUrl"
          >
            <UInput
              v-model="state.imageUrl"
              class="w-full"
              placeholder="https://example.com/photo.jpg"
              type="url"
            />
          </UFormField>
        </div>

        <div class="flex gap-4">
          <UFormField
            class="w-full"
            label="Start Date"
            name="startDate"
            required
          >
            <UInput v-model="state.startDate" class="w-full" type="date" />
          </UFormField>

          <UFormField class="w-full" label="End Date" name="endDate" required>
            <UInput v-model="state.endDate" class="w-full" type="date" />
          </UFormField>
        </div>

        <div class="flex gap-4">
          <UFormField class="w-full" label="People" name="people">
            <UInput
              v-model.number="state.people"
              class="w-full"
              min="1"
              type="number"
            />
          </UFormField>

          <UFormField
            class="w-full"
            label="Currency"
            name="currencyId"
            required
          >
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

        <div class="border-t border-gray-100 pt-4 space-y-4">
          <h4 class="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Route (Optional)
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <UFormField label="Start Point Name" name="startLocationName">
              <UInput
                v-model="state.startLocationName"
                placeholder="Home, Airport, etc."
              />
            </UFormField>
            <UFormField label="Start Lat" name="startLat">
              <UInput
                v-model.number="state.startLat"
                placeholder="48.8566"
                step="any"
                type="number"
              />
            </UFormField>
            <UFormField label="Start Lng" name="startLng">
              <UInput
                v-model.number="state.startLng"
                placeholder="2.3522"
                step="any"
                type="number"
              />
            </UFormField>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <UFormField label="End Point Name" name="endLocationName">
              <UInput
                v-model="state.endLocationName"
                placeholder="Home, Hotel, etc."
              />
            </UFormField>
            <UFormField label="End Lat" name="endLat">
              <UInput
                v-model.number="state.endLat"
                placeholder="48.8566"
                step="any"
                type="number"
              />
            </UFormField>
            <UFormField label="End Lng" name="endLng">
              <UInput
                v-model.number="state.endLng"
                placeholder="2.3522"
                step="any"
                type="number"
              />
            </UFormField>
          </div>
        </div>
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
      title: string;
      imageUrl: string | null;
      startDate: string | null;
      endDate: string | null;
      people: number;
      currencyId: string;
      startLocationName: string | null;
      startLat: number | null;
      startLng: number | null;
      endLocationName: string | null;
      endLat: number | null;
      endLng: number | null;
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

// Helpers for date normalization/serialization
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

const toIsoMidnightUtc = (value: string | null | undefined): string | null => {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const iso = new Date(`${value}T00:00:00Z`).toISOString();
  return iso;
};

const state = reactive({
  title: props.initialValues?.title ?? "",
  imageUrl: props.initialValues?.imageUrl ?? "",
  startDate: toDateInput(props.initialValues?.startDate ?? ""),
  endDate: toDateInput(props.initialValues?.endDate ?? ""),
  people: props.initialValues?.people ?? 1,
  currencyId: props.initialValues?.currencyId ?? "",
  startLocationName: props.initialValues?.startLocationName ?? "",
  startLat: props.initialValues?.startLat ?? null,
  startLng: props.initialValues?.startLng ?? null,
  endLocationName: props.initialValues?.endLocationName ?? "",
  endLat: props.initialValues?.endLat ?? null,
  endLng: props.initialValues?.endLng ?? null,
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

// Zod schema for validation (used by CrudForm)
const schema = z
  .object({
    title: z.string().trim().min(1, "Title is required."),
    imageUrl: z.url("Please enter a valid URL.").optional().or(z.literal("")),
    startDate: z.string().min(1, "Start date is required."),
    endDate: z.string().min(1, "End date is required."),
    people: z.coerce.number().min(1, "People must be at least 1."),
    currencyId: z.string().min(1, "Currency is required."),
    startLocationName: z.string().optional().or(z.literal("")),
    startLat: z.coerce.number().optional().nullable(),
    startLng: z.coerce.number().optional().nullable(),
    endLocationName: z.string().optional().or(z.literal("")),
    endLat: z.coerce.number().optional().nullable(),
    endLng: z.coerce.number().optional().nullable(),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      return new Date(data.endDate) >= new Date(data.startDate);
    },
    {
      message: "End date cannot be before start date.",
      path: ["endDate"],
    },
  );

const onSubmit = (data: any) => {
  // Convert date strings (yyyy-mm-dd) back to ISO for API/store consistency
  const payload = {
    ...data,
    startDate: toIsoMidnightUtc(data?.startDate) ?? data?.startDate ?? "",
    endDate: toIsoMidnightUtc(data?.endDate) ?? data?.endDate ?? "",
  };
  emit("submit", payload);
};

// Expose programmatic submit so parents (e.g., CrudModal) can trigger form submit
const crudFormRef = ref<InstanceType<typeof CrudForm> | null>(null);
defineExpose({
  submit: () => crudFormRef.value?.submit?.(),
});
</script>
