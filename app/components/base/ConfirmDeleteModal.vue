<template>
  <UModal
    v-model:open="internalOpen"
    :description="description"
    :title="title"
    :ui="{ body: 'sm:max-w-md' }"
  >
    <template #footer>
      <div class="flex items-center justify-end gap-2">
        <UButton
          :disabled="loading"
          :label="cancelLabel"
          color="neutral"
          variant="outline"
          @click="onCancel"
        />
        <UButton
          :label="confirmLabel"
          :loading="loading"
          color="error"
          icon="i-lucide-trash"
          @click="onConfirm"
        />
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    loading?: boolean;
  }>(),
  {
    description: undefined,
    confirmLabel: "Delete",
    cancelLabel: "Cancel",
    loading: false,
  },
);

const emit = defineEmits<{
  (e: "confirm"): void;
  (e: "cancel"): void;
}>();

const internalOpen = defineModel<boolean>("open");

const onCancel = () => {
  emit("cancel");
  internalOpen.value = false;
};
const onConfirm = () => emit("confirm");
</script>
