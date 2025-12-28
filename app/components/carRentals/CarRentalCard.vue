<template>
  <BaseItemCard
    :selectable="!selected"
    :selected="selected"
    class="relative overflow-hidden group"
    @click="$emit('select')"
  >
    <template #title>
      <div class="flex items-center gap-2 min-w-0 flex-1">
        <UIcon
          :class="selected ? 'text-primary' : 'text-gray-600'"
          class="size-4 shrink-0"
          name="i-lucide-car"
        />
        <span
          :class="selected ? 'text-primary font-semibold' : 'font-medium'"
          class="truncate"
        >
          {{ rental.company || rental.provider || "Unknown Provider" }}
        </span>
        <span class="text-muted shrink-0">·</span>
        <span class="truncate">{{ rental.carType?.name || "Car" }}</span>
      </div>
      <div v-if="selected" class="flex items-center gap-1.5 shrink-0">
        <UBadge color="primary" size="sm" variant="soft">Selected</UBadge>
        <UIcon class="size-5 text-primary" name="i-lucide-check-circle-2" />
      </div>
    </template>

    <template #subtitle>
      <div class="space-y-1">
        <div class="flex items-center gap-2 text-xs">
          <UIcon class="size-3 text-gray-400" name="i-lucide-map-pin" />
          <span class="truncate"
            >{{ rental.pickupLocation }} →
            {{ rental.dropOffLocation || rental.dropoffLocation }}</span
          >
        </div>
        <div class="flex items-center gap-2 text-xs">
          <UIcon class="size-3 text-gray-400" name="i-lucide-calendar" />
          <span class="truncate"
            >{{ formatDate(rental.pickupDate) }} -
            {{ formatDate(rental.dropOffDate || rental.dropoffDate) }}</span
          >
        </div>
        <div
          class="text-xs text-gray-500 pt-1 flex items-center flex-wrap gap-x-2"
        >
          <span v-if="totalPriceDisplay" class="font-medium text-gray-900">
            {{ totalPriceDisplay }}
          </span>
          <UPopover mode="hover">
            <UIcon
              class="size-3 text-gray-400 cursor-help"
              name="i-lucide-info"
            />
            <template #content>
              <div class="p-2 text-xs space-y-1">
                <div class="flex justify-between gap-4">
                  <span>Base Rate:</span>
                  <span>{{ formatCurrency(rental.baseRate) }}</span>
                </div>
                <div v-if="rental.fees" class="flex justify-between gap-4">
                  <span>Fees:</span>
                  <span>{{ formatCurrency(rental.fees) }}</span>
                </div>
                <div
                  v-if="rental.insurancePerDay"
                  class="flex justify-between gap-4"
                >
                  <span>Insurance/Day:</span>
                  <span>{{ formatCurrency(rental.insurancePerDay) }}</span>
                </div>
              </div>
            </template>
          </UPopover>

          <UPopover
            :content="{ align: 'center', side: 'top', sideOffset: 8 }"
            arrow
          >
            <UButton
              color="neutral"
              icon="i-lucide-eye"
              label="Details"
              size="xs"
              variant="ghost"
              @click.stop
            />
            <template #content>
              <div class="p-4 space-y-4 text-sm max-w-sm">
                <div class="grid grid-cols-2 gap-6">
                  <div>
                    <span
                      class="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-1"
                      >Provider</span
                    >
                    <p class="font-semibold text-gray-900 leading-tight">
                      {{ rental.company || rental.provider }}
                    </p>
                    <p class="text-[11px] text-gray-500 font-medium">
                      {{ rental.carType?.name || "Standard Car" }}
                    </p>
                  </div>
                  <div>
                    <span
                      class="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-1"
                      >Locations</span
                    >
                    <p
                      class="font-semibold text-gray-900 leading-tight truncate"
                    >
                      {{ rental.pickupLocation }}
                    </p>
                    <p class="text-[11px] text-gray-500 font-medium truncate">
                      to {{ rental.dropOffLocation || rental.dropoffLocation }}
                    </p>
                  </div>
                </div>

                <div class="space-y-2 border-t pt-3">
                  <span
                    class="text-[10px] text-gray-400 uppercase font-bold tracking-wider block"
                    >Rental Period</span
                  >
                  <div class="space-y-1.5">
                    <div class="text-[11px] flex items-center gap-2">
                      <UIcon
                        class="size-3 text-green-500"
                        name="i-lucide-arrow-up-right"
                      />
                      <span class="text-gray-600">Pick-up:</span>
                      <span
                        class="font-medium text-gray-900 ml-auto tabular-nums"
                        >{{ formatDate(rental.pickupDate) }}</span
                      >
                    </div>
                    <div class="text-[11px] flex items-center gap-2">
                      <UIcon
                        class="size-3 text-blue-500"
                        name="i-lucide-arrow-down-left"
                      />
                      <span class="text-gray-600">Drop-off:</span>
                      <span
                        class="font-medium text-gray-900 ml-auto tabular-nums"
                        >{{
                          formatDate(rental.dropOffDate || rental.dropoffDate)
                        }}</span
                      >
                    </div>
                  </div>
                </div>

                <div
                  v-if="rental.notes"
                  class="bg-gray-50 p-2.5 rounded-md border border-gray-100"
                >
                  <span
                    class="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-1"
                    >Notes</span
                  >
                  <p class="text-[11px] leading-relaxed text-gray-600 italic">
                    "{{ rental.notes }}"
                  </p>
                </div>
              </div>
            </template>
          </UPopover>
        </div>
      </div>
    </template>

    <template #trailing>
      <div class="flex items-center gap-1" @click.stop>
        <UTooltip
          :content="{ align: 'center', side: 'top', sideOffset: 8 }"
          arrow
          text="Select rental"
        >
          <UButton
            v-if="!selected"
            color="primary"
            icon="i-lucide-check"
            label="Select"
            size="sm"
            variant="soft"
            @click="$emit('select')"
          />
        </UTooltip>
        <UTooltip
          :content="{ align: 'center', side: 'top', sideOffset: 8 }"
          arrow
          text="Edit"
        >
          <UButton
            icon="i-lucide-edit"
            variant="outline"
            @click="$emit('edit')"
          />
        </UTooltip>

        <UTooltip
          :content="{ align: 'center', side: 'top', sideOffset: 8 }"
          arrow
          text="Delete"
        >
          <UButton
            color="error"
            icon="i-lucide-trash"
            variant="outline"
            @click="$emit('delete')"
          />
        </UTooltip>
      </div>
    </template>
  </BaseItemCard>
</template>

<script lang="ts" setup>
import BaseItemCard from "~/components/base/BaseItemCard.vue";
import type { CarRentalOption } from "~/types/tripTypes";

const props = defineProps<{
  rental: CarRentalOption;
  selected?: boolean;
}>();

defineEmits<{
  (e: "edit"): void;
  (e: "delete"): void;
  (e: "select"): void;
}>();

const formatDate = (date: string | null | undefined) => {
  if (!date) return "";
  return new Date(date).toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  });
};

const formatCurrency = (val: number | string | undefined | null) => {
  const v = Number(val) || 0;
  const symbol = props.rental.currency?.symbol || "€";
  return `${symbol}${v.toFixed(2)}`;
};

const totalPriceDisplay = computed(() => {
  // Logic should match server-side total calculation if possible, or just display stored total
  if (props.rental.totalCostEUR) {
    // If we have totalCostEUR, we might want to show it in user's currency if available
    // For now, let's calculate from components for consistency with FlightCard
  }

  const base = Number(props.rental.baseRate) || 0;
  const fees = Number(props.rental.fees) || 0;

  const start = new Date(props.rental.pickupDate);
  const end = new Date(
    props.rental.dropOffDate || (props.rental as any).dropoffDate,
  );
  const diffDays = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
  );

  const insurance = (Number(props.rental.insurancePerDay) || 0) * diffDays;
  const total = base + fees + insurance;

  if (total <= 0) return "";
  return formatCurrency(total);
});
</script>
