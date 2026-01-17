<template>
  <div
    class="overflow-hidden rounded-lg bg-white shadow-xl ring-1 ring-gray-200 w-72"
  >
    <!-- Image Carousel -->
    <div v-if="accommodation.images?.length" class="border-b border-gray-100">
      <AccommodationsImageCarousel :images="accommodation.images" />
    </div>
    <div
      v-else
      class="w-full h-40 bg-gray-100 flex items-center justify-center border-b border-gray-100"
    >
      <UIcon class="size-10 text-gray-300" name="i-lucide-bed" />
    </div>

    <div class="p-4 space-y-4 text-sm">
      <div>
        <span
          class="text-[10px] text-gray-400 uppercase font-bold tracking-wider flex items-center gap-1 mb-0.5"
        >
          <UIcon class="size-3" name="i-lucide-bed" />
          Accommodation
        </span>
        <p class="font-semibold text-gray-900 leading-tight">
          {{ accommodation.name }}
        </p>
        <p class="text-[11px] text-gray-500 font-medium">
          {{ accommodation.roomType?.name || "Standard" }} ·
          {{ accommodation.provider || "Direct" }}
        </p>
      </div>

      <div class="grid grid-cols-2 gap-4 border-t pt-3">
        <div>
          <span
            class="text-[10px] text-gray-400 uppercase font-bold tracking-wider flex items-center gap-1 mb-0.5"
          >
            <UIcon class="size-3" name="i-lucide-calendar" />
            Dates
          </span>
          <p class="text-[11px] text-gray-700 font-medium">
            {{ dateRange }}
          </p>
        </div>
        <div>
          <span
            class="text-[10px] text-gray-400 uppercase font-bold tracking-wider flex items-center gap-1 mb-0.5"
          >
            <UIcon class="size-3" name="i-lucide-circle-dollar-sign" />
            Price
          </span>
          <div class="space-y-0.5">
            <p
              class="text-sm font-bold text-gray-700 leading-none flex items-baseline gap-2"
            >
              {{ formatCurrency(displayPrice.value, accommodation) }}
              <span
                v-if="eurBracket"
                class="text-[11px] font-medium text-gray-500"
              >
                ({{ eurBracket }})
              </span>
            </p>
            <p
              class="text-[10px] text-gray-500 font-medium flex items-center gap-1"
            >
              <span class="uppercase tracking-tighter">{{
                displayPrice.label
              }}</span>
              <span v-if="secondaryPrice" class="italic opacity-70">
                ({{ formatCurrency(secondaryPrice.value, accommodation)
                }}{{ secondaryPrice.label }})
              </span>
            </p>
          </div>
        </div>
      </div>

      <!-- Booking Link -->
      <div v-if="accommodation.url" class="border-t pt-3">
        <UButton
          :to="accommodation.url"
          block
          class="text-[11px]"
          color="primary"
          icon="i-lucide-external-link"
          size="xs"
          target="_blank"
        >
          View Booking Website
        </UButton>
      </div>

      <div
        v-if="accommodation.notes"
        class="bg-gray-50 p-2.5 rounded-md border border-gray-100"
      >
        <span
          class="text-[10px] text-gray-400 uppercase font-bold tracking-wider flex items-center gap-1 mb-1"
        >
          <UIcon class="size-3" name="i-lucide-sticky-note" />
          Notes
        </span>
        <p
          class="text-[11px] leading-relaxed text-gray-600 italic whitespace-pre-wrap"
        >
          "{{ accommodation.notes }}"
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import type { AccommodationOption } from "~/types/tripTypes";
import { useCurrencyUtils } from "~/composables/useCurrencyUtils";

const props = defineProps<{
  accommodation: AccommodationOption;
  dateRange: string;
  nights: number;
}>();

const displayPrice = computed(() =>
  getDisplayPrice(props.accommodation, props.nights),
);
const secondaryPrice = computed(() =>
  getSecondaryPrice(props.accommodation, props.nights),
);

const { convertToEUR, formatEUR } = useCurrencyUtils();
const eurBracket = computed<string | null>(() => {
  const acc = props.accommodation;
  if (!acc?.currencyId) return null;
  // Skip when already EUR
  if ((acc.currency?.symbol || "").toUpperCase() === "EUR") return null;
  const total = Number(displayPrice.value.value) || 0;
  if (total <= 0) return null;
  const eur = convertToEUR(total, acc.currencyId);
  return formatEUR(eur);
});

const getDisplayPrice = (acc: AccommodationOption, nightsCount: number) => {
  if (acc.totalPrice) return { value: acc.totalPrice, label: "total" };
  if (acc.nightlyRate) {
    const total = Number(acc.nightlyRate) * (nightsCount || 0);
    return { value: total, label: "total est." };
  }
  return { value: 0, label: "total" };
};

const getSecondaryPrice = (acc: AccommodationOption, nightsCount: number) => {
  if (acc.totalPrice && nightsCount > 0) {
    return { value: Number(acc.totalPrice) / nightsCount, label: "/ night" };
  }
  if (acc.nightlyRate) {
    return { value: acc.nightlyRate, label: "/ night" };
  }
  return null;
};

const formatCurrency = (
  amount: number | string | null | undefined,
  acc: AccommodationOption,
) => {
  const value = Number(amount) || 0;
  const symbol = acc.currency?.symbol || "€";
  const formatted = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return `${symbol}${formatted}`;
};
</script>
