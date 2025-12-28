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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField label="Name" name="name" required>
            <UInput
              v-model="state.name"
              class="w-full"
              placeholder="Grand Hotel"
            />
          </UFormField>
          <UFormField label="Provider" name="provider">
            <USelectMenu
              v-model="state.provider"
              :items="providerOptions"
              class="w-full"
              option-attribute="label"
              placeholder="Select Provider"
              value-key="value"
            />
          </UFormField>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField label="Room Type" name="roomType">
            <UInput
              v-model="state.roomType"
              class="w-full"
              placeholder="Double Room, Apartment, etc."
            />
          </UFormField>
          <UFormField label="URL" name="url">
            <UInput
              v-model="state.url"
              class="w-full"
              placeholder="https://..."
              type="url"
            />
          </UFormField>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormField label="Nightly Rate" name="nightlyRate">
            <UInput
              v-model.number="state.nightlyRate"
              class="w-full"
              min="0"
              step="0.01"
              type="number"
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

        <UFormField label="Notes" name="notes">
          <UTextarea
            v-model="state.notes"
            :rows="3"
            class="w-full"
            placeholder="Any specific details about the stay..."
            @keydown.enter.stop
          />
        </UFormField>

        <UFormField label="Images (URLs, one per line)" name="images">
          <UTextarea
            v-model="imagesText"
            :rows="3"
            class="w-full"
            placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
            @keydown.enter.stop
          />
        </UFormField>
      </div>
    </template>
  </CrudForm>
</template>

<script lang="ts" setup>
import { computed, reactive, ref, watch } from "vue";
import CrudForm from "~/components/base/CrudForm.vue";
import type { AccommodationOption, Currency } from "@/types/tripTypes";
import { z } from "zod";

const props = withDefaults(
  defineProps<{
    initialValues?: Partial<AccommodationOption>;
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

const state = reactive({
  name: "",
  provider: "",
  roomType: "",
  url: "",
  nightlyRate: 0,
  currencyId: "",
  notes: "",
});

const imagesText = ref("");

watch(
  () => props.initialValues,
  (newVal) => {
    if (newVal) {
      state.name = newVal.name || (newVal as any).name || "";
      state.provider = newVal.provider || "";
      state.roomType = newVal.roomType || "";
      state.url = newVal.url || "";
      state.nightlyRate =
        newVal.nightlyRate !== undefined && newVal.nightlyRate !== null
          ? Number(newVal.nightlyRate)
          : 0;
      state.currencyId = newVal.currencyId || "";
      state.notes = newVal.notes || "";
      imagesText.value = newVal.images?.map((img) => img.url).join("\n") || "";
    }
  },
  { immediate: true, deep: true },
);

const { data: currencies } = useFetch<Currency[]>("/api/currencies", {
  key: "currencies-list",
  server: false,
});
const currencyOptions = computed(() =>
  (currencies.value || []).map((c) => ({
    label: `${c.symbol} — ${c.name}`,
    value: c.id,
  })),
);

const { data: providers } = useFetch<{ id: string; name: string }[]>(
  "/api/accommodation-providers",
  {
    key: "accommodation-providers-list",
    server: false,
  },
);
const providerOptions = computed(() => {
  const fetched = (providers.value || []).map((p) => ({
    label: p.name,
    value: p.name,
  }));

  if (fetched.length > 0) return fetched;

  // Fallback providers if API fails or is empty
  return [
    { label: "Booking.com", value: "Booking.com" },
    { label: "Airbnb", value: "Airbnb" },
    { label: "Hotels.com", value: "Hotels.com" },
    { label: "Expedia", value: "Expedia" },
    { label: "Agoda", value: "Agoda" },
    { label: "Direct Booking", value: "Direct Booking" },
    { label: "Other", value: "Other" },
  ];
});

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  provider: z.string().optional(),
  roomType: z.string().optional(),
  url: z.string().url("Invalid URL").optional().or(z.literal("")),
  nightlyRate: z.number().min(0),
  currencyId: z.string().min(1, "Currency is required"),
  notes: z.string().optional(),
});

const onSubmit = (data: any) => {
  const images = imagesText.value
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  emit("submit", { ...data, images });
};

const crudFormRef = ref();
defineExpose({
  submit: () => crudFormRef.value?.submit?.(),
});
</script>
