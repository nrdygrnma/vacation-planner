<template>
  <div v-if="accommodation" class="space-y-1.5">
    <div class="flex items-start gap-3">
      <div
        v-if="accommodation.images?.[0]?.url"
        :class="[
          'size-8 rounded overflow-hidden shrink-0 border shadow-sm',
          isCurrent ? 'border-primary-200' : 'border-gray-200',
        ]"
      >
        <img
          :src="accommodation.images[0].url"
          class="size-full object-cover"
        />
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-1.5">
          <div
            :class="[
              'font-medium truncate',
              isCurrent ? 'text-gray-900' : 'text-gray-700',
            ]"
          >
            {{ accommodation.name }}
          </div>
          <UPopover v-if="accommodation.notes" mode="hover">
            <UIcon
              :class="[
                'size-3.5 cursor-help shrink-0',
                isCurrent ? 'text-primary-500' : 'text-gray-400',
              ]"
              name="i-lucide-info"
            />
            <template #content>
              <div class="p-2 text-xs max-w-xs whitespace-pre-wrap italic">
                {{ accommodation.notes }}
              </div>
            </template>
          </UPopover>
        </div>

        <div
          v-if="accommodation.roomType?.name"
          class="text-[9px] text-gray-400 font-bold uppercase tracking-tight"
        >
          {{ accommodation.roomType.name }}
        </div>

        <div
          :class="[
            'text-[11px] font-bold mt-0.5',
            isCurrent ? 'text-primary-600' : 'text-gray-500',
          ]"
        >
          {{ formatEUR(price) }}
        </div>
      </div>
    </div>
  </div>
  <div
    v-else-if="isHub"
    class="flex items-center gap-1.5 text-primary-600/60 font-medium italic text-xs"
  >
    <UIcon class="size-3" name="i-lucide-plane-landing" />
    Transit Point
  </div>
  <div v-else class="text-gray-400 italic text-xs">—</div>
</template>

<script lang="ts" setup>
import { useCurrencyUtils } from "@/composables/useCurrencyUtils";

defineProps<{
  accommodation: any;
  price: number;
  isCurrent?: boolean;
  isHub?: boolean;
}>();

const { formatEUR } = useCurrencyUtils();
</script>
