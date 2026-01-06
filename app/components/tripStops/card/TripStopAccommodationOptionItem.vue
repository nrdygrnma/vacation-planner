<template>
  <div
    :class="
      isSelected
        ? 'border-primary-200 bg-primary-50/30 ring-1 ring-primary-100'
        : 'border-gray-300 hover:border-gray-400 bg-gray-50/30'
    "
    class="border rounded-md flex items-center justify-between transition-all group/item overflow-hidden h-11"
  >
    <div class="flex items-center gap-2 min-w-0 flex-1 h-full">
      <div v-if="acc.images?.[0]?.url" class="w-12 h-full shrink-0 relative">
        <img
          :src="acc.images[0].url"
          alt="Stay"
          class="size-full object-cover"
        />
        <div
          v-if="acc.images.length > 1"
          class="absolute bottom-0 right-0 bg-black/50 text-[8px] text-white px-0.5 font-bold z-10"
        >
          +{{ acc.images.length - 1 }}
        </div>
      </div>
      <div
        v-else
        class="w-12 h-full bg-gray-100 flex items-center justify-center shrink-0"
      >
        <UIcon
          :class="isSelected ? 'text-primary-600' : 'text-gray-400'"
          class="size-4"
          name="i-lucide-bed"
        />
      </div>
      <div class="min-w-0 py-0.5">
        <div class="flex items-center gap-1.5 min-w-0">
          <UIcon
            :class="isSelected ? 'text-primary-600' : 'text-gray-400'"
            class="size-3 shrink-0"
            name="i-lucide-bed"
          />
          <p class="text-xs font-semibold text-gray-900 truncate">
            {{ acc.name }}
          </p>
        </div>
        <div class="flex items-center gap-2 ml-4">
          <p class="text-[10px] text-gray-500 truncate flex items-center gap-1">
            <UIcon class="size-2.5 opacity-70" name="i-lucide-info" />d
            {{ acc.roomType?.name || "Standard" }}
          </p>
          <span class="text-[8px] text-gray-300">|</span>
          <p class="text-[10px] text-gray-500 truncate flex items-center gap-1">
            <UIcon class="size-2.5 opacity-70" name="i-lucide-building" />
            {{ acc.provider || "Direct" }}
          </p>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-2 flex-1 shrink-0 justify-end">
      <div class="text-right">
        <p
          class="text-[13px] font-extrabold text-gray-700 whitespace-nowrap leading-tight"
        >
          {{ formatCurrency(getDisplayPrice(acc).value, acc) }}
        </p>
        <div class="flex items-center justify-end gap-1">
          <p
            class="text-[9px] text-gray-400 uppercase font-bold tracking-tighter"
          >
            {{ getDisplayPrice(acc).label }}
          </p>
          <template v-if="getDisplayPriceInTripCurrency(acc)">
            <p class="text-[9px] text-primary-500 font-bold ml-1">
              ({{ getDisplayPriceInTripCurrency(acc) }})
            </p>
          </template>
          <template v-if="getSecondaryPrice(acc)">
            <p class="text-[9px] text-gray-400 italic">
              ({{ formatCurrency(getSecondaryPrice(acc)!.value, acc)
              }}{{ getSecondaryPrice(acc)!.label }})
            </p>
          </template>
        </div>
      </div>

      <div
        class="flex items-center border-l pl-2 pr-2 gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity min-w-[130px] justify-end"
      >
        <UTooltip
          v-if="!isSelected"
          :content="{
            align: 'center',
            side: 'top',
            sideOffset: 8,
          }"
          arrow
          text="Select option"
        >
          <UButton
            color="success"
            icon="i-lucide-check"
            variant="outline"
            @click="$emit('select', acc.id)"
          />
        </UTooltip>

        <UTooltip
          v-else
          :content="{
            align: 'center',
            side: 'top',
            sideOffset: 8,
          }"
          arrow
          text="Deselect option"
        >
          <UButton
            color="neutral"
            icon="i-lucide-x"
            variant="outline"
            @click="$emit('select', null)"
          />
        </UTooltip>

        <UTooltip
          :content="{ align: 'center', side: 'top', sideOffset: 8 }"
          arrow
          text="View Details"
        >
          <UPopover
            :content="{
              align: 'center',
              side: 'top',
              sideOffset: 8,
            }"
            arrow
          >
            <UButton
              color="neutral"
              icon="i-lucide-eye"
              variant="outline"
              @click.stop
            />

            <template #content>
              <AccommodationsAccommodationDetails
                :accommodation="acc"
                :date-range="dateRange"
                :nights="nights"
              />
            </template>
          </UPopover>
        </UTooltip>

        <div class="w-8 flex justify-center">
          <UTooltip
            :content="{
              align: 'center',
              side: 'top',
              sideOffset: 8,
            }"
            arrow
            text="Open Booking URL"
          >
            <UButton
              v-if="acc.url"
              :to="acc.url"
              color="neutral"
              icon="i-lucide-external-link"
              target="blank"
              variant="outline"
              @click.stop
            />
          </UTooltip>
        </div>
        <UTooltip
          :content="{ align: 'center', side: 'top', sideOffset: 8 }"
          arrow
          text="Edit"
        >
          <UButton
            color="neutral"
            icon="i-lucide-edit"
            variant="outline"
            @click="$emit('edit', acc)"
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
            @click="$emit('delete', acc.id)"
          />
        </UTooltip>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { AccommodationOption, Currency } from "~/types/tripTypes";
import { useCurrencyUtils } from "~/composables/useCurrencyUtils";

const props = defineProps<{
  acc: AccommodationOption;
  isSelected: boolean;
  dateRange: string;
  nights: number;
  tripCurrency?: Currency;
}>();

defineEmits<{
  (e: "select", id: string | null): void;
  (e: "edit", acc: AccommodationOption): void;
  (e: "delete", id: string): void;
}>();

const { convertToEUR } = useCurrencyUtils();

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
  const symbol = acc?.currency?.symbol || "€";
  return `${symbol}${v.toFixed(2)}`;
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

  return `${props.tripCurrency.symbol}${totalInTripCurrency.toFixed(2)}`;
};
</script>
