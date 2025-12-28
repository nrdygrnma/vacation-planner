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
        <UFormField label="Type" name="type" required>
          <USelectMenu
            v-model="state.type"
            :items="[
              { label: 'Destination (with stay)', value: 'STOP' },
              { label: 'Hub (Airport/Start/End)', value: 'HUB' },
            ]"
            class="w-full"
            option-attribute="label"
            value-key="value"
          />
        </UFormField>

        <UFormField label="Location Name" name="name" required>
          <UInput
            v-model="state.name"
            class="w-full"
            placeholder="e.g. Paris, France"
          />
        </UFormField>

        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Start Date" name="startDate" required>
            <UInput v-model="state.startDate" class="w-full" type="date" />
          </UFormField>
          <UFormField label="End Date" name="endDate" required>
            <UInput v-model="state.endDate" class="w-full" type="date" />
          </UFormField>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Latitude (Optional)" name="lat">
            <UInput
              v-model.number="state.lat"
              class="w-full"
              placeholder="48.8566"
              step="any"
              type="number"
            />
          </UFormField>
          <UFormField label="Longitude (Optional)" name="lng">
            <UInput
              v-model.number="state.lng"
              class="w-full"
              placeholder="2.3522"
              step="any"
              type="number"
            />
          </UFormField>
        </div>
      </div>
    </template>
  </CrudForm>
</template>

<script lang="ts" setup>
import CrudForm from "~/components/base/CrudForm.vue";
import type { TripStop } from "~/types/tripTypes";
import { z } from "zod";

const props = withDefaults(
  defineProps<{
    initialValues?: Partial<TripStop>;
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

const toIsoMidnightUtc = (value: string | null | undefined): string | null => {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  return new Date(`${value}T00:00:00Z`).toISOString();
};

const state = reactive({
  name: props.initialValues?.name || "",
  startDate: toDateInput(props.initialValues?.startDate),
  endDate: toDateInput(props.initialValues?.endDate),
  lat: props.initialValues?.lat || undefined,
  lng: props.initialValues?.lng || undefined,
  type: props.initialValues?.type || "STOP",
});

const schema = z
  .object({
    name: z.string().min(1, "Location name is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    lat: z.number().optional(),
    lng: z.number().optional(),
    type: z.enum(["STOP", "HUB"]),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      return new Date(data.endDate) >= new Date(data.startDate);
    },
    {
      message: "End date cannot be before start date",
      path: ["endDate"],
    },
  );

const onSubmit = (data: any) => {
  const payload = {
    ...data,
    startDate: toIsoMidnightUtc(data.startDate),
    endDate: toIsoMidnightUtc(data.endDate),
  };
  emit("submit", payload);
};

const crudFormRef = ref();
defineExpose({
  submit: () => crudFormRef.value?.submit?.(),
});
</script>
