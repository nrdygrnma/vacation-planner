<template>
  <div v-if="rental" class="space-y-1.5">
    <div class="flex items-center gap-2">
      <div
        v-if="rental.imageUrl"
        :class="[
          'size-8 rounded overflow-hidden shrink-0 border shadow-sm',
          isCurrent ? 'border-primary-200' : 'border-gray-200',
        ]"
      >
        <img :src="rental.imageUrl" class="size-full object-cover" />
      </div>
      <div
        :class="[
          'font-medium truncate',
          isCurrent ? 'text-gray-900' : 'text-gray-700',
        ]"
      >
        {{ rental.provider }}
      </div>
      <UPopover v-if="rental.notes" mode="hover">
        <UIcon
          :class="[
            'size-3.5 cursor-help shrink-0',
            isCurrent ? 'text-primary-500' : 'text-gray-400',
          ]"
          name="i-lucide-info"
        />
        <template #content>
          <div class="p-2 text-xs max-w-xs whitespace-pre-wrap italic">
            {{ rental.notes }}
          </div>
        </template>
      </UPopover>
    </div>
    <div
      :class="[
        'text-[11px] font-bold ml-10',
        isCurrent ? 'text-primary-600' : 'text-gray-500',
      ]"
    >
      {{ formatEUR(price) }}
    </div>
  </div>
  <div v-else class="text-gray-400 italic text-xs">—</div>
</template>

<script lang="ts" setup>
import { useCurrencyUtils } from "@/composables/useCurrencyUtils";

defineProps<{
  rental: any;
  price: number;
  isCurrent?: boolean;
}>();

const { formatEUR } = useCurrencyUtils();
</script>
