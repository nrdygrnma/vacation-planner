<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-base font-medium flex items-center gap-2">
        <UIcon class="size-4" name="i-lucide-bed" /> Stays
      </h3>
      <UButton
        color="primary"
        disabled
        icon="i-lucide-plus"
        label="Add stay"
        size="sm"
      />
    </div>

    <div class="text-sm text-muted italic">
      Accommodations management coming soon.
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Trip } from "~/types/tripTypes";

defineProps<{
  trip: Trip;
}>();
</script>
