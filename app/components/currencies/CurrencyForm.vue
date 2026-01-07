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
        <UFormField label="Symbol" name="symbol" required>
          <div class="flex gap-2">
            <UInput
              v-model="state.symbol"
              class="flex-1"
              placeholder="e.g. USD"
              @blur="fetchName"
            />
            <UButton
              color="neutral"
              icon="i-lucide-refresh-cw"
              size="sm"
              variant="ghost"
              @click="fetchName"
            />
          </div>
        </UFormField>
        <UFormField label="Name" name="name" required>
          <UInput v-model="state.name" placeholder="e.g. US Dollar" />
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
});

const fetchName = async () => {
  if (!state.symbol || state.symbol.length < 3) return;
  const symbol = state.symbol.toUpperCase();
  state.symbol = symbol;

  try {
    const data = await $fetch<Record<string, string>>(
      "https://api.frankfurter.dev/v1/currencies",
    );
    if (data[symbol]) {
      state.name = data[symbol];
    }
  } catch (e) {
    console.error("Failed to fetch currency name", e);
  }
};

const schema = z.object({
  name: z.string().trim().min(1, "Name is required."),
  symbol: z.string().trim().min(3, "Symbol must be 3 characters.").max(3),
});

const onSubmit = (data: any) => {
  emit("submit", data);
};

const crudFormRef = ref<InstanceType<typeof CrudForm> | null>(null);
defineExpose({
  submit: () => crudFormRef.value?.submit?.(),
});
</script>
