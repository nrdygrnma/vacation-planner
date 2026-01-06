<template>
  <div v-if="flight" class="space-y-1.5">
    <div class="flex items-center gap-2">
      <div
        v-if="flight.airlineLogoUrl"
        :class="[
          'size-8 rounded overflow-hidden shrink-0 border shadow-sm flex items-center justify-center bg-white p-1',
          isCurrent ? 'border-primary-200' : 'border-gray-200',
        ]"
      >
        <img
          :src="flight.airlineLogoUrl"
          class="max-w-full max-h-full object-contain"
        />
      </div>
      <div
        :class="[
          'font-medium truncate',
          isCurrent ? 'text-gray-900' : 'text-gray-700',
        ]"
      >
        {{ airlineName }}
      </div>
    </div>
    <div class="ml-10 space-y-1">
      <div
        :class="[
          'text-[11px] font-bold',
          isCurrent ? 'text-primary-600' : 'text-gray-500',
        ]"
      >
        {{ formatEUR(price) }}
      </div>
      <div class="text-[10px] text-gray-500 font-medium leading-tight">
        <div
          :class="[
            'flex items-center gap-1 mb-0.5 font-bold',
            isCurrent ? 'text-gray-900' : 'text-gray-700',
          ]"
        >
          <UIcon class="size-3" name="i-lucide-map-pin" />
          {{ fromAirportCode }} → {{ toAirportCode }}
        </div>
        <div>
          {{ travelClassLabel }}
        </div>
        <div class="flex items-center gap-1 mt-0.5">
          <UIcon class="size-3" name="i-lucide-clock" />
          {{ formattedDuration }}
        </div>
        <div v-if="flight.stops" class="text-orange-600 mt-0.5">
          {{ flight.stops }} stop{{ flight.stops > 1 ? "s" : "" }}
          <span v-if="flight.stopOverDurationMinutes">
            ({{ formattedStopover }})
          </span>
          <div v-if="flight.stopOverAirports?.length" class="text-[9px]">
            via {{ flight.stopOverAirports.join(", ") }}
          </div>
        </div>
        <div v-else class="text-green-600 mt-0.5">Non-stop</div>
      </div>
    </div>
  </div>
  <div v-else class="text-gray-400 italic text-xs">—</div>
</template>

<script lang="ts" setup>
import { useCurrencyUtils } from "@/composables/useCurrencyUtils";

const props = defineProps<{
  flight: any;
  price: number;
  isCurrent?: boolean;
}>();

const { formatEUR } = useCurrencyUtils();

const airlineName = computed(() => {
  return props.flight?.airline?.name || props.flight?.airline || "Unknown";
});

const fromAirportCode = computed(() =>
  getAirportCode(props.flight?.fromAirport),
);
const toAirportCode = computed(() => getAirportCode(props.flight?.toAirport));

const getAirportCode = (airport: any) => {
  if (!airport) return "—";
  if (typeof airport === "string") return airport;
  return airport.symbol || airport.name || "—";
};

const travelClassLabel = computed(() => {
  const val = props.flight?.travelClass;
  if (!val) return "";
  const labels: Record<string, string> = {
    economy: "Economy",
    premium_economy: "Prem. Econ.",
    business: "Business",
  };
  return labels[val] || val;
});

const formattedDuration = computed(() => formatMin(props.flight?.durationMin));
const formattedStopover = computed(() =>
  formatMin(props.flight?.stopOverDurationMinutes),
);

const formatMin = (m: number | undefined | null) => {
  if (m === undefined || m === null || m <= 0) return "";
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h}h ${mm}m`;
};
</script>
