<template>
  <UModal
    v-model:open="model"
    :ui="{ footer: 'justify-end' }"
    description="Our AI engine analyzes your snapshots to find the best options based on price and convenience."
    title="Automated Reasoning"
  >
    <template #body>
      <div v-if="analysis" class="space-y-4">
        <!-- Best Value -->
        <div
          v-if="analysis.bestValue"
          class="p-4 bg-primary-50 border border-primary-100 rounded-xl"
        >
          <div class="flex items-center gap-2 mb-2">
            <UBadge color="primary" variant="subtle">
              <UIcon class="size-3.5 mr-1" name="i-lucide-trending-down" />
              Best Value
            </UBadge>
          </div>
          <h4 class="font-bold text-gray-900 mb-1">
            {{ analysis.bestValue.name }}
          </h4>
          <p class="text-sm text-gray-600 leading-relaxed">
            This is your most affordable option at
            <span class="font-bold text-primary-700">{{
              formatEUR(Number(analysis.bestValue.totalCostEUR))
            }}</span>
            per person.
            <template v-if="people > 1">
              (Grand total:
              {{ formatEUR(Number(analysis.bestValue.totalCostEUR) * people) }})
            </template>
          </p>
        </div>

        <!-- Most Convenient -->
        <div
          v-if="analysis.mostConvenient"
          class="p-4 bg-orange-50 border border-orange-100 rounded-xl"
        >
          <div class="flex items-center gap-2 mb-2">
            <UBadge color="neutral" variant="subtle">
              <UIcon class="size-3.5 mr-1" name="i-lucide-zap" />
              Most Convenient
            </UBadge>
          </div>
          <h4 class="font-bold text-gray-900 mb-1">
            {{ analysis.mostConvenient.name }}
          </h4>
          <p class="text-sm text-gray-600 leading-relaxed">
            Offers the best flight experience with
            {{
              analysis.mostConvenient.flight?.stops === 0
                ? "non-stop"
                : analysis.mostConvenient.flight?.stops + " stop(s)"
            }}
            and optimized transit times.
          </p>
        </div>

        <div v-if="analysis.summary" class="px-1 text-sm text-gray-500 italic">
          {{ analysis.summary }}
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end w-full">
        <UButton
          color="neutral"
          label="Close"
          variant="outline"
          @click="model = false"
        />
      </div>
    </template>
  </UModal>
</template>

<script lang="ts" setup>
import { useCurrencyUtils } from "@/composables/useCurrencyUtils";

const props = defineProps<{
  open: boolean;
  analysis: any;
  people: number;
}>();

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
}>();

const model = computed({
  get: () => props.open,
  set: (v) => emit("update:open", v),
});

const { formatEUR } = useCurrencyUtils();
</script>
