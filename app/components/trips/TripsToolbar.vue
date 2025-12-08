<template>
  <div
    class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
  >
    <h1 class="text-2xl font-semibold text-primary">Trip Overview</h1>

    <div class="flex items-center gap-2 w-full sm:w-auto">
      <UInput
        :model-value="modelValue"
        class="w-full sm:w-64"
        icon="i-lucide-search"
        placeholder="Search trips"
        type="search"
        @update:model-value="(value) => $emit('update:modelValue', value)"
        @keydown.esc="$emit('update:modelValue', '')"
      />

      <TripCreateModal @saved="$emit('created')" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import TripCreateModal from "./TripCreateModal.vue";

defineProps<{ modelValue: string }>();

defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "created"): void;
}>();
</script>
