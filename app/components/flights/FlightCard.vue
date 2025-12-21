<template>
  <BaseItemCard
    :selectable="!selected"
    :selected="selected"
    @click="$emit('select')"
  >
    <template #title>
      <div class="flex items-center gap-2 min-w-0 flex-1">
        <UIcon
          :class="selected ? 'text-primary' : 'text-gray-600'"
          class="size-4 shrink-0"
          name="i-lucide-plane"
        />
        <span
          :class="selected ? 'text-primary font-semibold' : 'font-medium'"
          class="truncate"
        >
          {{ airline }}
        </span>
        <span class="text-muted shrink-0">·</span>
        <span class="truncate">{{ fromLabel }} → {{ toLabel }}</span>
      </div>
      <div v-if="selected" class="flex items-center gap-1.5 shrink-0">
        <UBadge color="primary" size="sm" variant="soft">Selected</UBadge>
        <UIcon class="size-5 text-primary" name="i-lucide-check-circle-2" />
      </div>
    </template>

    <template #subtitle>
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <UBadge color="neutral" size="xs" variant="subtle">Outbound</UBadge>
          <span v-if="outboundDuration" class="truncate">{{
            outboundDuration
          }}</span>
          <span v-if="outboundNet" class="text-xs text-gray-400"
            >(Net: {{ outboundNet }})</span
          >
          <span v-if="outboundStopover" class="text-xs text-orange-500"
            >·&nbsp;&nbsp;Stopover: {{ outboundStopover }}</span
          >
        </div>
        <div v-if="flight.isRoundTrip" class="flex items-center gap-2">
          <UBadge color="neutral" size="xs" variant="subtle">Return</UBadge>
          <span v-if="returnDuration" class="truncate">{{
            returnDuration
          }}</span>
          <span v-if="returnNet" class="text-xs text-gray-400"
            >(Net: {{ returnNet }})</span
          >
          <span v-if="returnStopover" class="text-xs text-orange-500"
            >·&nbsp;&nbsp;Stopover: {{ returnStopover }}</span
          >
        </div>
        <div
          class="text-xs text-gray-500 pt-1 flex items-center flex-wrap gap-x-2"
        >
          <span v-if="stops !== undefined">Stops: {{ stops }}</span>
          <span v-if="totalPriceDisplay" class="font-medium text-gray-900">
            · {{ totalPriceDisplay }}
          </span>
          <UPopover v-if="hasExtras" mode="hover">
            <UIcon
              class="size-3 text-gray-400 cursor-help"
              name="i-lucide-info"
            />
            <template #content>
              <div class="p-2 text-xs space-y-1">
                <div class="flex justify-between gap-4">
                  <span>Base Fare:</span>
                  <span>{{ formatCurrency(flight.baseFare) }}</span>
                </div>
                <div
                  v-if="flight.extras?.seatReservation"
                  class="flex justify-between gap-4"
                >
                  <span>Seat:</span>
                  <span>{{
                    formatCurrency(flight.extras.seatReservation)
                  }}</span>
                </div>
                <div
                  v-if="flight.extras?.checkedBaggage"
                  class="flex justify-between gap-4"
                >
                  <span>Baggage:</span>
                  <span>{{
                    formatCurrency(flight.extras.checkedBaggage)
                  }}</span>
                </div>
                <div
                  v-if="flight.extras?.other"
                  class="flex justify-between gap-4"
                >
                  <span>Other:</span>
                  <span>{{ formatCurrency(flight.extras.other) }}</span>
                </div>
              </div>
            </template>
          </UPopover>
        </div>
      </div>
    </template>

    <template #trailing>
      <div class="flex items-center gap-1" @click.stop>
        <UButton
          color="neutral"
          icon="i-lucide-pencil"
          size="sm"
          variant="outline"
          @click="$emit('edit')"
        />
        <UButton
          color="error"
          icon="i-lucide-trash"
          size="sm"
          variant="outline"
          @click="$emit('delete')"
        />
      </div>
    </template>
  </BaseItemCard>
</template>

<script lang="ts" setup>
import BaseItemCard from "~/components/base/BaseItemCard.vue";
import type { FlightOption } from "~/types/tripTypes";

const props = defineProps<{
  flight: FlightOption;
  selected?: boolean;
}>();

const airline = computed(() => {
  const f = props.flight as any;
  return f.airline?.name || f.airline || "—";
});

const fromLabel = computed(() => {
  const f = props.flight as any;
  return f.fromAirport?.symbol || f.fromAirport?.name || f.fromAirport || "—";
});

const toLabel = computed(() => {
  const f = props.flight as any;
  return f.toAirport?.symbol || f.toAirport?.name || f.toAirport || "—";
});

const formatMin = (m: number | undefined | null) => {
  if (m === undefined || m === null || m <= 0) return "";
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h}h ${mm}m`;
};

const outboundDuration = computed(() =>
  formatMin(props.flight.outboundDurationMin),
);
const outboundNet = computed(() =>
  formatMin(props.flight.outboundNetDurationMin),
);
const outboundStopover = computed(() =>
  formatMin(props.flight.outboundStopoverMin),
);

const returnDuration = computed(() =>
  formatMin(props.flight.returnDurationMin),
);
const returnNet = computed(() => formatMin(props.flight.returnNetDurationMin));
const returnStopover = computed(() =>
  formatMin(props.flight.returnStopoverMin),
);

const stops = computed(() => props.flight.stops);

const hasExtras = computed(() => {
  const e = props.flight.extras;
  if (!e) return false;
  return !!(e.seatReservation || e.checkedBaggage || e.other);
});

const formatCurrency = (val: number | string | undefined | null) => {
  const v = Number(val) || 0;
  const symbol = props.flight.currency?.symbol || "€";
  return `${symbol}${v.toFixed(2)}`;
};

const totalPriceDisplay = computed(() => {
  const base = Number(props.flight.baseFare) || 0;
  const seat = Number(props.flight.extras?.seatReservation) || 0;
  const bag = Number(props.flight.extras?.checkedBaggage) || 0;
  const other = Number(props.flight.extras?.other) || 0;
  const total = base + seat + bag + other;

  if (total <= 0) return "";
  return formatCurrency(total);
});

defineEmits<{ (e: "edit"): void; (e: "delete"): void; (e: "select"): void }>();
</script>
