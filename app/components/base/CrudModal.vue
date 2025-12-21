<template>
  <UModal
    v-model:open="model"
    :description="description"
    :title="title"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <slot />
    </template>

    <template #footer>
      <div class="flex items-center gap-2">
        <UButton
          :label="cancelLabel"
          color="neutral"
          variant="outline"
          @click="onCancel"
        />
        <UButton :label="submitLabel" color="primary" @click="onSubmit" />
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
const props = withDefaults(
  defineProps<{
    title: string;
    description?: string;
    open: boolean;
    submitLabel?: string;
    cancelLabel?: string;
  }>(),
  {
    submitLabel: "Save",
    cancelLabel: "Cancel",
  },
);

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "close"): void;
  (e: "submit"): void;
  (e: "cancel"): void;
}>();

const model = computed({
  get: () => props.open,
  set: (v: boolean) => emit("update:open", v),
});

const onClose = () => {
  emit("update:open", false);
  emit("close");
};

const onCancel = () => {
  emit("cancel");
  onClose();
};

const onSubmit = () => {
  emit("submit");
};
</script>
