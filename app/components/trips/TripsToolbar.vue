<template>
  <div class="flex items-center justify-between gap-4">
    <h1 class="text-3xl text-primary font-light">Trip Overview</h1>
    <div class="flex items-center gap-2">
      <input
        :value="modelValue"
        aria-label="Search trips"
        class="input input-sm w-40 sm:w-64"
        placeholder="Search trips"
        type="search"
        @input="
          $emit('update:modelValue', ($event.target as HTMLInputElement).value)
        "
        @keydown.esc="$emit('update:modelValue', '')"
      />
      <TripCreateModal @saved="$emit('created')" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import TripCreateModal from "./modals/TripCreateModal.vue";

defineProps<{ modelValue: string }>();

defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "created"): void;
}>();
</script>
