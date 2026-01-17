<template>
  <div
    v-if="stop.selectedAccommodation"
    class="bg-primary-50 rounded border border-primary-100 flex items-center justify-between group/stay cursor-pointer hover:bg-primary-100/50 transition-colors overflow-hidden h-12"
    @click="$emit('toggleExpand')"
  >
    <div class="flex items-center gap-3 min-w-0 flex-1 h-full">
      <div
        v-if="stop.selectedAccommodation.images?.length"
        class="w-16 h-full shrink-0 relative"
      >
        <img
          v-if="stop.selectedAccommodation.images?.[0]?.url"
          :src="stop.selectedAccommodation.images[0].url"
          alt="Stay"
          class="size-full object-cover"
        />
        <div
          v-if="stop.selectedAccommodation.images.length > 1"
          class="absolute bottom-0 right-0 bg-black/50 text-[8px] text-white px-1 font-bold z-10"
        >
          +{{ stop.selectedAccommodation.images.length - 1 }}
        </div>
      </div>
      <div
        v-else
        class="w-16 h-full bg-primary-100 flex items-center justify-center shrink-0"
      >
        <UIcon class="size-5 text-primary-600" name="i-lucide-bed" />
      </div>
      <div class="min-w-0 flex-1 py-1">
        <div class="flex items-center gap-1.5 min-w-0">
          <UIcon class="size-3 text-primary-600 shrink-0" name="i-lucide-bed" />
          <p class="text-xs font-semibold text-primary-900 truncate">
            {{ stop.selectedAccommodation.name }}
          </p>
        </div>
        <div class="flex items-baseline gap-1.5 mt-0.5 ml-4">
          <span class="text-sm font-bold text-primary-700">
            {{
              formatCurrency(
                getDisplayPrice(stop.selectedAccommodation).value,
                stop.selectedAccommodation,
              )
            }}
          </span>
          <span
            v-if="getDisplayPriceInEUR(stop.selectedAccommodation)"
            class="text-[10px] text-primary-700/70 font-medium ml-1"
          >
            ({{ getDisplayPriceInEUR(stop.selectedAccommodation) }})
          </span>
          <span
            class="text-[10px] text-primary-600/70 font-medium uppercase tracking-tight"
          >
            {{ getDisplayPrice(stop.selectedAccommodation).label }}
          </span>
          <span
            v-if="getDisplayPriceInTripCurrency(stop.selectedAccommodation)"
            class="text-[10px] text-primary-500 font-bold ml-1"
          >
            ({{ getDisplayPriceInTripCurrency(stop.selectedAccommodation) }})
          </span>
          <span
            v-if="getSecondaryPrice(stop.selectedAccommodation)"
            class="text-[10px] text-primary-500 italic ml-1"
          >
            ({{
              formatCurrency(
                getSecondaryPrice(stop.selectedAccommodation)!.value,
                stop.selectedAccommodation,
              )
            }}{{ getSecondaryPrice(stop.selectedAccommodation)!.label }})
          </span>
        </div>
      </div>
    </div>
    <div class="flex items-center gap-1 shrink-0 ml-auto pr-2">
      <UTooltip
        :content="{ align: 'center', side: 'top', sideOffset: 8 }"
        arrow
        text="View Details"
      >
        <UPopover
          v-if="stop.selectedAccommodation"
          :content="{ align: 'center', side: 'top', sideOffset: 8 }"
          arrow
        >
          <UButton
            color="neutral"
            icon="i-lucide-eye"
            size="md"
            variant="link"
            @click.stop
          />
          <template #content>
            <AccommodationsAccommodationDetails
              :accommodation="stop.selectedAccommodation"
              :date-range="dateRange"
              :nights="nights"
            />
          </template>
        </UPopover>
      </UTooltip>
      <div class="w-8 flex justify-center">
        <UTooltip
          v-if="stop.selectedAccommodation?.url"
          :content="{
            align: 'center',
            side: 'top',
            sideOffset: 8,
          }"
          arrow
          text="Open booking URL"
        >
          <UButton
            :to="stop.selectedAccommodation.url"
            color="neutral"
            icon="i-lucide-external-link"
            target="_blank"
            variant="link"
            @click.stop
          />
        </UTooltip>
      </div>
      <UTooltip
        :content="{
          align: 'center',
          side: 'top',
          sideOffset: 8,
        }"
        arrow
        text="Manage accommodations"
      >
        <UButton
          color="neutral"
          icon="i-lucide-settings-2"
          variant="link"
          @click.stop="$emit('toggleExpand')"
        />
      </UTooltip>

      <UIcon
        :class="isExpanded ? 'rotate-180' : ''"
        class="size-4 text-primary-400 transition-transform duration-200"
        name="i-lucide-chevron-down"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Currency, TripStop } from "~/types/tripTypes";
import { useCurrencyUtils } from "~/composables/useCurrencyUtils";

const props = defineProps<{
  stop: TripStop;
  isExpanded: boolean;
  dateRange: string;
  nights: number;
  tripCurrency?: Currency;
}>();

defineEmits<{
  (e: "toggleExpand"): void;
}>();

const { convertToEUR, formatEUR } = useCurrencyUtils();

const getDisplayPrice = (acc: any): { value: number; label: string } => {
  if (acc.totalPrice) return { value: Number(acc.totalPrice), label: "total" };
  if (acc.nightlyRate) {
    const total = Number(acc.nightlyRate) * props.nights;
    return { value: total, label: "total est." };
  }
  return { value: 0, label: "total" };
};

const getSecondaryPrice = (
  acc: any,
): { value: number; label: string } | null => {
  if (acc.totalPrice && props.nights > 0) {
    return { value: Number(acc.totalPrice) / props.nights, label: "/ night" };
  }
  if (acc.nightlyRate) {
    return { value: Number(acc.nightlyRate), label: "/ night" };
  }
  return null;
};

const formatCurrency = (val: number | string, acc?: any) => {
  const v = Number(val) || 0;
  const symbol =
    acc?.currency?.symbol ||
    props.stop.selectedAccommodation?.currency?.symbol ||
    "€";
  const formatted = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);
  return `${symbol}${formatted}`;
};

const getDisplayPriceInTripCurrency = (acc: any) => {
  if (
    !props.tripCurrency ||
    !acc.currencyId ||
    props.tripCurrency.id === acc.currencyId
  ) {
    return null;
  }

  const { value } = getDisplayPrice(acc);
  if (value <= 0) return null;

  const totalEUR = convertToEUR(value, acc.currencyId);
  const rateToEUR = Number(props.tripCurrency.rateToEUR) || 1;
  const totalInTripCurrency = totalEUR / rateToEUR;

  const formatted = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(totalInTripCurrency);
  return `${props.tripCurrency.symbol}${formatted}`;
};

const getDisplayPriceInEUR = (acc: any) => {
  if (!acc?.currencyId) return null;
  if ((acc?.currency?.symbol || "").toUpperCase() === "EUR") return null;
  const { value } = getDisplayPrice(acc);
  if (!value || value <= 0) return null;
  const eur = convertToEUR(value, acc.currencyId);
  return formatEUR(eur);
};
</script>
