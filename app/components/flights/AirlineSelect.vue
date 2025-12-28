<template>
  <USelectMenu
    v-model="internalValue"
    :items="airlineItems"
    :loading="flightsStore.airlinesLoading"
    class="w-full"
    data-testid="airline-select"
    placeholder="Select airline..."
    searchable
    value-key="value"
  >
    <template #leading>
      <UIcon v-if="selectedIcon" :name="selectedIcon" class="size-4" />
      <UIcon v-else class="size-4 text-gray-400" name="i-lucide-plane" />
    </template>
  </USelectMenu>
</template>

<script lang="ts" setup>
import { useFlightsStore } from "~/stores/flights";

const props = defineProps<{ modelValue: string }>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "change", airline: { name: string; code: string }): void;
}>();

const flightsStore = useFlightsStore();

const airlineItems = computed(() =>
  (flightsStore.airlines || []).map((a) => ({
    label: a.name,
    value: a.name,
    code: a.code,
  })),
);

const internalValue = computed({
  get: () => props.modelValue,
  set: (val: any) => {
    const name = typeof val === "string" ? val : (val?.value ?? val?.label);
    if (!name) return;

    emit("update:modelValue", name);

    const match =
      typeof val === "object" && val?.code
        ? { name, code: val.code }
        : flightsStore.airlines.find((a) => a.name === name);

    if (match) emit("change", { name: match.name, code: match.code });
  },
});

const selectedIcon = computed(() => null);

onMounted(() => {
  flightsStore.fetchAirlines();
});
</script>
