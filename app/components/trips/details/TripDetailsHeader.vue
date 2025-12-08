<template>
  <div class="space-y-2">
    <button class="btn btn-soft btn-xs" @click="$emit('back')">← Back</button>
    <h1 class="text-3xl font-light text-primary">{{ trip.title }}</h1>
    <p class="text-sm opacity-80">
      {{ formatDate(trip.startDate) }} → {{ formatDate(trip.endDate) }} ·
      <span class="inline-flex items-center gap-1">
        <Icon class="size-3.5" name="lucide:users" /> {{ trip.people }}
      </span>
      <span class="ms-2">· Currency: {{ trip.currency?.symbol || "¤" }}</span>
    </p>
  </div>
</template>

<script lang="ts" setup>
import type { Trip } from "~/types/tripTypes";
import { useDateUtils } from "~/composables/useDateUtils";

const props = defineProps<{ trip: Trip }>();
const emit = defineEmits<{ (e: "back"): void }>();

const { formatDate } = useDateUtils();
</script>
