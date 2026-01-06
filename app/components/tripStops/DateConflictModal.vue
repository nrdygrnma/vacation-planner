<template>
  <UModal
    v-model:open="isOpen"
    :description="description"
    :title="title"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <div class="space-y-4">
        <p class="text-sm text-gray-600">
          The new order of stops doesn't match the existing dates. Would you
          like to automatically adjust the dates of subsequent stops to maintain
          the sequence?
        </p>

        <div class="space-y-2">
          <UButton
            class="w-full justify-start"
            color="primary"
            icon="i-lucide-calendar-range"
            variant="outline"
            @click="resolve('shift')"
          >
            <div class="text-left">
              <div class="font-medium">Shift dates automatically</div>
              <div class="text-[10px] text-gray-500">
                Keep stop durations and move dates forward to match new order.
              </div>
            </div>
          </UButton>

          <UButton
            class="w-full justify-start"
            color="neutral"
            icon="i-lucide-list-ordered"
            variant="outline"
            @click="resolve('keep')"
          >
            <div class="text-left">
              <div class="font-medium">Keep original dates</div>
              <div class="text-[10px] text-gray-500">
                Only update the order, but keep the dates as they are.
              </div>
            </div>
          </UButton>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="w-full flex justify-end gap-2">
        <UButton
          color="neutral"
          label="Cancel Drag"
          variant="outline"
          @click="isOpen = false"
        />
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
const props = defineProps<{
  title?: string;
  description?: string;
}>();

const isOpen = defineModel<boolean>("open", { default: false });

const emit = defineEmits<{
  (e: "resolve", action: "shift" | "keep" | "cancel"): void;
}>();

const resolve = (action: "shift" | "keep" | "cancel") => {
  emit("resolve", action);
  isOpen.value = false;
};

const title = computed(() => props.title || "Adjust dates?");
const description = computed(
  () => props.description || "Chronological conflict detected",
);
</script>
