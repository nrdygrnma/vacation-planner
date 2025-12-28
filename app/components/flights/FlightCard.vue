<template>
  <BaseItemCard
    :selectable="!selected"
    :selected="selected"
    class="relative overflow-hidden group"
    @click="$emit('select')"
  >
    <template #title>
      <div class="flex items-center gap-3 min-w-0 flex-1">
        <div
          v-if="flight.airlineLogoUrl"
          class="w-12 h-10 shrink-0 rounded overflow-hidden border border-gray-300 shadow-sm flex items-center justify-center bg-white"
        >
          <img
            :src="flight.airlineLogoUrl"
            alt="Airline"
            class="max-w-full max-h-full object-contain p-1"
          />
        </div>
        <div
          v-else
          class="size-10 bg-gray-50 flex items-center justify-center shrink-0 rounded border border-gray-300"
        >
          <UIcon
            :class="selected ? 'text-primary' : 'text-gray-400'"
            class="size-5"
            name="i-lucide-plane"
          />
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <span
              :class="selected ? 'text-primary font-semibold' : 'font-medium'"
              class="truncate text-sm"
            >
              {{ airline }}
            </span>
            <span class="text-muted shrink-0 text-xs">·</span>
            <span class="truncate text-gray-500 text-xs"
              >{{ fromLabel }} → {{ toLabel }}</span
            >
          </div>
        </div>
      </div>
      <div v-if="selected" class="flex items-center gap-1.5 shrink-0 ml-2">
        <UBadge color="primary" size="sm" variant="soft">Selected</UBadge>
        <UIcon class="size-5 text-primary" name="i-lucide-check-circle-2" />
      </div>
    </template>

    <template #subtitle>
      <div class="space-y-1.5 mt-2">
        <div class="flex items-center gap-2 text-xs text-gray-600">
          <UBadge
            class="w-16 justify-center"
            color="neutral"
            size="xs"
            variant="subtle"
            >Outbound</UBadge
          >
          <span v-if="outboundDuration" class="font-medium text-gray-700">{{
            outboundDuration
          }}</span>
          <span v-if="outboundNet" class="text-[10px] text-gray-400"
            >(Net: {{ outboundNet }})</span
          >
          <span
            v-if="outboundStopover"
            class="text-[10px] text-orange-500 font-medium"
            >· Stopover: {{ outboundStopover }}</span
          >
        </div>
        <div
          v-if="flight.isRoundTrip"
          class="flex items-center gap-2 text-xs text-gray-600"
        >
          <UBadge
            class="w-16 justify-center"
            color="neutral"
            size="xs"
            variant="subtle"
            >Return</UBadge
          >
          <span v-if="returnDuration" class="font-medium text-gray-700">{{
            returnDuration
          }}</span>
          <span v-if="returnNet" class="text-[10px] text-gray-400"
            >(Net: {{ returnNet }})</span
          >
          <span
            v-if="returnStopover"
            class="text-[10px] text-orange-500 font-medium"
            >· Stopover: {{ returnStopover }}</span
          >
        </div>
        <div
          class="text-xs text-gray-500 pt-1 flex items-center flex-wrap gap-x-3 gap-y-1"
        >
          <div class="flex items-center gap-1.5">
            <UIcon class="size-3 text-gray-400" name="i-lucide-list" />
            <span v-if="stops !== undefined">Stops: {{ stops }}</span>
          </div>

          <div v-if="totalPriceDisplay" class="flex items-center gap-1.5">
            <UIcon class="size-3 text-gray-400" name="i-lucide-banknote" />
            <span class="font-extrabold text-gray-900 text-[13px]">
              {{ totalPriceDisplay }}
            </span>
          </div>

          <UPopover v-if="hasExtras" mode="hover">
            <UButton
              class="p-0.5"
              color="neutral"
              icon="i-lucide-info"
              size="xs"
              variant="ghost"
              @click.stop
            />
            <template #content>
              <div class="p-2.5 text-xs space-y-1.5 min-w-[160px]">
                <div class="flex justify-between gap-4">
                  <span class="text-gray-500">Base Fare:</span>
                  <span class="font-medium">{{
                    formatCurrency(flight.baseFare)
                  }}</span>
                </div>
                <div
                  v-if="flight.extras?.seatReservation"
                  class="flex justify-between gap-4"
                >
                  <span class="text-gray-500">Seat:</span>
                  <span class="font-medium">{{
                    formatCurrency(flight.extras.seatReservation)
                  }}</span>
                </div>
                <div
                  v-if="flight.extras?.checkedBaggage"
                  class="flex justify-between gap-4"
                >
                  <span class="text-gray-500">Baggage:</span>
                  <span class="font-medium">{{
                    formatCurrency(flight.extras.checkedBaggage)
                  }}</span>
                </div>
                <div
                  v-if="flight.extras?.other"
                  class="flex justify-between gap-4"
                >
                  <span class="text-gray-500">Other:</span>
                  <span class="font-medium">{{
                    formatCurrency(flight.extras.other)
                  }}</span>
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
              <div class="p-3 space-y-3 text-sm min-w-[320px] max-w-sm">
                <div class="flex items-center gap-3">
                  <div
                    v-if="flight.airlineLogoUrl"
                    class="w-10 h-8 rounded-md overflow-hidden border border-gray-300 bg-white flex items-center justify-center p-1.5 shrink-0"
                  >
                    <img
                      :src="flight.airlineLogoUrl"
                      alt="Airline Logo"
                      class="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div class="min-w-0 flex-1">
                    <span
                      class="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-0.5"
                      >Flight</span
                    >
                    <p
                      class="font-semibold text-gray-900 leading-tight truncate"
                    >
                      {{ airline }}
                    </p>
                    <p class="text-[11px] text-gray-500 font-medium truncate">
                      {{ flight.flightNumber }} · {{ travelClassLabel }}
                    </p>
                  </div>
                </div>

                <div class="border-t border-gray-300 pt-3">
                  <span
                    class="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-1"
                    >Route</span
                  >
                  <p class="font-semibold text-gray-900 leading-tight">
                    {{ fullFromAirport }} → {{ fullToAirport }}
                  </p>
                </div>

                <!-- Segments -->
                <div
                  v-if="flight.segments?.length"
                  class="space-y-3 border-t border-gray-300 pt-4"
                >
                  <span
                    class="text-[10px] text-gray-400 uppercase font-bold tracking-wider block"
                    >Segments ({{ flight.segments.length }})</span
                  >
                  <div class="space-y-2">
                    <div
                      v-for="(seg, i) in flight.segments"
                      :key="i"
                      class="text-[12px] flex items-center gap-3 group/seg p-2 rounded-md hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-300"
                    >
                      <UIcon
                        :name="
                          seg.isReturn ? 'i-lucide-undo-2' : 'i-lucide-redo-2'
                        "
                        class="size-3.5 text-gray-400 group-hover/seg:text-primary transition-colors shrink-0"
                      />
                      <div class="flex flex-col">
                        <span class="font-bold text-gray-900 leading-none mb-1"
                          >{{ seg.fromAirport }} → {{ seg.toAirport }}</span
                        >
                        <span
                          class="text-[10px] text-gray-500 font-medium tabular-nums"
                          >{{ formatDateTime(seg.departureDate) }}</span
                        >
                      </div>
                      <div class="ml-auto text-right">
                        <UBadge
                          v-if="seg.isReturn"
                          color="neutral"
                          size="xs"
                          variant="subtle"
                          >Return</UBadge
                        >
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  v-if="flight.notes"
                  class="bg-gray-50 p-2.5 rounded-md border border-gray-300"
                >
                  <span
                    class="text-[10px] text-gray-400 uppercase font-bold tracking-wider block mb-1"
                    >Notes</span
                  >
                  <p class="text-[11px] leading-relaxed text-gray-600 italic">
                    "{{ flight.notes }}"
                  </p>
                </div>

                <div
                  v-if="flight.bookingUrl"
                  class="pt-2 border-t border-gray-300 flex justify-center"
                >
                  <UButton
                    :to="flight.bookingUrl"
                    block
                    color="primary"
                    icon="i-lucide-external-link"
                    label="Book this flight"
                    size="sm"
                    target="_blank"
                    @click.stop
                  />
                </div>
              </div>
            </template>
          </UPopover>
        </div>
      </div>
    </template>

    <template #trailing>
      <div class="flex items-center gap-1 py-3 pr-3" @click.stop>
        <UTooltip
          v-if="!selected"
          :content="{ align: 'center', side: 'top', sideOffset: 8 }"
          arrow
          text="Select flight"
        >
          <UButton
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
import type { FlightOption } from "~/types/tripTypes";

const props = defineProps<{
  flight: FlightOption;
  selected?: boolean;
}>();

const showDetails = ref(false);

const airline = computed(() => {
  const f = props.flight as any;
  return f.airline?.name || f.airline || "—";
});

const fullFromAirport = computed(() => {
  const f = props.flight as any;
  return f.fromAirport?.name || f.fromAirport?.symbol || f.fromAirport || "—";
});

const fullToAirport = computed(() => {
  const f = props.flight as any;
  return f.toAirport?.name || f.toAirport?.symbol || f.toAirport || "—";
});

const travelClassLabel = computed(() => {
  const labels: Record<string, string> = {
    economy: "Economy",
    premium_economy: "Premium Economy",
    business: "Business",
  };
  return labels[props.flight.travelClass] || props.flight.travelClass;
});

const formatDate = (date: string | null | undefined) => {
  if (!date) return "";
  return new Date(date).toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "short",
  });
};

const formatDateTime = (date: string | null | undefined) => {
  if (!date) return "—";
  return new Date(date).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

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
