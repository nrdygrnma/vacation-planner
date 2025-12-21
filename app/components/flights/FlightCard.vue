<template>
  <BaseItemCard>
    <template #title>
      <div class="flex items-center gap-2 min-w-0">
        <UIcon class="size-4 text-gray-600" name="i-lucide-plane" />
        <span class="font-medium truncate">{{ airline }}</span>
        <span class="text-muted">·</span>
        <span class="truncate">{{ fromLabel }} → {{ toLabel }}</span>
      </div>
    </template>

    <template #subtitle>
      <span v-if="duration" class="truncate">{{ duration }}</span>
      <span v-if="stops !== undefined" class="ms-1 text-gray-500"
        >· Stops: {{ stops }}</span
      >
      <span v-if="cost" class="ms-1">· {{ cost }}</span>
    </template>

    <template #trailing>
      <UButton color="neutral" size="xs" variant="soft" @click="$emit('edit')"
        >Edit</UButton
      >
      <UButton color="error" size="xs" variant="soft" @click="$emit('delete')"
        >Delete</UButton
      >
      <UButton color="primary" size="xs" @click="$emit('select')"
        >Select</UButton
      >
    </template>
  </BaseItemCard>
</template>

<script lang="ts" setup>
import BaseItemCard from "~/components/base/BaseItemCard.vue";
import type { FlightOption } from "~/types/tripTypes";

const props = defineProps<{ flight: FlightOption }>();

const airline = computed(() => props.flight.airline?.name || "—");
const fromLabel = computed(
  () =>
    props.flight.fromAirport?.symbol || props.flight.fromAirport?.name || "—",
);
const toLabel = computed(
  () => props.flight.toAirport?.symbol || props.flight.toAirport?.name || "—",
);

const duration = computed(() => {
  const m = props.flight.durationMin;
  if (m === undefined || m === null) return "";
  const h = Math.floor(m / 60),
    mm = m % 60;
  return `${h}h ${mm}m`;
});
const stops = computed(() => props.flight.stops);
const cost = computed(() => {
  const v = Number(props.flight.totalCostEUR);
  if (!isFinite(v) || v <= 0) return "";
  return `${v}` + (props.flight.currencyId ? "" : "");
});

defineEmits<{ (e: "edit"): void; (e: "delete"): void; (e: "select"): void }>();
</script>
