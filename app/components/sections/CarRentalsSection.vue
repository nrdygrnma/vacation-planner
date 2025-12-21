<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-base font-medium flex items-center gap-2">
        <UIcon class="size-4" name="i-lucide-car" /> Car Rentals
      </h3>
      <UButton color="primary" disabled size="sm">
        <UIcon class="size-4" name="i-lucide-plus" />
        <span class="ms-1">Add rental</span>
      </UButton>
    </div>

    <div class="text-sm text-muted italic">
      Car rentals management coming soon.
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Trip } from "~/types/tripTypes";

defineProps<{
  trip: Trip;
}>();
</script>
