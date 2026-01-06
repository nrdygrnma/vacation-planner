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
      <div class="space-y-4">
        <UFormField label="Name" name="name" required>
          <UInput v-model="state.name" placeholder="e.g. US Dollar" />
        </UFormField>
        <UFormField label="Symbol" name="symbol" required>
          <UInput v-model="state.symbol" placeholder="e.g. USD" />
        </UFormField>
        <UFormField
          label="Rate to EUR (1 [Currency] = X EUR)"
          name="rateToEUR"
          required
        >
          <UInput
            v-model.number="state.rateToEUR"
            step="0.0001"
            type="number"
          />
        </UFormField>
      </div>
    </template>
  </CrudForm>
</template>

<script lang="ts" setup>
import CrudForm from "~/components/base/CrudForm.vue";
import { z } from "zod";

const props = withDefaults(
  defineProps<{
    initialValues?: Partial<{
      name: string;
      symbol: string;
      rateToEUR: number;
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

const state = reactive({
  name: props.initialValues?.name ?? "",
  symbol: props.initialValues?.symbol ?? "",
  rateToEUR: props.initialValues?.rateToEUR ?? 1,
});

const schema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  symbol: z.string().trim().min(1, "Symbol is required."),
  rateToEUR: z.coerce.number().positive("Rate must be positive."),
});

const onSubmit = (data: any) => {
  emit("submit", data);
};

const crudFormRef = ref<InstanceType<typeof CrudForm> | null>(null);
defineExpose({
  submit: () => crudFormRef.value?.submit?.(),
});
</script>
