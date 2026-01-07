<template>
  <div class="flex items-center justify-between gap-4">
    <h1 class="text-3xl text-primary font-bold">Trip Overview</h1>
    <div class="flex items-center gap-2">
      <UInput
        :value="modelValue"
        class="input input-sm w-40 sm:w-64"
        placeholder="Search trips"
        type="search"
        @input="
          $emit('update:modelValue', ($event.target as HTMLInputElement).value)
        "
        @keydown.esc="$emit('update:modelValue', '')"
      />
      <UButton
        color="primary"
        icon="i-lucide-map-pin-plus"
        label="Create trip"
        @click="$emit('open-create')"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{ modelValue: string }>();

defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "open-create"): void;
}>();
</script>
