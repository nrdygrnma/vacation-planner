<template>
  <div class="p-3 border border-gray-300 rounded-lg bg-gray-50/50 space-y-3 relative"
    data-testid="flight-segment"
  >
    <UButton v-if="removable"
      class="absolute -top-2 -right-2 rounded-full"
      color="error"
      data-testid="remove-segment"
      icon="i-lucide-x"
      size="xs"
      variant="solid"
      @click="$emit('remove')"
    />

    <div class="grid grid-cols-1 gap-3 w-full">
      <div class="grid grid-cols-2 gap-4">
        <UFormField :name="`${namePrefix}.fromAirport`" label="From" required>
          <UInput
            v-model="modelValue.fromAirport"
            class="w-full"
            placeholder="LHR"
          />
        </UFormField>
        <UFormField
          :name="`${namePrefix}.fromAirportTimezone`"
          label="Timezone"
          required
        >
          <USelectMenu
            v-model="modelValue.fromAirportTimezone"
            :items="timezoneOptions"
            class="w-full"
            searchable
            value-key="value"
          />
        </UFormField>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <UFormField :name="`${namePrefix}.toAirport`" label="To" required>
          <UInput
            v-model="modelValue.toAirport"
            class="w-full"
            placeholder="CDG"
          />
        </UFormField>
        <UFormField
          :name="`${namePrefix}.toAirportTimezone`"
          label="Timezone"
          required
        >
          <USelectMenu
            v-model="modelValue.toAirportTimezone"
            :items="timezoneOptions"
            class="w-full"
            searchable
            value-key="value"
          />
        </UFormField>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <UFormField
          :name="`${namePrefix}.departureDate`"
          label="Departure Date"
          required
        >
          <UInput v-model="modelValue.departureDate" class="w-full" type="date"/>
        </UFormField>
        <UFormField :name="`${namePrefix}.departureTime`" label="Time" required>
          <UInput v-model="modelValue.departureTime" class="w-full" type="time" />
        </UFormField>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <UFormField
          :name="`${namePrefix}.arrivalDate`"
          label="Arrival Date"
          required
        >
          <UInput v-model="modelValue.arrivalDate" class="w-full" type="date" />
        </UFormField>
        <UFormField :name="`${namePrefix}.arrivalTime`" label="Time" required>
          <UInput v-model="modelValue.arrivalTime" class="w-full" type="time" />
        </UFormField>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
export interface FormSegment {
  fromAirport: string;
  fromAirportTimezone: string;
  toAirport: string;
  toAirportTimezone: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  isReturn: boolean;
}

defineProps<{
  modelValue: FormSegment;
  namePrefix: string;
  timezoneOptions: { label: string; value: string }[];
  removable?: boolean;
}>();

defineEmits<{
  (e: "remove"): void;
}>();
</script>
